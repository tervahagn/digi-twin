import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSurveySchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create or get existing survey by email
  app.post("/api/surveys", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Check if survey already exists for this email
      let survey = await storage.getSurveyByEmail(email);
      
      if (!survey) {
        // Create new survey
        survey = await storage.createSurvey({ email, isCompleted: false });
      }
      
      res.json(survey);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof z.ZodError ? error.errors : "Invalid survey data" 
      });
    }
  });

  // Get survey by email (for continuing surveys)
  app.get("/api/surveys/by-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const survey = await storage.getSurveyByEmail(email);
      
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      
      const responses = await storage.getResponsesBySurveyId(survey.id);
      res.json({ survey, responses });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch survey" });
    }
  });

  // Save individual response (for intermediate saves)
  app.post("/api/responses", async (req, res) => {
    try {
      const { surveyId, questionId, responseType, textAnswer, audioUrl, wordCount } = req.body;
      
      // Check if response already exists for this question
      const existingResponse = await storage.getResponseByQuestionId(surveyId, questionId);
      
      if (existingResponse) {
        // Update existing response
        const updatedResponse = await storage.updateResponse(existingResponse.id, {
          responseType,
          textAnswer: textAnswer || null,
          audioUrl: audioUrl || null,
          wordCount: wordCount || null,
        });
        res.json(updatedResponse);
      } else {
        // Create new response
        const validatedResponse = insertResponseSchema.parse({
          surveyId,
          questionId,
          responseType,
          textAnswer: textAnswer || null,
          audioUrl: audioUrl || null,
          wordCount: wordCount || null,
        });
        const response = await storage.createResponse(validatedResponse);
        res.json(response);
      }
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof z.ZodError ? error.errors : "Invalid response data" 
      });
    }
  });

  // Get survey responses with progress
  app.get("/api/surveys/:id/responses", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const responses = await storage.getResponsesBySurveyId(surveyId);
      const survey = await storage.getSurvey(surveyId);
      
      res.json({ 
        survey,
        responses, 
        progress: {
          answered: responses.length,
          total: 87 // Total number of questions
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Complete survey
  app.post("/api/surveys/:id/complete", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const updatedSurvey = await storage.updateSurvey(surveyId, {
        isCompleted: true,
        completedAt: new Date()
      });
      res.json(updatedSurvey);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete survey" });
    }
  });

  // Download survey data as JSON
  app.get("/api/surveys/:id/download", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const survey = await storage.getSurvey(surveyId);
      const responses = await storage.getResponsesBySurveyId(surveyId);
      
      if (!survey) {
        return res.status(404).json({ error: "Survey not found" });
      }
      
      const exportData = {
        survey: {
          id: survey.id,
          email: survey.email,
          isCompleted: survey.isCompleted,
          completedAt: survey.completedAt,
          createdAt: survey.createdAt
        },
        responses: responses.map(r => ({
          questionId: r.questionId,
          responseType: r.responseType,
          textAnswer: r.textAnswer,
          audioUrl: r.audioUrl,
          wordCount: r.wordCount,
          createdAt: r.createdAt
        })),
        metadata: {
          totalQuestions: 87,
          answeredQuestions: responses.length,
          completionPercentage: Math.round((responses.length / 87) * 100),
          exportedAt: new Date().toISOString()
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="digitwin-survey-${survey.email}-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export survey data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

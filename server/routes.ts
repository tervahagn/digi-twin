import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSurveySchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Survey completion endpoint
  app.post("/api/surveys", async (req, res) => {
    try {
      const validatedSurvey = insertSurveySchema.parse(req.body);
      const survey = await storage.createSurvey(validatedSurvey);
      res.json(survey);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof z.ZodError ? error.errors : "Invalid survey data" 
      });
    }
  });

  // Submit responses endpoint
  app.post("/api/responses", async (req, res) => {
    try {
      const validatedResponse = insertResponseSchema.parse(req.body);
      const response = await storage.createResponse(validatedResponse);
      res.json(response);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof z.ZodError ? error.errors : "Invalid response data" 
      });
    }
  });

  // Get survey responses
  app.get("/api/surveys/:id/responses", async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const responses = await storage.getResponsesBySurveyId(surveyId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  // Batch submit responses (for completing entire survey at once)
  app.post("/api/surveys/submit", async (req, res) => {
    try {
      const { email, responses } = req.body;
      
      // Create survey
      const survey = await storage.createSurvey({ email });
      
      // Create all responses
      const savedResponses = await Promise.all(
        responses.map((response: any) => 
          storage.createResponse({
            ...response,
            surveyId: survey.id
          })
        )
      );
      
      res.json({ survey, responses: savedResponses });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit survey" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

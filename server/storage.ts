import { 
  users, 
  surveys, 
  responses,
  type User, 
  type InsertUser,
  type Survey,
  type InsertSurvey,
  type Response,
  type InsertResponse 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Survey methods
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveyByEmail(email: string): Promise<Survey | undefined>;
  updateSurvey(id: number, updates: { isCompleted?: boolean; completedAt?: Date }): Promise<Survey>;
  
  // Response methods
  createResponse(response: InsertResponse): Promise<Response>;
  updateResponse(id: number, response: Partial<InsertResponse>): Promise<Response>;
  getResponsesBySurveyId(surveyId: number): Promise<Response[]>;
  getResponseByQuestionId(surveyId: number, questionId: string): Promise<Response | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private surveys: Map<number, Survey>;
  private responses: Map<number, Response>;
  private currentUserId: number;
  private currentSurveyId: number;
  private currentResponseId: number;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.responses = new Map();
    this.currentUserId = 1;
    this.currentSurveyId = 1;
    this.currentResponseId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = this.currentSurveyId++;
    const survey: Survey = { 
      ...insertSurvey,
      id,
      isCompleted: insertSurvey.isCompleted || false,
      completedAt: insertSurvey.isCompleted ? new Date() : null,
      createdAt: new Date()
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async getSurveyByEmail(email: string): Promise<Survey | undefined> {
    return Array.from(this.surveys.values()).find(
      (survey) => survey.email === email
    );
  }

  async updateSurvey(id: number, updates: { isCompleted?: boolean; completedAt?: Date }): Promise<Survey> {
    const survey = this.surveys.get(id);
    if (!survey) {
      throw new Error('Survey not found');
    }
    const updatedSurvey = { 
      ...survey, 
      ...updates,
      completedAt: updates.isCompleted ? (updates.completedAt || new Date()) : survey.completedAt
    };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = this.currentResponseId++;
    const response: Response = { 
      ...insertResponse,
      textAnswer: insertResponse.textAnswer || null,
      audioUrl: insertResponse.audioUrl || null,
      wordCount: insertResponse.wordCount || null,
      id, 
      createdAt: new Date() 
    };
    this.responses.set(id, response);
    return response;
  }

  async updateResponse(id: number, responseData: Partial<InsertResponse>): Promise<Response> {
    const response = this.responses.get(id);
    if (!response) {
      throw new Error('Response not found');
    }
    const updatedResponse = {
      ...response,
      ...responseData,
      textAnswer: responseData.textAnswer ?? response.textAnswer,
      audioUrl: responseData.audioUrl ?? response.audioUrl,
      wordCount: responseData.wordCount ?? response.wordCount,
    };
    this.responses.set(id, updatedResponse);
    return updatedResponse;
  }

  async getResponsesBySurveyId(surveyId: number): Promise<Response[]> {
    return Array.from(this.responses.values()).filter(
      (response) => response.surveyId === surveyId
    );
  }

  async getResponseByQuestionId(surveyId: number, questionId: string): Promise<Response | undefined> {
    return Array.from(this.responses.values()).find(
      (response) => response.surveyId === surveyId && response.questionId === questionId
    );
  }
}

export const storage = new MemStorage();

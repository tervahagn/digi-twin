import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Question {
  id: string;
  section: string;
  question: string;
  purpose: string;
  requirement: string;
  minWords?: number;
  minAudioMinutes?: number;
}

export interface Answer {
  questionId: string;
  responseType: 'text' | 'audio';
  textAnswer?: string;
  audioBlob?: Blob;
  wordCount?: number;
}

export interface Survey {
  id: number;
  email: string;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  questionId: string;
  responseType: string;
  textAnswer: string | null;
  audioUrl: string | null;
  wordCount: number | null;
  createdAt: Date;
}

export const useSurvey = (email: string) => {
  const queryClient = useQueryClient();
  
  // Get or create survey
  const { data: surveyData, isLoading } = useQuery({
    queryKey: ['survey', email],
    queryFn: async () => {
      if (!email) return null;
      
      try {
        // Import API wrapper
        const { api } = await import('@/lib/api');
        
        // Try to get existing survey
        const response = await api.get(`/api/surveys/by-email/${encodeURIComponent(email)}`);
        if (response.ok) {
          return response.json();
        }
        
        // Create new survey if doesn't exist
        const createResponse = await api.post('/api/surveys', { email });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create survey');
        }
        
        const survey = await createResponse.json();
        return { survey, responses: [] };
      } catch (error) {
        console.error('Error with survey:', error);
        throw error;
      }
    },
    enabled: !!email,
  });

  // Save individual response
  const saveResponseMutation = useMutation({
    mutationFn: async (responseData: {
      surveyId: number;
      questionId: string;
      responseType: string;
      textAnswer?: string;
      audioUrl?: string;
      wordCount?: number;
    }) => {
      const { api } = await import('@/lib/api');
      const response = await api.post('/api/responses', {
        surveyId,
        questionId,
        responseType,
        textAnswer,
        audioAnswer,
        wordCount,
      });
      
      if (!response.ok) {
        throw new Error('Failed to save response');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch survey data
      queryClient.invalidateQueries({ queryKey: ['survey', email] });
    },
  });

  // Complete survey
  const completeSurveyMutation = useMutation({
    mutationFn: async (surveyId: number) => {
      const { api } = await import('@/lib/api');
      const response = await api.post(`/api/surveys/${surveyId}/complete`, {});
      
      if (!response.ok) {
        throw new Error('Failed to complete survey');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey', email] });
    },
  });

  // Download survey data
  const downloadSurvey = useCallback(async (surveyId: number, filename?: string) => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.get(`/api/surveys/${surveyId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download survey data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename || `digitwin-survey-${email}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading survey:', error);
      throw error;
    }
  }, [email]);

  return {
    survey: surveyData?.survey,
    responses: surveyData?.responses || [],
    isLoading,
    saveResponse: saveResponseMutation.mutate,
    isSaving: saveResponseMutation.isPending,
    completeSurvey: completeSurveyMutation.mutate,
    isCompleting: completeSurveyMutation.isPending,
    downloadSurvey,
  };
};
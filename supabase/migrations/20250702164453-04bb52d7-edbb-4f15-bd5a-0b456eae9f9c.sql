
-- Create table to store survey responses
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  responses JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store individual question responses for easier querying
CREATE TABLE public.question_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_response_id UUID REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  section TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response_type TEXT NOT NULL CHECK (response_type IN ('text', 'audio')),
  text_answer TEXT,
  audio_blob_url TEXT,
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_survey_responses_email ON public.survey_responses(email);
CREATE INDEX idx_survey_responses_completed_at ON public.survey_responses(completed_at);
CREATE INDEX idx_question_responses_survey_id ON public.question_responses(survey_response_id);

-- Enable Row Level Security (make tables public for now since this is a public survey)
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a public survey)
CREATE POLICY "Anyone can insert survey responses" 
  ON public.survey_responses 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view survey responses" 
  ON public.survey_responses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update survey responses" 
  ON public.survey_responses 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can insert question responses" 
  ON public.question_responses 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view question responses" 
  ON public.question_responses 
  FOR SELECT 
  USING (true);

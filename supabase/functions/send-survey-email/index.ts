
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  email: string;
  surveyResponseId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, surveyResponseId }: EmailRequest = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing email request for:', email);

    // Fetch the survey response data
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('id', surveyResponseId)
      .single();

    if (surveyError) {
      console.error('Error fetching survey data:', surveyError);
      throw new Error('Failed to fetch survey data');
    }

    // Fetch individual question responses
    const { data: questionResponses, error: questionError } = await supabase
      .from('question_responses')
      .select('*')
      .eq('survey_response_id', surveyResponseId)
      .order('created_at');

    if (questionError) {
      console.error('Error fetching question responses:', questionError);
      throw new Error('Failed to fetch question responses');
    }

    // Create email content
    const emailContent = createEmailContent(surveyData, questionResponses);

    // For now, we'll just log the email content
    // In a real implementation, you would integrate with an email service like Resend
    console.log('Email content prepared for:', email);
    console.log('Survey completed at:', surveyData.completed_at);
    console.log('Total responses:', questionResponses.length);

    // Update the survey response to mark email as sent
    const { error: updateError } = await supabase
      .from('survey_responses')
      .update({ 
        email_sent: true, 
        email_sent_at: new Date().toISOString() 
      })
      .eq('id', surveyResponseId);

    if (updateError) {
      console.error('Error updating email status:', updateError);
      throw new Error('Failed to update email status');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Survey response processed and email prepared',
        surveyId: surveyResponseId
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-survey-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

function createEmailContent(surveyData: any, questionResponses: any[]): string {
  const totalTextResponses = questionResponses.filter(r => r.response_type === 'text').length;
  const totalAudioResponses = questionResponses.filter(r => r.response_type === 'audio').length;
  const totalWords = questionResponses
    .filter(r => r.word_count)
    .reduce((sum, r) => sum + r.word_count, 0);

  return `
    DigiTwin Survey Completion Summary
    
    Thank you for completing the DigiTwin survey!
    
    Survey Details:
    - Completed at: ${new Date(surveyData.completed_at).toLocaleString()}
    - Total questions answered: ${questionResponses.length}
    - Text responses: ${totalTextResponses}
    - Audio responses: ${totalAudioResponses}
    - Total words written: ${totalWords}
    
    Your responses have been securely stored and will be used to create your digital twin.
    
    We will be in touch soon with next steps.
    
    Best regards,
    The DigiTwin Team
  `;
}

serve(handler);

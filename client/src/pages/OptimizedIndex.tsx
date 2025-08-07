import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Mic, Download, Save } from 'lucide-react';
import { useSurvey } from '@/hooks/useSurvey';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Question {
  id: string;
  section: string;
  question: string;
  purpose: string;
  requirement: string;
  minWords?: number;
  minAudioMinutes?: number;
}

const QUESTIONS: Question[] = [
  // Section 1: Biography & Personal History
  {
    id: '1.1',
    section: 'Biography & Personal History',
    question: 'What is your full name, all nicknames, surnames, pseudonyms you have used in your life?',
    purpose: 'identification, connection to different life periods',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '1.2',
    section: 'Biography & Personal History',
    question: 'Describe the key childhood events that shaped you.',
    purpose: 'reveal emotional and behavioral origins',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '1.3',
    section: 'Biography & Personal History',
    question: 'Which people in your childhood played a major role in your development?',
    purpose: 'identify influential figures and patterns',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  }
];

const OptimizedIndex = () => {
  const [email, setEmail] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responseType, setResponseType] = useState<'text' | 'audio'>('text');
  const [textResponse, setTextResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { 
    survey, 
    responses, 
    isLoading, 
    saveResponse, 
    isSaving, 
    completeSurvey, 
    isCompleting,
    downloadSurvey 
  } = useSurvey(email);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const wordCount = textResponse.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isTextRequirementMet = !currentQuestion?.minWords || wordCount >= currentQuestion.minWords;
  const isAudioRequirementMet = !currentQuestion?.minAudioMinutes || (audioBlob && recordingTime >= currentQuestion.minAudioMinutes * 60);
  const canProceed = responseType === 'text' ? isTextRequirementMet : isAudioRequirementMet;

  // Load existing response when question changes
  useEffect(() => {
    if (responses && currentQuestion) {
      const existingResponse = responses.find((r: any) => r.questionId === currentQuestion.id);
      if (existingResponse) {
        setResponseType(existingResponse.responseType as 'text' | 'audio');
        setTextResponse(existingResponse.textAnswer || '');
      } else {
        setTextResponse('');
        setAudioBlob(null);
      }
    }
  }, [currentQuestionIndex, responses, currentQuestion]);

  // Auto-save with debouncing
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (survey && currentQuestion && (textResponse.trim() || audioBlob)) {
        saveResponse({
          surveyId: survey.id,
          questionId: currentQuestion.id,
          responseType,
          textAnswer: responseType === 'text' ? textResponse : undefined,
          audioUrl: undefined, // Audio handling would need separate upload endpoint
          wordCount: responseType === 'text' ? wordCount : undefined,
        });
      }
    }, 2000);
  }, [survey, currentQuestion, responseType, textResponse, audioBlob, wordCount, saveResponse]);

  // Trigger auto-save when text changes
  useEffect(() => {
    if (responseType === 'text' && textResponse.trim()) {
      debouncedSave();
    }
  }, [textResponse, debouncedSave, responseType]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        // Auto-save audio response
        if (survey && currentQuestion) {
          saveResponse({
            surveyId: survey.id,
            questionId: currentQuestion.id,
            responseType: 'audio',
            audioUrl: undefined, // Would need upload endpoint
          });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Complete survey
      if (survey) {
        completeSurvey(survey.id);
      }
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleDownload = () => {
    if (survey) {
      downloadSurvey(survey.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Email collection screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">DigiTwin Survey</CardTitle>
            <p className="text-slate-600">
              Preserve your life story and personality for future generations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <p className="text-sm text-slate-500 mt-1">
                We'll use this to save your progress and send you your results
              </p>
            </div>
            <Button 
              onClick={() => {
                if (email.trim()) {
                  setHasStarted(true);
                }
              }}
              disabled={!email.trim()}
              className="w-full"
            >
              Start Survey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your survey...</p>
        </div>
      </div>
    );
  }

  const answeredQuestions = responses?.length || 0;
  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800">DigiTwin Survey</h1>
              <p className="text-sm text-slate-600">{email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </Button>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Save size={16} className="animate-pulse" />
                  Saving...
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 whitespace-nowrap">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
              {progressPercentage}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-slate-500 mb-2">
                  {currentQuestion.section}
                </div>
                <CardTitle className="text-lg leading-relaxed mb-3">
                  {currentQuestion.question}
                </CardTitle>
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Purpose:</strong> {currentQuestion.purpose}</p>
                  <p><strong>Requirement:</strong> {currentQuestion.requirement}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Response type selector */}
            <div>
              <Label className="text-base font-medium">Response Type</Label>
              <RadioGroup
                value={responseType}
                onValueChange={(value) => setResponseType(value as 'text' | 'audio')}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text">Text Response</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <Label htmlFor="audio">Audio Response</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Text response */}
            {responseType === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Share your thoughts here..."
                  className="min-h-[200px] resize-none"
                />
                <div className="flex justify-between text-sm">
                  <span className={`${
                    isTextRequirementMet ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {wordCount} words
                    {currentQuestion.minWords && ` (${currentQuestion.minWords} required)`}
                  </span>
                  {isTextRequirementMet && (
                    <span className="text-green-600">✓ Requirement met</span>
                  )}
                </div>
              </div>
            )}

            {/* Audio response */}
            {responseType === 'audio' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="flex items-center gap-2"
                    >
                      <Mic size={16} />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Square size={16} />
                      Stop Recording
                    </Button>
                  )}
                  
                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span>{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>

                {audioBlob && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      {!isPlaying ? (
                        <Button
                          onClick={playAudio}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Play size={16} />
                          Play
                        </Button>
                      ) : (
                        <Button
                          onClick={stopAudio}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Pause size={16} />
                          Stop
                        </Button>
                      )}
                      
                      <span className="text-sm text-slate-600">
                        Recording: {formatTime(recordingTime)}
                        {currentQuestion.minAudioMinutes && 
                          ` (${currentQuestion.minAudioMinutes} min required)`
                        }
                      </span>
                      
                      {isAudioRequirementMet && (
                        <span className="text-green-600 text-sm">✓ Requirement met</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              <Button
                onClick={goToNext}
                disabled={!canProceed}
                className="flex items-center gap-2"
              >
                {currentQuestionIndex === totalQuestions - 1 ? (
                  <>Complete Survey</>
                ) : (
                  <>Next</>
                )}
                {isCompleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OptimizedIndex;
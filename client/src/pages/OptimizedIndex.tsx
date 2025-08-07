import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Mic, Download, Save, Mail, Bot, ChevronDown, ChevronUp, FileText, ChevronLeft, ChevronRight, User } from 'lucide-react';
import logoPath from '@assets/logo 3_1754592565987.png';
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
  },
  {
    id: '1.4',
    section: 'Biography & Personal History',
    question: 'What events in your youth influenced your worldview?',
    purpose: 'capture a pivotal period of worldview change',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '1.5',
    section: 'Biography & Personal History',
    question: 'What were the happiest and most difficult moments in your life? Describe each.',
    purpose: 'form an emotional scale of personality',
    requirement: '≥ 600 words or 4 minutes audio',
    minWords: 600,
    minAudioMinutes: 4
  },
  {
    id: '1.6',
    section: 'Biography & Personal History',
    question: 'Tell about turning points—decisions that changed your life.',
    purpose: 'identify key choices and their impact',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  {
    id: '1.7',
    section: 'Biography & Personal History',
    question: 'Imagine your life as a book—what would you call the chapters?',
    purpose: 'reveal self-narrative and structure of your life path',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 2: Values, Beliefs & Character Traits
  {
    id: '2.1',
    section: 'Values, Beliefs & Character Traits',
    question: 'What qualities do you value most in yourself?',
    purpose: 'record the core of self-identity',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '2.2',
    section: 'Values, Beliefs & Character Traits',
    question: 'What qualities in people are unacceptable to you? Why?',
    purpose: 'identify negative triggers in social interaction',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '2.3',
    section: 'Values, Beliefs & Character Traits',
    question: 'What life principles do you try to follow?',
    purpose: 'record behavioral attitudes',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '2.4',
    section: 'Values, Beliefs & Character Traits',
    question: 'Your credo or life motto.',
    purpose: 'establish core motivation',
    requirement: '≥ 150 words or 1 minute audio',
    minWords: 150,
    minAudioMinutes: 1
  },
  {
    id: '2.5',
    section: 'Values, Beliefs & Character Traits',
    question: 'Were there moments when you changed your beliefs? Why?',
    purpose: 'understand flexibility of thinking and evolution of values',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  // Section 3: Relationships & Significant People
  {
    id: '3.1',
    section: 'Relationships & Significant People',
    question: 'Who were the most important people in your life? What exactly did they give you?',
    purpose: 'identify emotional anchors and life guidelines',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '3.2',
    section: 'Relationships & Significant People',
    question: 'Is there someone you no longer communicate with, but who greatly influenced your life?',
    purpose: 'record ambiguous or forgotten influences',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '3.3',
    section: 'Relationships & Significant People',
    question: 'What does friendship mean to you? What does true friendship look like in action?',
    purpose: 'record ideas of trust, loyalty, connection',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '3.4',
    section: 'Relationships & Significant People',
    question: 'Describe your experience in love: significant relationships, what you learned.',
    purpose: 'understand emotional attachments and growth',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '3.5',
    section: 'Relationships & Significant People',
    question: 'How do you behave in conflict? How do you prefer to resolve disputes?',
    purpose: 'record behavioral patterns in disagreement',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '3.6',
    section: 'Relationships & Significant People',
    question: 'What moments with close people do you remember most often? Why?',
    purpose: 'reveal significant emotional episodes',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 4: Professional & Creative Experience
  {
    id: '4.1',
    section: 'Professional & Creative Experience',
    question: 'Tell about your career: where you started, where you ended up.',
    purpose: 'reflect professional path and identity',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  {
    id: '4.2',
    section: 'Professional & Creative Experience',
    question: 'What do you consider yourself truly competent in?',
    purpose: 'record professional strengths',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '4.3',
    section: 'Professional & Creative Experience',
    question: 'What achievement are you most proud of?',
    purpose: 'reveal meaningful outcomes of your efforts',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  {
    id: '4.4',
    section: 'Professional & Creative Experience',
    question: 'What did you dream of doing, but never managed to try?',
    purpose: 'record unrealized ambitions and interests',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '4.5',
    section: 'Professional & Creative Experience',
    question: 'What knowledge and skills would you like to pass on to others? Why?',
    purpose: 'identify valuable legacy',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 5: Hobbies, Tastes & Preferences
  {
    id: '5.1',
    section: 'Hobbies, Tastes & Preferences',
    question: 'What gives you pleasure in everyday life?',
    purpose: 'record sources of joy and recovery',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '5.2',
    section: 'Hobbies, Tastes & Preferences',
    question: 'What hobbies do you have and how did you come to them?',
    purpose: 'reflect interests and personal contexts',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '5.3',
    section: 'Hobbies, Tastes & Preferences',
    question: 'Favorite books, movies, music—and why these?',
    purpose: 'identify taste and cultural context',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '5.4',
    section: 'Hobbies, Tastes & Preferences',
    question: 'Are there places that are especially dear to you?',
    purpose: 'reflect geographic attachments',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  // Section 6: Emotions & Behavioral Reactions
  {
    id: '6.1',
    section: 'Emotions & Behavioral Reactions',
    question: 'What can instantly anger or upset you?',
    purpose: 'determine triggers of strong reactions',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '6.2',
    section: 'Emotions & Behavioral Reactions',
    question: 'What situations make you sad or lonely?',
    purpose: 'record vulnerabilities and lows',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '6.3',
    section: 'Emotions & Behavioral Reactions',
    question: 'What inspires, uplifts, or gives you strength?',
    purpose: 'identify sources of motivation',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '6.4',
    section: 'Emotions & Behavioral Reactions',
    question: 'What do you usually do to cope with strong emotions?',
    purpose: 'reveal coping strategies',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '6.5',
    section: 'Emotions & Behavioral Reactions',
    question: 'What mood prevails on your ordinary days?',
    purpose: 'determine emotional background',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '6.6',
    section: 'Emotions & Behavioral Reactions',
    question: 'What do you fear most?',
    purpose: 'understand deep fears',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '6.7',
    section: 'Emotions & Behavioral Reactions',
    question: 'What gives you a sense of inner stability and strength?',
    purpose: 'record anchors and strengths',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 7: Philosophy, Meaning & Legacy
  {
    id: '7.1',
    section: 'Philosophy, Meaning & Legacy',
    question: 'How do you understand the meaning of life?',
    purpose: 'identify your central philosophical stance',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '7.2',
    section: 'Philosophy, Meaning & Legacy',
    question: 'How do you relate to death? What happens afterward?',
    purpose: 'understand attitudes toward finitude',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '7.3',
    section: 'Philosophy, Meaning & Legacy',
    question: 'What are the main life lessons you have learned?',
    purpose: 'reveal moral conclusions',
    requirement: '≥ 500 words or 3 minutes audio',
    minWords: 500,
    minAudioMinutes: 3
  },
  {
    id: '7.4',
    section: 'Philosophy, Meaning & Legacy',
    question: 'What do you regret most in life? Why?',
    purpose: 'record unresolved issues',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  {
    id: '7.5',
    section: 'Philosophy, Meaning & Legacy',
    question: 'One piece of advice to your descendants?',
    purpose: 'formulate your legacy',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '7.6',
    section: 'Philosophy, Meaning & Legacy',
    question: 'How would you like to be remembered?',
    purpose: 'form an image of your memory',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 8: Speech Style & Communication
  {
    id: '8.1',
    section: 'Speech Style & Communication',
    question: 'What words, phrases, or expressions do you use most often?',
    purpose: 'record speech markers',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '8.2',
    section: 'Speech Style & Communication',
    question: 'What is your usual communication style?',
    purpose: 'determine intonation',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '8.3',
    section: 'Speech Style & Communication',
    question: 'Any accents, dialects, or specific phrases?',
    purpose: 'record cultural speech',
    requirement: '≥ 150 words or 1 minute audio',
    minWords: 150,
    minAudioMinutes: 1
  },
  {
    id: '8.4',
    section: 'Speech Style & Communication',
    question: 'What topics do you enjoy or avoid?',
    purpose: 'conversational boundaries',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 9: Digital Ethics & Legacy
  {
    id: '9.1',
    section: 'Digital Ethics & Legacy',
    question: 'What moral principles should your digital twin follow?',
    purpose: 'set ethical framework',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '9.2',
    section: 'Digital Ethics & Legacy',
    question: 'What topics, data, or emotions should be excluded?',
    purpose: 'privacy boundaries',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '9.3',
    section: 'Digital Ethics & Legacy',
    question: 'Who can access your digital twin?',
    purpose: 'usage boundaries',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '9.4',
    section: 'Digital Ethics & Legacy',
    question: 'Can your twin evolve after your death?',
    purpose: 'define posthumous evolution',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '9.5',
    section: 'Digital Ethics & Legacy',
    question: 'For what purposes can it be used?',
    purpose: 'permitted scenarios',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '9.6',
    section: 'Digital Ethics & Legacy',
    question: 'When and under what conditions should it be deactivated?',
    purpose: 'final limits',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  // Section 10: Daily Habits & Routines
  {
    id: '10.1',
    section: 'Daily Habits & Routines',
    question: 'Describe your typical day—from morning to night.',
    purpose: 'recreate daily pattern',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  {
    id: '10.2',
    section: 'Daily Habits & Routines',
    question: 'Do you have rituals or recurring actions?',
    purpose: 'identify routines',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 11: Thinking, Decision-Making & Inner Dialogue
  {
    id: '11.1',
    section: 'Thinking, Decision-Making & Inner Dialogue',
    question: 'How do you make important decisions?',
    purpose: 'model internal process',
    requirement: '≥ 400 words or 2 minutes audio',
    minWords: 400,
    minAudioMinutes: 2
  },
  {
    id: '11.2',
    section: 'Thinking, Decision-Making & Inner Dialogue',
    question: 'Intuition vs. logic—when?',
    purpose: 'clarify thinking style',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '11.3',
    section: 'Thinking, Decision-Making & Inner Dialogue',
    question: 'How do you talk to yourself?',
    purpose: 'pattern of inner dialogue',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  // Section 12: Humor & Perception Style
  {
    id: '12.1',
    section: 'Humor & Perception Style',
    question: 'Do you have a sense of humor? What is it like?',
    purpose: 'set emotional coloring',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '12.2',
    section: 'Humor & Perception Style',
    question: 'What really makes you laugh?',
    purpose: 'points of amusement',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  // Section 13: Cultural & Social Context
  {
    id: '13.1',
    section: 'Cultural & Social Context',
    question: 'How has your culture influenced you?',
    purpose: 'identify cultural codes',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '13.2',
    section: 'Cultural & Social Context',
    question: 'How did your generation shape your views?',
    purpose: 'influence of era',
    requirement: '≥ 300 words or 2 minutes audio',
    minWords: 300,
    minAudioMinutes: 2
  },
  {
    id: '13.3',
    section: 'Cultural & Social Context',
    question: 'Important regional/social background features?',
    purpose: 'add local context',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  // Section 14: Archetypes & Symbols
  {
    id: '14.1',
    section: 'Archetypes & Symbols',
    question: 'If you chose an archetype (hero, sage, etc.), who would you be? Why?',
    purpose: 'archetypal basis',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '14.2',
    section: 'Archetypes & Symbols',
    question: 'Do you have an inner "hero" or ideal image?',
    purpose: 'role models',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  // Section 15: Visual Preferences & Metaphors
  {
    id: '15.1',
    section: 'Visual Preferences & Metaphors',
    question: 'What would a space that reflects you look like?',
    purpose: 'visual aesthetics',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
  },
  {
    id: '15.2',
    section: 'Visual Preferences & Metaphors',
    question: 'If your life were a metaphor (film, animal, color, element)—what and why?',
    purpose: 'poetic portrait',
    requirement: '≥ 200 words or 1 minute audio',
    minWords: 200,
    minAudioMinutes: 1
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
  const [isCompletionView, setIsCompletionView] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  
  // Admin functionality
  const isAdminUser = email === 'tervahagn@gmail.com';
  
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
  
  // Update the total questions count in the API call
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
  const wordCount = textResponse.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isTextRequirementMet = !currentQuestion?.minWords || wordCount >= currentQuestion.minWords;
  const isAudioRequirementMet = !currentQuestion?.minAudioMinutes || (audioBlob && recordingTime >= currentQuestion.minAudioMinutes * 60);
  const canProceed = responseType === 'text' ? isTextRequirementMet : isAudioRequirementMet;



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
      // Complete survey and show completion view
      if (survey) {
        completeSurvey(survey.id);
        setIsCompletionView(true);
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

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const sendToEmail = async () => {
    if (!survey || !responses) return;
    
    const recipientEmail = prompt('Enter email address to send the survey results:');
    if (!recipientEmail) return;
    
    try {
      const { api } = await import('@/lib/api');
      const response = await api.post(`/api/surveys/${survey.id}/email`, {
        recipientEmail,
        questions: QUESTIONS // Pass questions to backend
      });

      if (response.ok) {
        alert(`Survey results sent successfully to ${recipientEmail}!`);
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error}`);
      }
    } catch (error) {
      console.error('Email error:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const sendToAI = () => {
    // TODO: Implement AI analysis
    alert('AI analysis functionality would be implemented here');
  };

  const downloadMarkdown = () => {
    if (!responses || !survey) return;
    
    const groupedResponses = responses.reduce((acc: any, response: any) => {
      const question = QUESTIONS.find(q => q.id === response.questionId);
      if (question) {
        const section = question.section;
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push({ question, response });
      }
      return acc;
    }, {});

    let markdown = `# DigiTwin Biographical Survey\n\n`;
    markdown += `**Email:** ${email}\n`;
    markdown += `**Completed:** ${new Date().toLocaleDateString()}\n`;
    markdown += `**Total Questions Answered:** ${responses.length}\n\n`;
    markdown += `---\n\n`;

    Object.entries(groupedResponses).forEach(([section, items]: [string, any[]]) => {
      markdown += `## ${section}\n\n`;
      
      items.forEach(({ question, response }, index) => {
        markdown += `### Q${index + 1}: ${question.question}\n\n`;
        markdown += `**Purpose:** ${question.purpose}\n`;
        markdown += `**Requirement:** ${question.requirement}\n\n`;
        
        if (response.responseType === 'text') {
          markdown += `**Answer (${response.wordCount} words):**\n\n${response.textAnswer}\n\n`;
        } else {
          markdown += `**Answer:** Audio response recorded\n\n`;
        }
        
        markdown += `---\n\n`;
      });
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digitwin-survey-${email.replace('@', '_at_')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // For now, we'll create a printable HTML version that can be saved as PDF
    if (!responses || !survey) return;
    
    const groupedResponses = responses.reduce((acc: any, response: any) => {
      const question = QUESTIONS.find(q => q.id === response.questionId);
      if (question) {
        const section = question.section;
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push({ question, response });
      }
      return acc;
    }, {});

    let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>DigiTwin Survey - ${email}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        h3 { color: #1e3a8a; margin-top: 20px; }
        .meta { background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin-bottom: 20px; }
        .question { border-left: 4px solid #93c5fd; padding-left: 15px; margin-bottom: 20px; }
        .answer { background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 10px; }
        .purpose { font-style: italic; color: #64748b; font-size: 14px; }
        .word-count { color: #059669; font-weight: bold; font-size: 12px; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <h1>DigiTwin Biographical Survey</h1>
    
    <div class="meta">
        <strong>Email:</strong> ${email}<br>
        <strong>Completed:</strong> ${new Date().toLocaleDateString()}<br>
        <strong>Total Questions Answered:</strong> ${responses.length}
    </div>
`;

    Object.entries(groupedResponses).forEach(([section, items]: [string, any[]]) => {
      htmlContent += `<h2>${section}</h2>`;
      
      items.forEach(({ question, response }, index) => {
        htmlContent += `
        <div class="question">
            <h3>Q${index + 1}: ${question.question}</h3>
            <div class="purpose">
                Purpose: ${question.purpose} • ${question.requirement}
            </div>
            <div class="answer">
        `;
        
        if (response.responseType === 'text') {
          htmlContent += `
                <div class="word-count">${response.wordCount} words</div>
                <p>${response.textAnswer.replace(/\n/g, '<br>')}</p>
          `;
        } else {
          htmlContent += `<p><em>Audio response recorded</em></p>`;
        }
        
        htmlContent += `
            </div>
        </div>
        `;
      });
    });

    htmlContent += `</body></html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 500);
      };
    }
    
    // Also offer direct download of HTML file
    const a = document.createElement('a');
    a.href = url;
    a.download = `digitwin-survey-${email.replace('@', '_at_')}-${new Date().toISOString().split('T')[0]}.html`;
    a.style.display = 'none';
    document.body.appendChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);
  };

  // Email collection screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4">
              <div className="flex justify-center mb-2">
                <img src={logoPath} alt="DigiTwin" className="h-36 w-auto" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 mb-3">
                Unlock Your Legacy
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Preserve your life, memories, and personality forever. DigiTwin empowers you to create a true-to-life digital copy that can share your story, wisdom, and values with loved ones—now and in the future.
              </p>
            </div>
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
                className="w-full p-3 mt-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-1">
                We'll use this to save your progress and send you your results
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => setShowPreview(true)}
                disabled={!email.trim()}
                variant="outline"
                className="w-full"
              >
                Preview All Questions (Recommended)
              </Button>
              <Button 
                onClick={() => {
                  if (email.trim()) {
                    setHasStarted(true);
                  }
                }}
                disabled={!email.trim()}
                className="w-full"
              >
                Start Survey Directly
              </Button>
            </div>
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

  // Completion screen with all Q&A
  if (isCompletionView && responses) {
    const groupedResponses = responses.reduce((acc: any, response: any) => {
      const question = QUESTIONS.find(q => q.id === response.questionId);
      if (question) {
        const section = question.section;
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push({ question, response });
      }
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">🎉 Survey Complete!</h1>
              <p className="text-lg text-slate-600">Your DigiTwin biographical survey has been completed</p>
              <p className="text-sm text-slate-500 mt-2">{email} • {responses.length} questions answered</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">What would you like to do next?</h2>
            
            {/* Download options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-700 mb-3">Download Your Survey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-3 p-4 h-auto bg-red-600 hover:bg-red-700"
                >
                  <FileText size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Download as PDF</div>
                    <div className="text-sm opacity-90">Printable formatted document</div>
                  </div>
                </Button>
                
                <Button
                  onClick={downloadMarkdown}
                  variant="outline"
                  className="flex items-center justify-center gap-3 p-4 h-auto border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Download size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Download as Markdown</div>
                    <div className="text-sm opacity-75">Text format for editing</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Other actions */}
            <div>
              <h3 className="text-lg font-medium text-slate-700 mb-3">Share & Analyze</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={sendToEmail}
                  variant="outline"
                  className="flex items-center justify-center gap-3 p-4 h-auto border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Mail size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Send to Email</div>
                    <div className="text-sm opacity-75">Email your responses</div>
                  </div>
                </Button>
                
                <Button
                  onClick={sendToAI}
                  variant="outline"
                  className="flex items-center justify-center gap-3 p-4 h-auto border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Bot size={20} />
                  <div className="text-left">
                    <div className="font-semibold">Create Digital Twin</div>
                    <div className="text-sm opacity-75">AI analysis & digital copy</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* All responses organized by section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Complete Responses</h2>
            
            {Object.entries(groupedResponses).map(([section, items]: [string, any[]]) => (
              <Card key={section} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSection(section)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {items.length} questions
                      </span>
                      {expandedSections.has(section) ? 
                        <ChevronUp size={20} className="text-slate-500" /> : 
                        <ChevronDown size={20} className="text-slate-500" />
                      }
                    </div>
                  </div>
                </CardHeader>
                
                {expandedSections.has(section) && (
                  <CardContent className="border-t border-slate-100">
                    <div className="space-y-6 pt-4">
                      {items.map(({ question, response }, index) => (
                        <div key={question.id} className="border-l-4 border-blue-200 pl-4">
                          <div className="mb-3">
                            <h4 className="font-medium text-slate-800 mb-1">
                              Q{index + 1}: {question.question}
                            </h4>
                            <p className="text-sm text-slate-500">
                              Purpose: {question.purpose} • {question.requirement}
                            </p>
                          </div>
                          
                          <div className="bg-slate-50 rounded-lg p-4">
                            {response.responseType === 'text' ? (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">TEXT</span>
                                  <span className="text-xs text-slate-500">
                                    {response.wordCount} words
                                  </span>
                                </div>
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                  {response.textAnswer}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">AUDIO</span>
                                  <span className="text-xs text-slate-500">Audio response recorded</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                  <Mic size={16} />
                                  <span>Audio response (playback would be implemented)</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Questions Preview Screen
  if (showPreview) {
    const groupedQuestions = QUESTIONS.reduce((acc: Record<string, Question[]>, question) => {
      if (!acc[question.section]) {
        acc[question.section] = [];
      }
      acc[question.section].push(question);
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center">
                  <img src={logoPath} alt="DigiTwin" className="h-10 w-auto" />
                </div>
                <h2 className="text-lg font-semibold text-slate-700">Survey Questions Preview</h2>
                <p className="text-sm text-slate-600">{email}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    setHasStarted(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start Survey
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Prepare for Your DigiTwin Journey</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                This comprehensive survey contains <strong>{QUESTIONS.length} questions</strong> across <strong>{Object.keys(groupedQuestions).length} life categories</strong>. 
                Take time to review the questions below and consider your responses. You can save progress at any time and return later. 
                Most questions require 200+ words or 1-3 minutes of audio to capture the depth needed for your digital twin.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {Object.entries(groupedQuestions).map(([section, questions]) => (
              <Card key={section} className="shadow-sm">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => toggleSection(section)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-slate-800">{section}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {questions.length} questions • Click to expand
                      </p>
                    </div>
                    {expandedSections.has(section) ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </CardHeader>
                
                {expandedSections.has(section) && (
                  <CardContent>
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border-l-4 border-blue-200 pl-4 py-2">
                          <h4 className="font-medium text-slate-800 mb-2">
                            Q{index + 1}: {question.question}
                          </h4>
                          <div className="text-sm text-slate-600 space-y-1">
                            <p><strong>Purpose:</strong> {question.purpose}</p>
                            <p><strong>Requirement:</strong> {question.requirement}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button
              onClick={() => {
                setShowPreview(false);
                setHasStarted(true);
              }}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              Ready to Begin Survey
            </Button>
          </div>
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
              <div className="flex items-center gap-2">
                <img src={logoPath} alt="DigiTwin" className="h-8 w-auto" />
              </div>
              <h2 className="text-sm font-semibold text-slate-700">Unlock Your Legacy</h2>
              <p className="text-xs text-slate-600">{email}</p>
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

      {/* Main content with sidebar */}
      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* Remaining Categories Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">
                📋 Survey Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const groupedQuestions = QUESTIONS.reduce((acc: Record<string, Question[]>, question) => {
                  if (!acc[question.section]) {
                    acc[question.section] = [];
                  }
                  acc[question.section].push(question);
                  return acc;
                }, {});
                
                return Object.entries(groupedQuestions).map(([section, questions]) => {
                  const answeredInSection = responses?.filter(r => 
                    questions.some(q => q.id === r.questionId)
                  ).length || 0;
                  const isCurrentSection = questions.some(q => q.id === currentQuestion.id);
                  
                  return (
                    <div key={section} className={`p-3 rounded-lg border-2 transition-all ${
                      isCurrentSection 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-slate-200 bg-slate-50'
                    }`}>
                      <h4 className={`text-xs font-medium mb-2 ${
                        isCurrentSection ? 'text-blue-800' : 'text-slate-700'
                      }`}>
                        {section}
                      </h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isCurrentSection ? 'text-blue-700' : 'text-slate-600'}>
                          {answeredInSection}/{questions.length} completed
                        </span>
                        <div className={`w-16 h-1.5 rounded-full ${
                          isCurrentSection ? 'bg-blue-200' : 'bg-slate-200'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCurrentSection ? 'bg-blue-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${(answeredInSection / questions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      {isCurrentSection && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          ← Currently here
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Main Question Content */}
        <div className="flex-1">
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
              <div className="flex gap-2 items-center">
                {/* Admin navigation arrows */}
                {isAdminUser && (
                  <div className="flex gap-2 mr-4 items-center">
                    <Button
                      onClick={goToPrevious}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Prev
                    </Button>
                    <Button
                      onClick={() => {
                        if (currentQuestionIndex < totalQuestions - 1) {
                          setCurrentQuestionIndex(prev => prev + 1);
                        }
                      }}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <User size={12} />
                      Admin
                    </div>
                  </div>
                )}
                <Button
                  onClick={goToPrevious}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  Previous
                </Button>
              </div>
              
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
    </div>
  );
};

export default OptimizedIndex;
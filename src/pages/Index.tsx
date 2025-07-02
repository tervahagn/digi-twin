import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Mic, Download, Mail } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSurveyPDF } from "@/utils/pdfGenerator";

interface Question {
  id: string;
  section: string;
  question: string;
  purpose: string;
  requirement: string;
  minWords?: number;
  minAudioMinutes?: number;
}

interface Answer {
  questionId: string;
  responseType: 'text' | 'audio';
  textAnswer?: string;
  audioBlob?: Blob;
  wordCount?: number;
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

const Index = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [responseType, setResponseType] = useState<'text' | 'audio'>('text');
  const [textResponse, setTextResponse] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;

  const wordCount = textResponse.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isTextRequirementMet = !currentQuestion.minWords || wordCount >= currentQuestion.minWords;
  const isAudioRequirementMet = !currentQuestion.minAudioMinutes || (audioBlob && recordingTime >= currentQuestion.minAudioMinutes * 60);

  useEffect(() => {
    // Load existing answer if available
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    if (existingAnswer) {
      setCurrentAnswer(existingAnswer);
      setResponseType(existingAnswer.responseType);
      setTextResponse(existingAnswer.textAnswer || '');
      setAudioBlob(existingAnswer.audioBlob || null);
    } else {
      setCurrentAnswer(null);
      setResponseType('text');
      setTextResponse('');
      setAudioBlob(null);
    }
  }, [currentQuestionIndex]);

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

  const saveCurrentAnswer = () => {
    const answer: Answer = {
      questionId: currentQuestion.id,
      responseType,
      textAnswer: responseType === 'text' ? textResponse : undefined,
      audioBlob: responseType === 'audio' ? audioBlob : undefined,
      wordCount: responseType === 'text' ? wordCount : undefined
    };

    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, answer];
    });
  };

  const goToNext = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const goToPrevious = () => {
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const canProceed = responseType === 'text' ? isTextRequirementMet : isAudioRequirementMet;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadPDF = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide your email address first.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      generateSurveyPDF(QUESTIONS, answers, email);
      toast({
        title: "PDF Downloaded",
        description: "Your survey responses have been downloaded as a PDF.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Error",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide your email address to submit the survey.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting survey submission...');
      
      // Prepare responses data
      const responsesData = answers.map(answer => ({
        questionId: answer.questionId,
        responseType: answer.responseType,
        textAnswer: answer.textAnswer || null,
        wordCount: answer.wordCount || null,
        // Note: Audio blob handling would need additional implementation for file storage
        hasAudio: !!answer.audioBlob
      }));

      // Insert main survey response
      const { data: surveyResponse, error: surveyError } = await supabase
        .from('survey_responses')
        .insert({
          email: email,
          responses: responsesData,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (surveyError) {
        console.error('Error inserting survey response:', surveyError);
        throw new Error('Failed to save survey response');
      }

      console.log('Survey response saved:', surveyResponse.id);

      // Insert individual question responses
      const questionResponsesData = answers.map(answer => {
        const question = QUESTIONS.find(q => q.id === answer.questionId);
        return {
          survey_response_id: surveyResponse.id,
          question_id: answer.questionId,
          section: question?.section || '',
          question_text: question?.question || '',
          response_type: answer.responseType,
          text_answer: answer.textAnswer || null,
          word_count: answer.wordCount || null,
          // Audio blob URL would be set after file upload
          audio_blob_url: answer.audioBlob ? 'pending_upload' : null
        };
      });

      const { error: questionError } = await supabase
        .from('question_responses')
        .insert(questionResponsesData);

      if (questionError) {
        console.error('Error inserting question responses:', questionError);
        throw new Error('Failed to save question responses');
      }

      console.log('Question responses saved successfully');

      // Call edge function to send email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-survey-email', {
        body: {
          email: email,
          surveyResponseId: surveyResponse.id
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        // Don't throw here - survey is saved, email is secondary
        toast({
          title: "Survey Saved",
          description: "Your survey has been saved, but there was an issue sending the confirmation email.",
          variant: "default",
        });
      } else {
        console.log('Email sent successfully:', emailResult);
        toast({
          title: "Survey Completed!",
          description: "Your responses have been saved and a summary has been sent to your email.",
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <img 
            src="/digi-twin-uploads/76e842d1-4ab7-45b9-889d-abe02e3ac692.png" 
            alt="DigiTwin Logo" 
            className="w-32 h-32 mx-auto mb-8 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Complete!</h1>
          <p className="text-gray-600 mb-8">
            Choose how you'd like to receive your survey responses:
          </p>
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          
          <div className="space-y-4">
            <button
              onClick={handleDownloadPDF}
              disabled={!isValidEmail(email)}
              className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Download PDF
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!isValidEmail(email) || isSubmitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              {isSubmitting ? 'Sending...' : 'Email Results'}
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            You can download the PDF immediately or receive a formatted summary via email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <img 
            src="/digi-twin-uploads/76e842d1-4ab7-45b9-889d-abe02e3ac692.png" 
            alt="DigiTwin Logo" 
            className="w-48 h-auto mb-4"
          />
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">DigiTwin</h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Unlock Your Legacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Preserve your life, memories, and personality forever. DigiTwin empowers you to create a true-to-life digital copy that can share your story, wisdom, and values with loved ones—now and in the future.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-gray-50 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="text-sm text-gray-500 mb-2">{currentQuestion.section}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 leading-relaxed">
              {currentQuestion.question}
            </h2>
            <div className="text-sm text-gray-600 mb-2">
              <strong>Purpose:</strong> {currentQuestion.purpose}
            </div>
            <div className="text-sm text-gray-600 mb-6">
              <strong>Requirement:</strong> {currentQuestion.requirement}
            </div>
          </div>

          {/* Response Type Selection */}
          <div className="mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setResponseType('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  responseType === 'text'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Text Response
              </button>
              <button
                onClick={() => setResponseType('audio')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  responseType === 'audio'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Audio Response
              </button>
            </div>
          </div>

          {/* Text Response */}
          {responseType === 'text' && (
            <div className="mb-6">
              <textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Share your thoughts here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`${wordCount >= (currentQuestion.minWords || 0) ? 'text-green-600' : 'text-gray-500'}`}>
                  {wordCount} words
                </span>
                {currentQuestion.minWords && (
                  <span className="text-gray-500">
                    Minimum: {currentQuestion.minWords} words
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Audio Response */}
          {responseType === 'audio' && (
            <div className="mb-6">
              <div className="border border-gray-300 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-2xl font-mono mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  {currentQuestion.minAudioMinutes && (
                    <div className="text-sm text-gray-500 mb-4">
                      Minimum: {currentQuestion.minAudioMinutes} minutes
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4 mb-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      <Mic size={20} />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      <Square size={20} />
                      Stop Recording
                    </button>
                  )}
                </div>

                {audioBlob && (
                  <div className="flex justify-center gap-4">
                    {!isPlaying ? (
                      <button
                        onClick={playAudio}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Play size={16} />
                        Play Back
                      </button>
                    ) : (
                      <button
                        onClick={stopAudio}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        <Pause size={16} />
                        Stop
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={goToNext}
              disabled={!canProceed}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete Survey' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

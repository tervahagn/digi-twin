
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Mic } from 'lucide-react';

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
  // Continue with remaining questions...
  {
    id: 'conclusion',
    section: 'Conclusion',
    question: 'What would you like to add that was not covered by the questions?',
    purpose: 'freedom to express unique points',
    requirement: 'free format',
    minWords: 0,
    minAudioMinutes: 0
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSubmit = async () => {
    // Here you would integrate with Supabase to save data and send email
    console.log('Survey completed with email:', email);
    console.log('All answers:', answers);
    // Show thank you message
    alert('Thank you for completing the DigiTwin survey! Your responses have been saved.');
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <img 
            src="/lovable-uploads/76e842d1-4ab7-45b9-889d-abe02e3ac692.png" 
            alt="DigiTwin Logo" 
            className="w-32 h-32 mx-auto mb-8 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Complete!</h1>
          <p className="text-gray-600 mb-8">
            Please provide your email address to receive a summary of your responses.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!email}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Survey
          </button>
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
            src="/lovable-uploads/76e842d1-4ab7-45b9-889d-abe02e3ac692.png" 
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

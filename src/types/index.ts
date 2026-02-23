export type StudyState = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

export interface HanjaChar {
  char: string;
  grade: number;
  reading: string;
  meaning: string;
  examples: string[];
}

export interface ProgressItem {
  char: string;
  grade: number;
  state: StudyState;
  interval: number;
  streak: number;
  dueDate: string;
  wrongCount: number;
  lastReviewedAt: string | null;
}

export interface StudyCardItem {
  charInfo: HanjaChar;
  progress: ProgressItem;
}

export type StudyAction = 'known' | 'hard' | 'retry';

export type QuizMode = 'meaning' | 'reading' | 'character' | 'mixed' | 'inputCharacter' | 'inputReading' | 'weakness';

export type QuestionType = 'meaning' | 'reading' | 'character' | 'inputCharacter' | 'inputReading';

export interface QuizQuestion {
  id: string;
  char: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation?: string;
}

export interface QuizAnswer {
  question: QuizQuestion;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizTypeStat {
  type: QuestionType;
  total: number;
  correct: number;
  accuracy: number;
}

export interface QuizResult {
  mode: QuizMode;
  score: number;
  total: number;
  correctCount: number;
  wrongCount: number;
  durationSec: number;
  answers: QuizAnswer[];
  wrongQuestions: QuizQuestion[];
  typeStats: QuizTypeStat[];
}

export interface SessionRecord {
  id?: number;
  mode: QuizMode;
  grade: number;
  startedAt: string;
  endedAt: string;
  score: number;
  total: number;
  correctCount: number;
}

export interface DashboardStats {
  total: number;
  mastered: number;
  reviewDue: number;
  newCount: number;
}

export interface ReviewListItem {
  char: string;
  dueDate: string;
  daysUntil: number;
}

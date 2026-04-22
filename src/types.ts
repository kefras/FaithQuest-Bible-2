export type Testament = 'Old' | 'New' | 'Both';
export type Level = 'Beginner' | 'Medium' | 'Advance';
export type GameMode = 'Standard' | 'Practice' | 'Daily';

export interface Question {
  id: string;
  testament: Testament;
  level: Level;
  text: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  category?: string; // Book or Theme
}

export interface GameHistoryEntry {
  date: string;
  score: number;
  mode: GameMode;
  level: Level;
  testament: Testament;
  correctCount: number;
  totalQuestions: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  avatarSeed?: string;
  totalScore: number;
  highScore: number;
  gameHistory: GameHistoryEntry[];
  unlockedAchievements: string[];
  categoryStats: Record<string, { correct: number; total: number }>;
  progress: {
    beginner: number;
    medium: number;
    advance: number;
  };
  lastPlayed: string;
  settings: {
    defaultTimerDuration: number;
  };
}

export interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timer: number;
  isGameOver: boolean;
  selectedTestament: Testament;
  selectedLevel: Level;
  gameMode: GameMode;
  selectedCategory: string | 'All';
  isPlaying: boolean;
  hintsUsed: number;
  correctCount: number;
  matchStats: Record<string, { correct: number; total: number }>;
}

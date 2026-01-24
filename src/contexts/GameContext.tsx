import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserProgress, LevelId, LevelProgress, QuizSession, AnswerRecord, LEVELS, AVATARS, calculateLevel } from '@/types/game';

interface GameState {
  user: UserProgress | null;
  currentQuiz: QuizSession | null;
  isOnboarding: boolean;
}

type GameAction =
  | { type: 'SET_USER'; payload: UserProgress }
  | { type: 'UPDATE_USER'; payload: Partial<UserProgress> }
  | { type: 'START_QUIZ'; payload: QuizSession }
  | { type: 'ANSWER_QUESTION'; payload: AnswerRecord }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UNLOCK_BADGE'; payload: string }
  | { type: 'UPDATE_STREAK' }
  | { type: 'SET_ONBOARDING'; payload: boolean }
  | { type: 'RESET_GAME' };

const initialLevelProgress: Record<LevelId, LevelProgress> = {
  linux: { unlocked: true, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  bash: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  git: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  docker: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  devops: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
};

const createNewUser = (username: string, avatarId: string): UserProgress => ({
  username,
  avatarId,
  totalXP: 0,
  currentLevel: 1,
  completedQuestions: [],
  levelProgress: { ...initialLevelProgress },
  earnedBadges: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: '',
    streakShields: 0,
    freezesUsed: 0,
  },
  stats: {
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    totalTimeSpent: 0,
    averageAccuracy: 0,
    fastestAnswer: Infinity,
    evilModeCompleted: 0,
  },
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
});

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isOnboarding: false };
    
    case 'UPDATE_USER':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };
    
    case 'START_QUIZ':
      return { ...state, currentQuiz: action.payload };
    
    case 'ANSWER_QUESTION':
      if (!state.currentQuiz || !state.user) return state;
      const newAnswers = [...state.currentQuiz.answers, action.payload];
      const newIndex = state.currentQuiz.currentQuestionIndex + 1;
      const isComplete = newIndex >= state.currentQuiz.questions.length;
      
      // Update user stats
      const newStats = { ...state.user.stats };
      newStats.totalQuestionsAnswered++;
      if (action.payload.isCorrect) newStats.correctAnswers++;
      newStats.totalTimeSpent += action.payload.timeSpent;
      newStats.averageAccuracy = (newStats.correctAnswers / newStats.totalQuestionsAnswered) * 100;
      if (action.payload.timeSpent < newStats.fastestAnswer) {
        newStats.fastestAnswer = action.payload.timeSpent;
      }
      
      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          answers: newAnswers,
          currentQuestionIndex: newIndex,
          isComplete,
        },
        user: {
          ...state.user,
          totalXP: state.user.totalXP + action.payload.xpEarned,
          currentLevel: calculateLevel(state.user.totalXP + action.payload.xpEarned),
          completedQuestions: [...state.user.completedQuestions, action.payload.questionId],
          stats: newStats,
          lastActiveAt: new Date().toISOString(),
        },
      };
    
    case 'COMPLETE_QUIZ':
      if (!state.currentQuiz || !state.user) return state;
      const levelId = state.currentQuiz.levelId;
      const correctCount = state.currentQuiz.answers.filter(a => a.isCorrect).length;
      const totalCount = state.currentQuiz.questions.length;
      const accuracy = (correctCount / totalCount) * 100;
      
      const newLevelProgress = { ...state.user.levelProgress };
      newLevelProgress[levelId] = {
        ...newLevelProgress[levelId],
        questionsAnswered: newLevelProgress[levelId].questionsAnswered + totalCount,
        correctAnswers: newLevelProgress[levelId].correctAnswers + correctCount,
        attempts: newLevelProgress[levelId].attempts + 1,
        completed: accuracy >= 70,
      };
      
      // Unlock next level if completed
      if (accuracy >= 70) {
        const levelIndex = LEVELS.findIndex(l => l.id === levelId);
        if (levelIndex < LEVELS.length - 1) {
          const nextLevelId = LEVELS[levelIndex + 1].id;
          newLevelProgress[nextLevelId] = {
            ...newLevelProgress[nextLevelId],
            unlocked: true,
          };
        }
      }
      
      return {
        ...state,
        currentQuiz: null,
        user: {
          ...state.user,
          levelProgress: newLevelProgress,
        },
      };
    
    case 'ADD_XP':
      if (!state.user) return state;
      const newXP = state.user.totalXP + action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          totalXP: newXP,
          currentLevel: calculateLevel(newXP),
        },
      };
    
    case 'UNLOCK_BADGE':
      if (!state.user) return state;
      if (state.user.earnedBadges.includes(action.payload)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          earnedBadges: [...state.user.earnedBadges, action.payload],
        },
      };
    
    case 'UPDATE_STREAK':
      if (!state.user) return state;
      const today = new Date().toISOString().split('T')[0];
      const lastPractice = state.user.streak.lastPracticeDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = state.user.streak.currentStreak;
      if (lastPractice === today) {
        // Already practiced today
      } else if (lastPractice === yesterday) {
        newStreak++;
      } else {
        newStreak = 1;
      }
      
      return {
        ...state,
        user: {
          ...state.user,
          streak: {
            ...state.user.streak,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, state.user.streak.longestStreak),
            lastPracticeDate: today,
          },
        },
      };
    
    case 'SET_ONBOARDING':
      return { ...state, isOnboarding: action.payload };
    
    case 'RESET_GAME':
      localStorage.removeItem('devops-quest-user');
      return { user: null, currentQuiz: null, isOnboarding: true };
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  createUser: (username: string, avatarId: string) => void;
  startQuiz: (levelId: LevelId, questions: any[]) => void;
  submitAnswer: (questionId: string, selectedAnswer: number, isCorrect: boolean, timeSpent: number, xpEarned: number) => void;
  completeQuiz: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    user: null,
    currentQuiz: null,
    isOnboarding: true,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('devops-quest-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
  }, []);

  // Save user to localStorage on changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('devops-quest-user', JSON.stringify(state.user));
    }
  }, [state.user]);

  const createUser = (username: string, avatarId: string) => {
    const newUser = createNewUser(username, avatarId);
    dispatch({ type: 'SET_USER', payload: newUser });
  };

  const startQuiz = (levelId: LevelId, questions: any[]) => {
    dispatch({
      type: 'START_QUIZ',
      payload: {
        levelId,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: Date.now(),
        isComplete: false,
      },
    });
  };

  const submitAnswer = (questionId: string, selectedAnswer: number, isCorrect: boolean, timeSpent: number, xpEarned: number) => {
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: { questionId, selectedAnswer, isCorrect, timeSpent, xpEarned },
    });
    dispatch({ type: 'UPDATE_STREAK' });
  };

  const completeQuiz = () => {
    dispatch({ type: 'COMPLETE_QUIZ' });
  };

  return (
    <GameContext.Provider value={{ state, dispatch, createUser, startQuiz, submitAnswer, completeQuiz }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

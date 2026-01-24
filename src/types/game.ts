// DevOps Quest - Game Types

export type Difficulty = 'easy' | 'medium' | 'hard' | 'evil';

export type LevelId = 'linux' | 'bash' | 'git' | 'docker' | 'devops';

export interface Level {
  id: LevelId;
  name: string;
  emoji: string;
  description: string;
  color: string;
  unlockRequirement: number; // XP required to unlock
  totalQuestions: number;
}

export interface Question {
  id: string;
  levelId: LevelId;
  difficulty: Difficulty;
  question: string;
  code?: string; // Optional code snippet
  options: string[];
  correctAnswer: number; // Index of correct answer
  explanation: string;
  wrongFeedback: string[]; // Sarcastic messages for wrong answers
  xpReward: number;
  tags: string[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserProgress {
  username: string;
  avatarId: string;
  totalXP: number;
  currentLevel: number;
  completedQuestions: string[]; // Question IDs
  levelProgress: Record<LevelId, LevelProgress>;
  earnedBadges: string[]; // Badge IDs
  streak: StreakData;
  stats: UserStats;
  createdAt: string;
  lastActiveAt: string;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  questionsAnswered: number;
  correctAnswers: number;
  bestTime?: number; // Fastest completion time in seconds
  attempts: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // ISO date string
  streakShields: number;
  freezesUsed: number;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  totalTimeSpent: number; // In seconds
  averageAccuracy: number;
  fastestAnswer: number; // Seconds
  evilModeCompleted: number;
}

export interface QuizSession {
  levelId: LevelId;
  questions: Question[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  startTime: number;
  isComplete: boolean;
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // Seconds
  xpEarned: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarId: string;
  totalXP: number;
  level: number;
  accuracy: number;
  completedLevels: number;
  createdAt: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  levelId: LevelId;
  questionIds: string[];
  bonusXP: number;
  timeLimit: number; // Seconds
  isActive: boolean;
}

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// Constants
export const LEVELS: Level[] = [
  {
    id: 'linux',
    name: 'Linux Rookie',
    emoji: '🐧',
    description: 'Master basic commands, permissions, users, and processes',
    color: 'level-linux',
    unlockRequirement: 0,
    totalQuestions: 20,
  },
  {
    id: 'bash',
    name: 'Bash Ninja',
    emoji: '🧪',
    description: 'Conquer scripts, loops, conditions, and debugging',
    color: 'level-bash',
    unlockRequirement: 500,
    totalQuestions: 20,
  },
  {
    id: 'git',
    name: 'Git Survivor',
    emoji: '🌱',
    description: 'Navigate branching, merging, conflicts, and CI scenarios',
    color: 'level-git',
    unlockRequirement: 1200,
    totalQuestions: 20,
  },
  {
    id: 'docker',
    name: 'Docker Architect',
    emoji: '🐳',
    description: 'Build with images, containers, Dockerfiles, and volumes',
    color: 'level-docker',
    unlockRequirement: 2000,
    totalQuestions: 20,
  },
  {
    id: 'devops',
    name: 'DevOps Master',
    emoji: '⚔️',
    description: 'Face mixed advanced scenarios and interview challenges',
    color: 'level-devops',
    unlockRequirement: 3000,
    totalQuestions: 20,
  },
];

export const AVATARS: Avatar[] = [
  { id: 'terminal', name: 'Terminal Pro', emoji: '💻', description: 'Classic terminal cursor' },
  { id: 'penguin', name: 'Tux', emoji: '🐧', description: 'Linux mascot' },
  { id: 'whale', name: 'Moby', emoji: '🐳', description: 'Docker whale' },
  { id: 'ninja', name: 'Code Ninja', emoji: '🥷', description: 'Silent but deadly' },
  { id: 'rocket', name: 'Deployer', emoji: '🚀', description: 'Always shipping' },
  { id: 'robot', name: 'Bot', emoji: '🤖', description: 'Automate everything' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', description: 'Command line magic' },
  { id: 'fire', name: 'Hotfix', emoji: '🔥', description: 'Production is fine' },
  { id: 'brain', name: 'Big Brain', emoji: '🧠', description: 'Galaxy brain solutions' },
  { id: 'skull', name: 'Destroyer', emoji: '💀', description: 'rm -rf survivor' },
];

export const BADGES: Badge[] = [
  // Progression badges
  { id: 'linux-survivor', name: 'Linux Survivor', emoji: '🥉', description: 'Complete Level 1', condition: 'Complete Linux Rookie level', rarity: 'common' },
  { id: 'script-breaker', name: 'Script Breaker', emoji: '🥈', description: 'Complete Level 2', condition: 'Complete Bash Ninja level', rarity: 'common' },
  { id: 'conflict-slayer', name: 'Git Conflict Slayer', emoji: '🥇', description: 'Complete Level 3', condition: 'Complete Git Survivor level', rarity: 'rare' },
  { id: 'docker-whisperer', name: 'Docker Whisperer', emoji: '🏆', description: 'Complete Level 4', condition: 'Complete Docker Architect level', rarity: 'epic' },
  { id: 'devops-legend', name: 'DevOps Legend', emoji: '👑', description: 'Complete all levels', condition: 'Complete all 5 levels', rarity: 'legendary' },
  
  // Special achievements
  { id: 'speed-demon', name: 'Speed Demon', emoji: '⚡', description: 'Complete any level in under 10 minutes', condition: 'Speed run a level', rarity: 'rare' },
  { id: 'perfectionist', name: 'Perfectionist', emoji: '💯', description: '100% accuracy on any level', condition: 'Perfect score', rarity: 'epic' },
  { id: 'streak-master', name: 'Streak Master', emoji: '🔥', description: '7-day learning streak', condition: 'Practice 7 days in a row', rarity: 'rare' },
  { id: 'night-owl', name: 'Night Owl', emoji: '🌙', description: 'Practice after midnight', condition: 'Study late', rarity: 'common' },
  { id: 'early-bird', name: 'Early Bird', emoji: '🌅', description: 'Practice before 6 AM', condition: 'Study early', rarity: 'common' },
  { id: 'evil-conqueror', name: 'Evil Conqueror', emoji: '😈', description: 'Complete all Evil mode questions', condition: 'Master the hardest challenges', rarity: 'legendary' },
  { id: 'first-blood', name: 'First Blood', emoji: '🎯', description: 'Answer your first question correctly', condition: 'Get started', rarity: 'common' },
  { id: 'centurion', name: 'Centurion', emoji: '💪', description: 'Answer 100 questions', condition: 'Dedication', rarity: 'rare' },
];

export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  evil: 50,
};

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentXP: number): { current: number; required: number; progress: number } {
  const level = calculateLevel(currentXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const current = currentXP - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const progress = Math.min((current / required) * 100, 100);
  
  return { current, required, progress };
}

import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AVATARS, LEVELS, BADGES, getXPForNextLevel } from '@/types/game';
import { Map, Trophy, Flame, Target, Clock, Zap } from 'lucide-react';

const Dashboard = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const user = state.user!;
  const avatar = AVATARS.find(a => a.id === user.avatarId);
  const xpProgress = getXPForNextLevel(user.totalXP);

  const motivationalMessages = [
    `You're on fire, ${user.username}! 🔥`,
    `Keep pushing, ${user.username}! 💪`,
    `Great progress, ${user.username}! 🚀`,
    `The terminal awaits, ${user.username}! 💻`,
  ];
  const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const completedLevels = Object.values(user.levelProgress).filter(l => l.completed).length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{avatar?.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/leaderboard')}>
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xp/20">
                <Zap className="h-5 w-5 text-xp" />
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text-xp">{user.totalXP}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.stats.averageAccuracy.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-streak/20">
                <Flame className="h-5 w-5 text-streak animate-fire-flicker" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.streak.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.stats.totalQuestionsAnswered}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="p-6 mb-8 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Level {user.currentLevel}</h2>
              <p className="text-sm text-muted-foreground">
                {xpProgress.current} / {xpProgress.required} XP to next level
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{completedLevels}/5 worlds completed</p>
            </div>
          </div>
          <Progress value={xpProgress.progress} className="h-3" />
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button 
            size="lg" 
            className="h-20 text-lg btn-glow"
            onClick={() => navigate('/levels')}
          >
            <Map className="mr-3 h-6 w-6" />
            Continue Learning
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="h-20 text-lg"
            onClick={() => navigate('/levels')}
          >
            <Trophy className="mr-3 h-6 w-6" />
            View All Levels
          </Button>
        </div>

        {/* Badges */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold mb-4">Your Badges ({user.earnedBadges.length}/{BADGES.length})</h2>
          <div className="flex flex-wrap gap-3">
            {BADGES.slice(0, 6).map((badge) => {
              const earned = user.earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    earned 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/30 border-border opacity-50'
                  }`}
                  title={badge.description}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

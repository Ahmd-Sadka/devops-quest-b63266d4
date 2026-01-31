import { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getQuestionsByLevel, shuffleArray } from '@/data/questions';
import { LEVELS, Question } from '@/types/game';
import { Skull, Clock, Trophy, Zap, ArrowLeft } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const BossBattle = () => {
  const { state, dispatch, submitAnswer } = useGame();
  const navigate = useNavigate();
  const { burstConfetti, sidesConfetti } = useConfetti();
  const { playSound } = useSoundEffects();
  
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [bossQuestion, setBossQuestion] = useState<Question | null>(null);
  const [phase, setPhase] = useState<'select' | 'intro' | 'battle' | 'victory' | 'defeat'>('select');
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  
  const user = state.user;
  
  useEffect(() => {
    if (phase === 'battle' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (phase === 'battle' && timeLeft === 0) {
      // Time's up - player takes damage
      setPlayerHealth(h => h - 50);
      if (playerHealth <= 50) {
        setPhase('defeat');
        playSound('wrong');
      } else {
        loadNextQuestion();
      }
    }
  }, [phase, timeLeft, playerHealth]);
  
  const loadNextQuestion = () => {
    if (!selectedLevel) return;
    const questions = getQuestionsByLevel(selectedLevel).filter(q => q.difficulty === 'hard' || q.difficulty === 'evil');
    const randomQuestion = shuffleArray(questions)[0];
    setBossQuestion(randomQuestion);
    setTimeLeft(60);
    setSelectedAnswer(null);
  };
  
  const startBattle = (levelId: string) => {
    setSelectedLevel(levelId);
    setPhase('intro');
    setBossHealth(100);
    setPlayerHealth(100);
    
    setTimeout(() => {
      setPhase('battle');
      loadNextQuestion();
    }, 3000);
  };
  
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !bossQuestion) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === bossQuestion.correctAnswer;
    
    if (isCorrect) {
      playSound('correct');
      setBossHealth(h => {
        const newHealth = h - 35;
        if (newHealth <= 0) {
          setTimeout(() => {
            setPhase('victory');
            sidesConfetti();
            burstConfetti();
            playSound('levelUp');
            
            if (selectedLevel) {
              dispatch({ type: 'DEFEAT_BOSS', payload: selectedLevel as any });
              dispatch({ type: 'ADD_XP', payload: 200 });
            }
          }, 500);
        }
        return Math.max(0, newHealth);
      });
    } else {
      playSound('wrong');
      setPlayerHealth(h => {
        const newHealth = h - 35;
        if (newHealth <= 0) {
          setTimeout(() => setPhase('defeat'), 500);
        }
        return Math.max(0, newHealth);
      });
    }
    
    if (bossHealth > 35 && playerHealth > 35) {
      setTimeout(loadNextQuestion, 1500);
    }
  };
  
  const level = selectedLevel ? LEVELS.find(l => l.id === selectedLevel) : null;
  
  if (!user) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Skull className="h-6 w-6 text-destructive" />
            <h1 className="text-2xl font-bold">Boss Battle Arena</h1>
          </div>
        </div>
        
        {phase === 'select' && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center mb-6">
              Choose a level to face its Boss! Defeat bosses to earn bonus XP and badges.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEVELS.filter(l => user.levelProgress[l.id]?.unlocked).map((level) => {
                const defeated = user.levelProgress[level.id]?.bossDefeated;
                return (
                  <Card
                    key={level.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                      defeated ? 'border-success/50 bg-success/5' : 'hover:border-destructive/50'
                    }`}
                    onClick={() => startBattle(level.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{level.emoji}</div>
                      <div>
                        <h3 className="font-bold text-lg">{level.name} Boss</h3>
                        <p className="text-sm text-muted-foreground">
                          {defeated ? '✅ Defeated' : '⚔️ Challenge'}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <Skull className={`h-8 w-8 ${defeated ? 'text-muted-foreground' : 'text-destructive animate-pulse'}`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        {phase === 'intro' && level && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="text-8xl animate-pulse">{level.emoji}</div>
            <h2 className="text-4xl font-bold text-destructive">
              {level.name} BOSS APPROACHES!
            </h2>
            <p className="text-xl text-muted-foreground">Prepare yourself...</p>
          </div>
        )}
        
        {phase === 'battle' && bossQuestion && level && (
          <div className="space-y-6">
            {/* Health Bars */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Your HP</span>
                  <span className="text-success">{playerHealth}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success to-green-400 transition-all duration-500"
                    style={{ width: `${playerHealth}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-destructive">Boss HP</span>
                  <span className="text-destructive">{bossHealth}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-destructive to-red-400 transition-all duration-500"
                    style={{ width: `${bossHealth}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2">
              <Clock className={`h-5 w-5 ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
              <span className={`text-2xl font-mono ${timeLeft < 10 ? 'text-destructive' : ''}`}>
                {timeLeft}s
              </span>
            </div>
            
            {/* Question */}
            <Card className="p-6">
              <p className="text-lg font-medium mb-4">{bossQuestion.question}</p>
              {bossQuestion.code && (
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  {bossQuestion.code}
                </pre>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {bossQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = bossQuestion.correctAnswer === index;
                  const showResult = selectedAnswer !== null;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`
                        p-4 rounded-lg text-left transition-all
                        ${showResult && isCorrect ? 'bg-success/20 border-success' : ''}
                        ${showResult && isSelected && !isCorrect ? 'bg-destructive/20 border-destructive wrong-shake' : ''}
                        ${!showResult ? 'bg-muted hover:bg-muted/80 hover:scale-[1.02]' : ''}
                        border-2 border-transparent
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
        
        {phase === 'victory' && (
          <div className="text-center space-y-6 animate-scale-in">
            <Trophy className="h-24 w-24 text-xp mx-auto" />
            <h2 className="text-4xl font-bold gradient-text">VICTORY!</h2>
            <p className="text-xl text-muted-foreground">You defeated the {level?.name} Boss!</p>
            <div className="flex items-center justify-center gap-2 text-xp">
              <Zap className="h-6 w-6" />
              <span className="text-2xl font-bold">+200 XP</span>
            </div>
            <Button onClick={() => setPhase('select')} className="btn-glow">
              Return to Arena
            </Button>
          </div>
        )}
        
        {phase === 'defeat' && (
          <div className="text-center space-y-6 animate-scale-in">
            <Skull className="h-24 w-24 text-destructive mx-auto" />
            <h2 className="text-4xl font-bold text-destructive">DEFEATED</h2>
            <p className="text-xl text-muted-foreground">The boss was too strong this time...</p>
            <Button onClick={() => setPhase('select')} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossBattle;

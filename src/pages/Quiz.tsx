import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQuizQuestions } from '@/data/questions';
import { LEVELS, LevelId } from '@/types/game';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';
import { useBadges } from '@/hooks/useBadges';
import { BadgeQueue } from '@/components/game/BadgeNotification';

const Quiz = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { state, startQuiz, submitAnswer, completeQuiz, dispatch } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [pendingBadges, setPendingBadges] = useState<string[]>([]);
  
  const { playSound } = useSoundEffects();
  const { burstConfetti, sidesConfetti } = useConfetti();
  const { checkAndAwardBadges } = useBadges();

  const level = LEVELS.find(l => l.id === levelId);
  const quiz = state.currentQuiz;

  useEffect(() => {
    if (levelId && !quiz) {
      const questions = getQuizQuestions(levelId, 10);
      startQuiz(levelId as LevelId, questions);
    }
  }, [levelId, quiz, startQuiz]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowResult(false);
  }, [quiz?.currentQuestionIndex]);

  if (!level || !quiz || !state.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (quiz.isComplete) {
    const correct = quiz.answers.filter(a => a.isCorrect).length;
    const total = quiz.answers.length;
    const accuracy = Math.round((correct / total) * 100);
    const totalXP = quiz.answers.reduce((sum, a) => sum + a.xpEarned, 0);
    
    // Check for new badges when quiz completes
    useEffect(() => {
      if (state.user && quiz.isComplete) {
        const newBadges = checkAndAwardBadges(state.user);
        if (newBadges.length > 0) {
          setPendingBadges(newBadges);
          newBadges.forEach(badgeId => {
            dispatch({ type: 'UNLOCK_BADGE', payload: badgeId });
          });
          playSound('badge');
          sidesConfetti();
        }
        
        if (accuracy >= 70) {
          playSound('levelUp');
          burstConfetti();
        }
      }
    }, [quiz.isComplete]);

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        {/* Badge notifications */}
        {pendingBadges.length > 0 && (
          <BadgeQueue 
            badgeIds={pendingBadges} 
            onComplete={() => setPendingBadges([])} 
          />
        )}
        
        <Card className="max-w-md w-full p-8 text-center bg-card border-border">
          <div className="text-6xl mb-4">{accuracy >= 70 ? '🎉' : '💪'}</div>
          <h1 className="text-2xl font-bold mb-2">
            {accuracy >= 70 ? 'Level Complete!' : 'Good Effort!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {accuracy >= 70 
              ? 'You passed this level!' 
              : 'Keep practicing to unlock the next level'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{correct}/{total}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold gradient-text-xp">+{totalXP}</p>
              <p className="text-sm text-muted-foreground">XP Earned</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full btn-glow" 
              onClick={() => {
                completeQuiz();
                navigate('/levels');
              }}
            >
              Continue
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                completeQuiz();
                const questions = getQuizQuestions(levelId!, 10);
                startQuiz(levelId as LevelId, questions);
              }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
  const progressPercent = (quiz.currentQuestionIndex / quiz.questions.length) * 100;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const xpEarned = isCorrect ? currentQuestion.xpReward : 0;
    
    // Play sound effect
    playSound(isCorrect ? 'correct' : 'wrong');
    
    setShowResult(true);
    
    setTimeout(() => {
      submitAnswer(currentQuestion.id, selectedAnswer, isCorrect, timeSpent, xpEarned);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      case 'evil': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/levels')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{level.emoji} {level.name}</span>
              <span className="text-sm text-muted-foreground">
                {quiz.currentQuestionIndex + 1} / {quiz.questions.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className={`p-6 mb-6 bg-card border-border ${showResult ? (selectedAnswer === currentQuestion.correctAnswer ? 'success-pulse border-success' : 'wrong-shake border-destructive') : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-medium uppercase ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty === 'evil' ? '😈 Evil' : currentQuestion.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">+{currentQuestion.xpReward} XP</span>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
          
          {currentQuestion.code && (
            <pre className="bg-muted p-4 rounded-lg mb-4 text-sm font-mono overflow-x-auto">
              {currentQuestion.code}
            </pre>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              
              let optionClass = 'border-border hover:border-primary/50';
              if (showResult) {
                if (isCorrect) optionClass = 'border-success bg-success/10';
                else if (isSelected) optionClass = 'border-destructive bg-destructive/10';
              } else if (isSelected) {
                optionClass = 'border-primary bg-primary/10';
              }

              return (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${optionClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{option}</span>
                    {showResult && isCorrect && <Check className="h-5 w-5 text-success" />}
                    {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Result Feedback */}
        {showResult && (
          <Card className={`p-4 mb-6 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}`}>
            <p className="font-medium mb-2">
              {selectedAnswer === currentQuestion.correctAnswer 
                ? '✅ Correct! +' + currentQuestion.xpReward + ' XP'
                : '❌ ' + currentQuestion.wrongFeedback[0]}
            </p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </Card>
        )}

        {/* Submit Button */}
        {!showResult && (
          <Button 
            className="w-full h-12 btn-glow" 
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;

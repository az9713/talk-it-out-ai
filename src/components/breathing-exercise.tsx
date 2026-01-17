'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Check, Wind, Footprints, Eye, User } from 'lucide-react';

interface ExerciseInstruction {
  step: number;
  text: string;
  durationSeconds?: number;
  action?: 'inhale' | 'exhale' | 'hold' | 'observe' | 'relax';
}

interface CalmingExercise {
  id: string;
  name: string;
  description: string | null;
  type: 'breathing' | 'grounding' | 'visualization' | 'body_scan';
  durationSeconds: number;
  instructions: ExerciseInstruction[] | null;
}

interface BreathingExerciseProps {
  exercise: CalmingExercise;
  onComplete?: (moodBefore: number, moodAfter: number) => void;
  onCancel?: () => void;
  sessionId?: string;
}

const TYPE_ICONS = {
  breathing: Wind,
  grounding: Footprints,
  visualization: Eye,
  body_scan: User,
};

const ACTION_COLORS = {
  inhale: 'bg-blue-500',
  exhale: 'bg-green-500',
  hold: 'bg-yellow-500',
  observe: 'bg-purple-500',
  relax: 'bg-pink-500',
};

export function BreathingExercise({ exercise, onComplete, onCancel }: BreathingExerciseProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTimeLeft, setStepTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(exercise.durationSeconds);
  const [cycleCount, setCycleCount] = useState(0);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);

  const instructions = exercise.instructions || [];
  const currentInstruction = instructions[currentStep];
  const Icon = TYPE_ICONS[exercise.type];

  // Calculate circle animation
  const maxStepDuration = currentInstruction?.durationSeconds || 4;
  const progress = stepTimeLeft / maxStepDuration;
  const circleSize = 200;
  const baseRadius = 60;
  const maxExpansion = 30;

  // For breathing exercises, expand/contract the circle
  const getRadius = () => {
    if (!currentInstruction?.action) return baseRadius;
    if (currentInstruction.action === 'inhale') {
      return baseRadius + (1 - progress) * maxExpansion;
    }
    if (currentInstruction.action === 'exhale') {
      return baseRadius + progress * maxExpansion;
    }
    return baseRadius + maxExpansion * 0.5; // Hold
  };

  const radius = getRadius();

  // Timer logic
  useEffect(() => {
    if (!isRunning || isCompleted) return;

    const timer = setInterval(() => {
      setStepTimeLeft((prev) => {
        if (prev <= 0) {
          // Move to next step
          if (currentStep < instructions.length - 1) {
            setCurrentStep((s) => s + 1);
            return instructions[currentStep + 1]?.durationSeconds || 4;
          } else {
            // Cycle complete
            setCycleCount((c) => c + 1);
            setCurrentStep(0);
            return instructions[0]?.durationSeconds || 4;
          }
        }
        return prev - 0.1;
      });

      setTotalTimeLeft((prev) => {
        if (prev <= 0) {
          setIsRunning(false);
          setIsCompleted(true);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, currentStep, instructions, isCompleted]);

  // Initialize step time when step changes
  useEffect(() => {
    if (currentInstruction?.durationSeconds) {
      setStepTimeLeft(currentInstruction.durationSeconds);
    }
  }, [currentStep, currentInstruction]);

  const handleStart = () => {
    if (moodBefore === null) return;
    setIsRunning(true);
    setStepTimeLeft(instructions[0]?.durationSeconds || 4);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setStepTimeLeft(instructions[0]?.durationSeconds || 4);
    setTotalTimeLeft(exercise.durationSeconds);
    setCycleCount(0);
    setIsCompleted(false);
    setMoodAfter(null);
  };

  const handleComplete = () => {
    if (moodBefore !== null && moodAfter !== null && onComplete) {
      onComplete(moodBefore, moodAfter);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mood selection before starting
  if (moodBefore === null) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {exercise.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{exercise.description}</p>
          <div>
            <p className="text-sm font-medium mb-3">How are you feeling right now?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodBefore(mood)}
                  className={`w-12 h-12 rounded-full text-2xl transition-all hover:scale-110 ${
                    moodBefore === mood ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  {['😢', '😔', '😐', '🙂', '😊'][mood - 1]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mood selection after completion
  if (isCompleted && moodAfter === null) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            Exercise Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Great job! You completed {cycleCount} cycles.
          </p>
          <div>
            <p className="text-sm font-medium mb-3">How do you feel now?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodAfter(mood)}
                  className={`w-12 h-12 rounded-full text-2xl transition-all hover:scale-110 ${
                    moodAfter === mood ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  {['😢', '😔', '😐', '🙂', '😊'][mood - 1]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show completion summary
  if (isCompleted && moodAfter !== null) {
    const improvement = moodAfter - moodBefore;
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            Well Done!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center gap-4">
            <div className="text-center">
              <div className="text-2xl">{['😢', '😔', '😐', '🙂', '😊'][moodBefore - 1]}</div>
              <div className="text-xs text-muted-foreground">Before</div>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className="text-2xl">{['😢', '😔', '😐', '🙂', '😊'][moodAfter - 1]}</div>
              <div className="text-xs text-muted-foreground">After</div>
            </div>
          </div>
          {improvement > 0 && (
            <p className="text-center text-sm text-green-600">
              Your mood improved by {improvement} point{improvement > 1 ? 's' : ''}!
            </p>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1" />
              Try Again
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main exercise UI
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {exercise.name}
          </CardTitle>
          <Badge variant="outline">{formatTime(totalTimeLeft)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Animated circle */}
        <div className="flex justify-center">
          <svg width={circleSize} height={circleSize} className="transform">
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={`transition-all duration-100 ${
                currentInstruction?.action
                  ? ACTION_COLORS[currentInstruction.action]?.replace('bg-', 'text-')
                  : 'text-primary'
              }`}
              style={{
                filter: 'drop-shadow(0 0 10px currentColor)',
              }}
            />
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius - 10}
              fill="currentColor"
              className={`transition-all duration-100 opacity-20 ${
                currentInstruction?.action
                  ? ACTION_COLORS[currentInstruction.action]?.replace('bg-', 'text-')
                  : 'text-primary'
              }`}
            />
          </svg>
        </div>

        {/* Current instruction */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">{currentInstruction?.text || 'Breathe...'}</p>
          {currentInstruction?.action && (
            <Badge className={ACTION_COLORS[currentInstruction.action]}>
              {currentInstruction.action.toUpperCase()}
            </Badge>
          )}
          <p className="text-sm text-muted-foreground">
            Cycle {cycleCount + 1} • Step {currentStep + 1} of {instructions.length}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg">
              <Play className="w-5 h-5 mr-1" />
              {totalTimeLeft === exercise.durationSeconds ? 'Start' : 'Resume'}
            </Button>
          ) : (
            <Button onClick={handlePause} variant="outline" size="lg">
              <Pause className="w-5 h-5 mr-1" />
              Pause
            </Button>
          )}
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Exercise picker card
export function ExerciseCard({
  exercise,
  onSelect,
}: {
  exercise: CalmingExercise;
  onSelect: (exercise: CalmingExercise) => void;
}) {
  const Icon = TYPE_ICONS[exercise.type];
  const minutes = Math.ceil(exercise.durationSeconds / 60);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onSelect(exercise)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{exercise.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {exercise.type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {minutes} min
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EMOTION_OPTIONS, MOOD_LABELS } from '@/services/emotions';

interface EmotionCheckInProps {
  type: 'pre_session' | 'post_session' | 'daily';
  sessionId?: string;
  onComplete: (data: EmotionCheckInData) => void;
  onSkip?: () => void;
}

export interface EmotionCheckInData {
  type: 'pre_session' | 'post_session' | 'daily';
  sessionId?: string;
  overallMood: number;
  primaryEmotion?: string;
  feelings?: string[];
  energyLevel?: number;
  opennessToTalk?: number;
  note?: string;
}

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];

export function EmotionCheckIn({ type, sessionId, onComplete, onSkip }: EmotionCheckInProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<number | null>(null);
  const [primaryEmotion, setPrimaryEmotion] = useState<string | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [opennessToTalk, setOpennessToTalk] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings((prev) =>
      prev.includes(feeling) ? prev.filter((f) => f !== feeling) : [...prev, feeling]
    );
  };

  const handleSubmit = async () => {
    if (mood === null) return;

    setIsSubmitting(true);
    try {
      const data: EmotionCheckInData = {
        type,
        sessionId,
        overallMood: mood,
        primaryEmotion: primaryEmotion || undefined,
        feelings: selectedFeelings.length > 0 ? selectedFeelings : undefined,
        energyLevel: energyLevel || undefined,
        opennessToTalk: opennessToTalk || undefined,
        note: note.trim() || undefined,
      };
      onComplete(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'pre_session':
        return 'How are you feeling right now?';
      case 'post_session':
        return 'How are you feeling after the session?';
      case 'daily':
        return "Today's Check-In";
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'pre_session':
        return 'Taking a moment to check in with yourself before we begin.';
      case 'post_session':
        return "Let's reflect on how you're feeling now.";
      case 'daily':
        return 'Track your emotional well-being over time.';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-center">Overall, how would you rate your mood?</p>
            <div className="flex justify-center gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMood(index + 1)}
                  className={`text-4xl p-2 rounded-full transition-all hover:scale-110 ${
                    mood === index + 1
                      ? 'bg-primary/20 ring-2 ring-primary scale-110'
                      : 'hover:bg-muted'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {mood && (
              <p className="text-center text-sm text-muted-foreground">
                {MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}
              </p>
            )}
            <div className="flex justify-between pt-4">
              {onSkip && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip
                </Button>
              )}
              <Button
                onClick={() => setStep(2)}
                disabled={mood === null}
                className="ml-auto"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">What emotions are you experiencing? (optional)</p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Positive</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.positive.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={selectedFeelings.includes(emotion) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFeeling(emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Challenging</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.negative.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={selectedFeelings.includes(emotion) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFeeling(emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Neutral</p>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.neutral.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={selectedFeelings.includes(emotion) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleFeeling(emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {type === 'pre_session' && (
              <div className="space-y-2">
                <p className="text-sm font-medium">How open do you feel to having this conversation?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setOpennessToTalk(level)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        opennessToTalk === level
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted hover:border-primary'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  1 = Not ready, 5 = Very open
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Energy level</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergyLevel(level)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      energyLevel === level
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted hover:border-primary'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                1 = Very low, 5 = Very high
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Anything else on your mind? (optional)</p>
              <Textarea
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for inline display
export function EmotionCheckInCompact({
  type,
  sessionId,
  onComplete,
}: Omit<EmotionCheckInProps, 'onSkip'>) {
  const [mood, setMood] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickSubmit = async (selectedMood: number) => {
    setMood(selectedMood);
    setIsSubmitting(true);
    try {
      onComplete({
        type,
        sessionId,
        overallMood: selectedMood,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium">Quick mood check:</span>
      <div className="flex gap-1">
        {moodEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleQuickSubmit(index + 1)}
            disabled={isSubmitting}
            className={`text-2xl p-1 rounded transition-all hover:scale-110 ${
              mood === index + 1 ? 'bg-primary/20' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

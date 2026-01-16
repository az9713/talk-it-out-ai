'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { COMMON_FEELINGS, COMMON_NEEDS } from '@/services/preparations';

interface PreparationWizardProps {
  preparationId: string;
  initialData?: PreparationData;
  onSave: (data: PreparationData) => Promise<void>;
  onComplete: (data: PreparationData) => void;
  onGenerateSuggestion: () => Promise<string | null>;
}

export interface PreparationData {
  situation?: string;
  initialFeelings?: string[];
  desiredOutcome?: string;
  identifiedNeeds?: string[];
  draftOpening?: string;
  suggestedOpening?: string;
  concerns?: string;
  shareWithMediator?: boolean;
}

const STEPS = [
  { title: 'Situation', description: 'What happened?' },
  { title: 'Feelings', description: 'How are you feeling?' },
  { title: 'Desired Outcome', description: 'What do you want to achieve?' },
  { title: 'Needs', description: 'What do you need?' },
  { title: 'Opening', description: 'How will you start?' },
  { title: 'Review', description: 'Ready to begin' },
];

export function PreparationWizard({
  preparationId,
  initialData,
  onSave,
  onComplete,
  onGenerateSuggestion,
}: PreparationWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<PreparationData>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  const updateField = <K extends keyof PreparationData>(
    field: K,
    value: PreparationData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'initialFeelings' | 'identifiedNeeds', item: string) => {
    const current = data[field] || [];
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    updateField(field, updated);
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      if (step < STEPS.length - 1) {
        setStep(step + 1);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    try {
      const suggestion = await onGenerateSuggestion();
      if (suggestion) {
        updateField('suggestedOpening', suggestion);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>{STEPS[step].title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <CardDescription className="mt-2">{STEPS[step].description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe the situation you want to discuss. Be specific about what happened.
            </p>
            <Textarea
              placeholder="What happened? When did it happen? Who was involved?"
              value={data.situation || ''}
              onChange={(e) => updateField('situation', e.target.value)}
              rows={5}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the feelings you're experiencing right now. You can choose multiple.
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_FEELINGS.map((feeling) => (
                <Badge
                  key={feeling}
                  variant={data.initialFeelings?.includes(feeling) ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1 px-3"
                  onClick={() => toggleArrayItem('initialFeelings', feeling)}
                >
                  {feeling}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Or describe your feelings in your own words..."
              value={
                data.initialFeelings?.filter((f) => !COMMON_FEELINGS.includes(f)).join(', ') ||
                ''
              }
              onChange={(e) => {
                const customFeelings = e.target.value
                  .split(',')
                  .map((f) => f.trim())
                  .filter(Boolean);
                const commonSelected =
                  data.initialFeelings?.filter((f) => COMMON_FEELINGS.includes(f)) || [];
                updateField('initialFeelings', [...commonSelected, ...customFeelings]);
              }}
              rows={2}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What outcome would you like from this conversation? What would make it successful?
            </p>
            <Textarea
              placeholder="I hope that after this conversation, we will..."
              value={data.desiredOutcome || ''}
              onChange={(e) => updateField('desiredOutcome', e.target.value)}
              rows={4}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">What concerns do you have? (optional)</p>
              <Textarea
                placeholder="I'm worried that..."
                value={data.concerns || ''}
                onChange={(e) => updateField('concerns', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What underlying needs are driving your feelings? What do you truly need?
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_NEEDS.map((need) => (
                <Badge
                  key={need}
                  variant={data.identifiedNeeds?.includes(need) ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1 px-3"
                  onClick={() => toggleArrayItem('identifiedNeeds', need)}
                >
                  {need}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Or describe your needs in your own words..."
              value={
                data.identifiedNeeds?.filter((n) => !COMMON_NEEDS.includes(n)).join(', ') || ''
              }
              onChange={(e) => {
                const customNeeds = e.target.value
                  .split(',')
                  .map((n) => n.trim())
                  .filter(Boolean);
                const commonSelected =
                  data.identifiedNeeds?.filter((n) => COMMON_NEEDS.includes(n)) || [];
                updateField('identifiedNeeds', [...commonSelected, ...customNeeds]);
              }}
              rows={2}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Draft how you might open the conversation. Use "I" statements and focus on your
              feelings and needs.
            </p>
            <Textarea
              placeholder="I'd like to talk about... I've been feeling..."
              value={data.draftOpening || ''}
              onChange={(e) => updateField('draftOpening', e.target.value)}
              rows={4}
            />

            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={handleGenerateSuggestion}
                disabled={isGenerating}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Get AI Suggestion'}
              </Button>

              {data.suggestedOpening && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium mb-2">Suggested opening:</p>
                  <p className="text-sm italic">{data.suggestedOpening}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => updateField('draftOpening', data.suggestedOpening)}
                  >
                    Use this suggestion
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Situation</p>
                <p className="text-sm">{data.situation || 'Not specified'}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Feelings</p>
                <div className="flex flex-wrap gap-1">
                  {data.initialFeelings?.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">
                      {f}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">None selected</span>}
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Desired Outcome</p>
                <p className="text-sm">{data.desiredOutcome || 'Not specified'}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Needs</p>
                <div className="flex flex-wrap gap-1">
                  {data.identifiedNeeds?.map((n) => (
                    <Badge key={n} variant="secondary" className="text-xs">
                      {n}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">None selected</span>}
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Opening</p>
                <p className="text-sm italic">{data.draftOpening || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="share"
                checked={data.shareWithMediator !== false}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  updateField('shareWithMediator', checked === true)
                }
              />
              <label htmlFor="share" className="text-sm">
                Share this preparation with the AI mediator
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              <Check className="w-4 h-4 mr-1" />
              Start Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

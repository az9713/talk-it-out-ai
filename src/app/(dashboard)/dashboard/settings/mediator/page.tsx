'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bot, RotateCcw, Save, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  TONE_DESCRIPTIONS,
  FORMALITY_DESCRIPTIONS,
  RESPONSE_LENGTH_DESCRIPTIONS,
  type MediatorTone,
  type MediatorFormality,
  type MediatorResponseLength,
} from '@/lib/ai/personality';

interface MediatorSettings {
  tone: MediatorTone;
  formality: MediatorFormality;
  responseLength: MediatorResponseLength;
  useEmoji: boolean;
  useMetaphors: boolean;
  culturalContext: string | null;
}

const SAMPLE_RESPONSES: Record<MediatorTone, string> = {
  warm: "I hear you, and I can sense this has been weighing on you. Thank you for sharing something so personal. Let's work through this together, taking all the time you need.",
  professional: "Thank you for sharing this situation. I understand this is a significant concern for you. Let's analyze the key points and work toward a constructive resolution.",
  direct: "Got it. Here's what I'm noticing: there seems to be a disconnect in expectations. Let's address that head-on and find a workable solution.",
  gentle: "I really appreciate you trusting me with this. It takes courage to open up about these feelings. Please know this is a safe space, and we can go at whatever pace feels right for you.",
};

export default function MediatorSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<MediatorSettings>({
    tone: 'warm',
    formality: 'balanced',
    responseLength: 'moderate',
    useEmoji: false,
    useMetaphors: true,
    culturalContext: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/mediator');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch mediator settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof MediatorSettings>(
    key: K,
    value: MediatorSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/mediator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setHasChanges(false);
      } else {
        console.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/mediator', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">AI Mediator Personality</h1>
            <p className="text-gray-600 mt-1">
              Customize how the AI mediator communicates with you
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Column */}
        <div className="space-y-6">
          {/* Tone Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-rose-500" />
                <CardTitle>Communication Tone</CardTitle>
              </div>
              <CardDescription>
                Choose how the mediator approaches conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {(Object.keys(TONE_DESCRIPTIONS) as MediatorTone[]).map((tone) => (
                  <div
                    key={tone}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      settings.tone === tone
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateSetting('tone', tone)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{TONE_DESCRIPTIONS[tone].label}</h4>
                        <p className="text-sm text-gray-600">
                          {TONE_DESCRIPTIONS[tone].description}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          settings.tone === tone
                            ? 'border-rose-500 bg-rose-500'
                            : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formality & Length */}
          <Card>
            <CardHeader>
              <CardTitle>Language Style</CardTitle>
              <CardDescription>
                Adjust formality level and response detail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Formality Level</Label>
                <Select
                  value={settings.formality}
                  onValueChange={(value) =>
                    updateSetting('formality', value as MediatorFormality)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(FORMALITY_DESCRIPTIONS) as MediatorFormality[]).map(
                      (formality) => (
                        <SelectItem key={formality} value={formality}>
                          <span className="font-medium">
                            {FORMALITY_DESCRIPTIONS[formality].label}
                          </span>{' '}
                          - {FORMALITY_DESCRIPTIONS[formality].description}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Response Length</Label>
                <Select
                  value={settings.responseLength}
                  onValueChange={(value) =>
                    updateSetting('responseLength', value as MediatorResponseLength)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(RESPONSE_LENGTH_DESCRIPTIONS) as MediatorResponseLength[]
                    ).map((length) => (
                      <SelectItem key={length} value={length}>
                        <span className="font-medium">
                          {RESPONSE_LENGTH_DESCRIPTIONS[length].label}
                        </span>{' '}
                        - {RESPONSE_LENGTH_DESCRIPTIONS[length].description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
              <CardDescription>
                Fine-tune the mediator's communication style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="useEmoji">Use Emojis</Label>
                  <p className="text-sm text-gray-500">
                    Add occasional emojis for warmth and expression
                  </p>
                </div>
                <Switch
                  id="useEmoji"
                  checked={settings.useEmoji}
                  onCheckedChange={(checked) => updateSetting('useEmoji', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="useMetaphors">Use Metaphors</Label>
                  <p className="text-sm text-gray-500">
                    Include analogies to explain complex concepts
                  </p>
                </div>
                <Switch
                  id="useMetaphors"
                  checked={settings.useMetaphors}
                  onCheckedChange={(checked) => updateSetting('useMetaphors', checked)}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="culturalContext">Cultural Context (Optional)</Label>
                <Textarea
                  id="culturalContext"
                  placeholder="Share any cultural background or preferences the mediator should consider (e.g., communication norms, religious considerations, language preferences)..."
                  value={settings.culturalContext || ''}
                  onChange={(e) =>
                    updateSetting(
                      'culturalContext',
                      e.target.value || null
                    )
                  }
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  This helps the mediator be more culturally sensitive in their responses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="lg:sticky lg:top-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-rose-500" />
                <CardTitle>Preview</CardTitle>
              </div>
              <CardDescription>
                See how the mediator will respond with your settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">AI Mediator</p>
                    <p className="text-gray-700">
                      {SAMPLE_RESPONSES[settings.tone]}
                      {settings.useEmoji && ' 💙'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-100">
                <h4 className="font-medium text-rose-900 mb-2">Current Settings</h4>
                <ul className="text-sm text-rose-800 space-y-1">
                  <li>
                    <span className="font-medium">Tone:</span>{' '}
                    {TONE_DESCRIPTIONS[settings.tone].label}
                  </li>
                  <li>
                    <span className="font-medium">Formality:</span>{' '}
                    {FORMALITY_DESCRIPTIONS[settings.formality].label}
                  </li>
                  <li>
                    <span className="font-medium">Response Length:</span>{' '}
                    {RESPONSE_LENGTH_DESCRIPTIONS[settings.responseLength].label}
                  </li>
                  <li>
                    <span className="font-medium">Emojis:</span>{' '}
                    {settings.useEmoji ? 'Enabled' : 'Disabled'}
                  </li>
                  <li>
                    <span className="font-medium">Metaphors:</span>{' '}
                    {settings.useMetaphors ? 'Enabled' : 'Disabled'}
                  </li>
                  {settings.culturalContext && (
                    <li>
                      <span className="font-medium">Cultural Context:</span>{' '}
                      <span className="italic">"{settings.culturalContext}"</span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Warm</strong> tone works well for emotional conversations
                and building trust.
              </p>
              <p>
                <strong>Professional</strong> tone is ideal for structured,
                goal-oriented sessions.
              </p>
              <p>
                <strong>Direct</strong> tone helps when you want clear,
                actionable guidance.
              </p>
              <p>
                <strong>Gentle</strong> tone is best for sensitive topics
                requiring extra care.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

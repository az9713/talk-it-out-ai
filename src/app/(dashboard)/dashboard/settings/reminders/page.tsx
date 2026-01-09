'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Calendar, Clock, Trash2, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface UserPreferences {
  emailReminders: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  defaultFollowUpDays: number;
  agreementCheckDays: number;
  emailDigest: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string | null;
}

interface Reminder {
  id: string;
  sessionId: string;
  type: 'follow_up' | 'agreement_check' | 'custom';
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  scheduledFor: string;
  message: string | null;
  session?: {
    topic: string;
  };
}

export default function RemindersSettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [prefsRes, remindersRes] = await Promise.all([
        fetch('/api/settings/preferences'),
        fetch('/api/reminders?upcoming=true'),
      ]);

      if (prefsRes.ok) {
        const prefsData = await prefsRes.json();
        setPreferences(prefsData);
      }

      if (remindersRes.ok) {
        const remindersData = await remindersRes.json();
        setReminders(remindersData);
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    if (!preferences) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        throw new Error('Failed to save preferences');
      }

      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  }

  async function cancelReminder(reminderId: string) {
    try {
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReminders((prev) =>
          prev.map((r) =>
            r.id === reminderId ? { ...r, status: 'cancelled' as const } : r
          )
        );
      }
    } catch (err) {
      setError('Failed to cancel reminder');
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getReminderTypeLabel(type: string) {
    const labels: Record<string, string> = {
      follow_up: 'Follow-up',
      agreement_check: 'Agreement Check',
      custom: 'Custom',
    };
    return labels[type] || type;
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reminder Settings</h1>
        <p className="text-gray-600">Manage your notification preferences and scheduled reminders</p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive reminder notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Reminders Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-reminders">Email Reminders</Label>
              <p className="text-sm text-gray-500">Receive reminder emails for your sessions</p>
            </div>
            <Switch
              id="email-reminders"
              checked={preferences?.emailReminders ?? true}
              onCheckedChange={(checked) =>
                setPreferences((prev) => prev ? { ...prev, emailReminders: checked } : null)
              }
            />
          </div>

          {/* Default Follow-up Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="follow-up-days">Default Follow-up (days)</Label>
              <Input
                id="follow-up-days"
                type="number"
                min={1}
                max={90}
                value={preferences?.defaultFollowUpDays ?? 7}
                onChange={(e) =>
                  setPreferences((prev) =>
                    prev ? { ...prev, defaultFollowUpDays: parseInt(e.target.value) || 7 } : null
                  )
                }
              />
              <p className="text-xs text-gray-500">Days after session completion</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreement-check-days">Agreement Check (days)</Label>
              <Input
                id="agreement-check-days"
                type="number"
                min={1}
                max={30}
                value={preferences?.agreementCheckDays ?? 3}
                onChange={(e) =>
                  setPreferences((prev) =>
                    prev ? { ...prev, agreementCheckDays: parseInt(e.target.value) || 3 } : null
                  )
                }
              />
              <p className="text-xs text-gray-500">Days after making agreements</p>
            </div>
          </div>

          {/* Email Digest */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-digest">Email Digest</Label>
              <p className="text-sm text-gray-500">Combine multiple reminders into a single email</p>
            </div>
            <Switch
              id="email-digest"
              checked={preferences?.emailDigest ?? false}
              onCheckedChange={(checked) =>
                setPreferences((prev) => prev ? { ...prev, emailDigest: checked } : null)
              }
            />
          </div>

          {/* Quiet Hours */}
          <div className="space-y-2">
            <Label>Quiet Hours (optional)</Label>
            <p className="text-sm text-gray-500 mb-2">
              Don't send reminders during these hours
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="quiet-start" className="text-xs">Start</Label>
                <Select
                  value={preferences?.quietHoursStart?.toString() ?? ''}
                  onValueChange={(v) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, quietHoursStart: v ? parseInt(v) : null } : null
                    )
                  }
                >
                  <SelectTrigger id="quiet-start">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not set</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="quiet-end" className="text-xs">End</Label>
                <Select
                  value={preferences?.quietHoursEnd?.toString() ?? ''}
                  onValueChange={(v) =>
                    setPreferences((prev) =>
                      prev ? { ...prev, quietHoursEnd: v ? parseInt(v) : null } : null
                    )
                  }
                >
                  <SelectTrigger id="quiet-end">
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not set</SelectItem>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Save Button */}
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Reminders
          </CardTitle>
          <CardDescription>
            Your scheduled session reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming reminders</p>
              <p className="text-sm mt-1">
                Reminders will be scheduled automatically when you complete sessions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    reminder.status === 'cancelled' ? 'bg-gray-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(reminder.status)}
                    <div>
                      <p className="font-medium text-sm">
                        {getReminderTypeLabel(reminder.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(reminder.scheduledFor)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/sessions/${reminder.sessionId}`}>
                      <Button variant="ghost" size="sm">
                        View Session
                      </Button>
                    </Link>
                    {reminder.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelReminder(reminder.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

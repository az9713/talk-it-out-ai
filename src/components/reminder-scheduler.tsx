'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Calendar, Clock, Plus } from 'lucide-react';

interface ReminderSchedulerProps {
  sessionId: string;
  onReminderCreated?: () => void;
}

type ReminderType = 'follow_up' | 'agreement_check' | 'custom';

const PRESET_OPTIONS = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 1 month', days: 30 },
];

export function ReminderScheduler({ sessionId, onReminderCreated }: ReminderSchedulerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [reminderType, setReminderType] = useState<ReminderType>('follow_up');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [customMessage, setCustomMessage] = useState('');

  function resetForm() {
    setReminderType('follow_up');
    setScheduledDate('');
    setScheduledTime('09:00');
    setCustomMessage('');
    setError('');
    setSuccess(false);
  }

  function setPresetDate(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setScheduledDate(date.toISOString().split('T')[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!scheduledDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);

    try {
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}:00`);

      if (scheduledFor <= new Date()) {
        setError('Scheduled time must be in the future');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          type: reminderType,
          scheduledFor: scheduledFor.toISOString(),
          message: reminderType === 'custom' ? customMessage : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create reminder');
      }

      setSuccess(true);
      onReminderCreated?.();

      // Close dialog after short delay
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Schedule Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Reminder</DialogTitle>
          <DialogDescription>
            Set a reminder to check in on this session later
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Reminder Type */}
          <div className="space-y-2">
            <Label htmlFor="reminder-type">Reminder Type</Label>
            <Select
              value={reminderType}
              onValueChange={(v) => setReminderType(v as ReminderType)}
            >
              <SelectTrigger id="reminder-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="follow_up">Follow-up Check-in</SelectItem>
                <SelectItem value="agreement_check">Agreement Review</SelectItem>
                <SelectItem value="custom">Custom Reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Message (only for custom type) */}
          {reminderType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-message">Custom Message</Label>
              <Textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="What would you like to be reminded about?"
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_OPTIONS.map((option) => (
                <Button
                  key={option.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetDate(option.days)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              Reminder scheduled successfully!
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading || success}>
            {loading ? (
              'Scheduling...'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Reminder
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

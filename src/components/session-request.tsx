'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageCircle, Clock, AlertCircle, Check, X, Calendar } from 'lucide-react';
import { URGENCY_LABELS, URGENCY_COLORS } from '@/services/session-requests';
import { formatDistanceToNow } from 'date-fns';

interface Partner {
  id: string;
  name: string | null;
  email: string;
  partnershipId: string;
}

interface SessionRequestDialogProps {
  partners: Partner[];
  onSubmit: (data: SessionRequestData) => Promise<void>;
  trigger?: React.ReactNode;
}

export interface SessionRequestData {
  toUserId: string;
  partnershipId: string;
  topic?: string;
  urgency: 'whenever' | 'soon' | 'important';
  message?: string;
}

export function SessionRequestDialog({ partners, onSubmit, trigger }: SessionRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(
    partners.length === 1 ? partners[0] : null
  );
  const [topic, setTopic] = useState('');
  const [urgency, setUrgency] = useState<'whenever' | 'soon' | 'important'>('whenever');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPartner) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        toUserId: selectedPartner.id,
        partnershipId: selectedPartner.partnershipId,
        topic: topic.trim() || undefined,
        urgency,
        message: message.trim() || undefined,
      });
      setOpen(false);
      // Reset form
      setTopic('');
      setUrgency('whenever');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <MessageCircle className="w-4 h-4 mr-2" />
            Request to Talk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Conversation</DialogTitle>
          <DialogDescription>
            Send a gentle request to your partner when you'd like to talk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {partners.length > 1 && (
            <div className="space-y-2">
              <Label>Who would you like to talk with?</Label>
              <div className="space-y-2">
                {partners.map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedPartner?.id === partner.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{partner.name || partner.email}</p>
                    {partner.name && (
                      <p className="text-sm text-muted-foreground">{partner.email}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              id="topic"
              placeholder="What would you like to discuss?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>How soon would you like to talk?</Label>
            <RadioGroup value={urgency} onValueChange={(v: string) => setUrgency(v as typeof urgency)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="whenever" id="whenever" />
                <Label htmlFor="whenever" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {URGENCY_LABELS.whenever}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="soon" id="soon" />
                <Label htmlFor="soon" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  {URGENCY_LABELS.soon}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="important" id="important" />
                <Label htmlFor="important" className="flex items-center gap-2 cursor-pointer">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  {URGENCY_LABELS.important}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a note for your partner..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPartner || isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SessionRequestCardProps {
  request: {
    id: string;
    fromUser?: { name: string | null; email: string };
    toUser?: { name: string | null; email: string };
    topic: string | null;
    urgency: 'whenever' | 'soon' | 'important';
    message: string | null;
    status: 'pending' | 'accepted' | 'declined' | 'rescheduled' | 'expired';
    createdAt: Date;
    scheduledFor: Date | null;
  };
  isReceived: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}

export function SessionRequestCard({
  request,
  isReceived,
  onAccept,
  onDecline,
  onCancel,
}: SessionRequestCardProps) {
  const otherPerson = isReceived ? request.fromUser : request.toUser;
  const personName = otherPerson?.name || otherPerson?.email || 'Unknown';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {isReceived
                ? `${personName} wants to talk`
                : `Request to ${personName}`}
            </CardTitle>
            <CardDescription>
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge className={URGENCY_COLORS[request.urgency]}>
            {request.urgency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {request.topic && (
          <div>
            <p className="text-xs text-muted-foreground">Topic</p>
            <p className="text-sm">{request.topic}</p>
          </div>
        )}

        {request.message && (
          <div>
            <p className="text-xs text-muted-foreground">Message</p>
            <p className="text-sm italic">"{request.message}"</p>
          </div>
        )}

        {request.status === 'pending' && isReceived && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onAccept}>
              <Check className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={onDecline}>
              <X className="w-4 h-4 mr-1" />
              Not Now
            </Button>
          </div>
        )}

        {request.status === 'pending' && !isReceived && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Cancel Request
            </Button>
          </div>
        )}

        {request.status === 'accepted' && request.scheduledFor && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Calendar className="w-4 h-4" />
            Scheduled for {new Date(request.scheduledFor).toLocaleString()}
          </div>
        )}

        {request.status === 'declined' && (
          <p className="text-sm text-muted-foreground">Request declined</p>
        )}

        {request.status === 'expired' && (
          <p className="text-sm text-muted-foreground">Request expired</p>
        )}
      </CardContent>
    </Card>
  );
}

// Notification badge for pending requests
interface RequestNotificationBadgeProps {
  count: number;
}

export function RequestNotificationBadge({ count }: RequestNotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
      {count > 9 ? '9+' : count}
    </span>
  );
}

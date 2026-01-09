'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Copy, Check, RefreshCw, Link2, Clock, X } from 'lucide-react';

interface SessionInviteDialogProps {
  sessionId: string;
  disabled?: boolean;
}

interface InviteStatus {
  hasInvite: boolean;
  inviteCode: string | null;
  inviteUrl: string | null;
  expiresAt: string | null;
  isExpired: boolean;
}

export function SessionInviteDialog({ sessionId, disabled }: SessionInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchInviteStatus();
    }
  }, [open]);

  async function fetchInviteStatus() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/invite`);
      if (res.ok) {
        const data = await res.json();
        setInviteStatus(data);
      }
    } catch {
      console.error('Failed to fetch invite status');
    }
  }

  async function generateInvite() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sessions/${sessionId}/invite`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setInviteStatus({
          hasInvite: true,
          inviteCode: data.inviteCode,
          inviteUrl: data.inviteUrl,
          expiresAt: data.expiresAt,
          isExpired: false,
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to generate invite');
      }
    } catch {
      setError('Failed to generate invite');
    } finally {
      setLoading(false);
    }
  }

  async function revokeInvite() {
    setLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/invite`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setInviteStatus({ hasInvite: false, inviteCode: null, inviteUrl: null, expiresAt: null, isExpired: false });
      }
    } catch {
      console.error('Failed to revoke invite');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatExpiry(expiresAt: string) {
    const date = new Date(expiresAt);
    const now = new Date();
    const hoursLeft = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hoursLeft < 1) {
      const minutesLeft = Math.round((date.getTime() - now.getTime()) / (1000 * 60));
      return `Expires in ${minutesLeft} minutes`;
    }
    return `Expires in ${hoursLeft} hours`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Your Partner</DialogTitle>
          <DialogDescription>
            Share this link with your partner to invite them to this session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!inviteStatus?.hasInvite ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">
                Generate an invite link to share with your partner
              </p>
              <Button onClick={generateInvite} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate Invite Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Invite Code
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteStatus.inviteCode || ''}
                    readOnly
                    className="font-mono text-center text-lg tracking-widest"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(inviteStatus.inviteCode || '')}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Invite Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inviteStatus.inviteUrl || ''}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(inviteStatus.inviteUrl || '')}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {inviteStatus.expiresAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {formatExpiry(inviteStatus.expiresAt)}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={generateInvite}
                  disabled={loading}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={revokeInvite}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Revoke
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

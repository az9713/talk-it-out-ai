'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface SessionPreview {
  id: string;
  topic: string;
  initiatorName: string;
  status: string;
  createdAt: string;
}

export default function JoinSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');

  const [inviteCode, setInviteCode] = useState(codeFromUrl || '');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionPreview, setSessionPreview] = useState<SessionPreview | null>(null);

  useEffect(() => {
    if (codeFromUrl) {
      fetchSessionPreview(codeFromUrl);
    }
  }, [codeFromUrl]);

  async function fetchSessionPreview(code: string) {
    if (!code) return;

    setPreviewLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/sessions/join?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setSessionPreview(data);
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid invite code');
        setSessionPreview(null);
      }
    } catch {
      setError('Failed to verify invite code');
      setSessionPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    await fetchSessionPreview(inviteCode.trim().toUpperCase());
  }

  async function handleJoin() {
    if (!sessionPreview) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          displayName: displayName.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/sessions/${data.sessionId}`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to join session');
      }
    } catch {
      setError('Failed to join session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-rose-600" />
          </div>
          <CardTitle>Join a Session</CardTitle>
          <CardDescription>
            Enter an invite code to join a collaborative conflict resolution session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!sessionPreview ? (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={8}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!inviteCode.trim() || previewLoading}
              >
                {previewLoading ? 'Verifying...' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Valid Invite</h3>
                    <p className="text-sm text-green-700 mt-1">
                      You&apos;re invited to join a session with {sessionPreview.initiatorName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Session Topic</h4>
                <p className="text-gray-700">{sessionPreview.topic}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Your Display Name (optional)</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should you be referred to in this session?"
                />
                <p className="text-xs text-gray-500">
                  This helps personalize the conversation
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSessionPreview(null);
                    setError('');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoin}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Joining...' : 'Join Session'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

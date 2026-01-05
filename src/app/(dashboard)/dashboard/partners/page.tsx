'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Copy, Check, UserPlus } from 'lucide-react';

interface Partnership {
  id: string;
  inviteCode: string;
  status: 'pending' | 'active' | 'ended';
  user1: { id: string; name: string | null; email: string; image: string | null };
  user2: { id: string; name: string | null; email: string; image: string | null } | null;
}

export default function PartnersPage() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchPartnerships();
  }, []);

  async function fetchPartnerships() {
    try {
      const res = await fetch('/api/partnerships');
      if (res.ok) {
        const data = await res.json();
        setPartnerships(data);
      }
    } catch {
      setError('Failed to load partnerships');
    }
  }

  async function createPartnership() {
    setLoading(true);
    try {
      const res = await fetch('/api/partnerships', { method: 'POST' });
      if (res.ok) {
        await fetchPartnerships();
      }
    } catch {
      setError('Failed to create partnership');
    } finally {
      setLoading(false);
    }
  }

  async function acceptInvite() {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/partnerships/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      if (res.ok) {
        setInviteCode('');
        await fetchPartnerships();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to accept invite');
      }
    } catch {
      setError('Failed to accept invite');
    } finally {
      setLoading(false);
    }
  }

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  const activePartnerships = partnerships.filter((p) => p.status === 'active');
  const pendingPartnerships = partnerships.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Partners</h1>
        <p className="text-gray-600 mt-2">
          Connect with your partner or teammates to start resolving conflicts together.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Invite Link</CardTitle>
            <CardDescription>
              Generate a unique code to invite your partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createPartnership} disabled={loading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Generate Invite Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accept Invite</CardTitle>
            <CardDescription>
              Enter an invite code from your partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <Button onClick={acceptInvite} disabled={loading || !inviteCode.trim()}>
                Accept
              </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      </div>

      {pendingPartnerships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>
              Share these codes with your partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPartnerships.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-mono text-lg">{p.inviteCode}</p>
                    <p className="text-sm text-gray-500">Waiting for partner to accept</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteCode(p.inviteCode)}
                  >
                    {copied === p.inviteCode ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activePartnerships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Partners</CardTitle>
            <CardDescription>
              Your connected partners for conflict resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activePartnerships.map((p) => {
                const partner = p.user2;
                if (!partner) return null;

                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <Avatar>
                      <AvatarImage src={partner.image || ''} />
                      <AvatarFallback>
                        {partner.name?.charAt(0) || partner.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{partner.name || partner.email}</p>
                      <p className="text-sm text-gray-500">{partner.email}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/dashboard/sessions/new?partnership=${p.id}`}>
                        Start Session
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {partnerships.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No partners yet</h3>
            <p className="text-gray-500 mt-2">
              Create an invite code and share it with your partner to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

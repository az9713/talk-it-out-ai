'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, User } from 'lucide-react';

interface Participant {
  id: string;
  userId: string;
  role: 'initiator' | 'partner';
  displayName: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface ParticipantPresenceProps {
  sessionId: string;
  currentUserId: string;
  typingUsers?: Map<string, string>;
}

export function ParticipantPresence({
  sessionId,
  currentUserId,
  typingUsers = new Map(),
}: ParticipantPresenceProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
    // Refresh every 30 seconds
    const interval = setInterval(fetchParticipants, 30000);
    return () => clearInterval(interval);
  }, [sessionId]);

  async function fetchParticipants() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/participants`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
        setIsCollaborative(data.isCollaborative);
      }
    } catch {
      console.error('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  }

  function getDisplayName(participant: Participant): string {
    if (participant.displayName) return participant.displayName;
    if (participant.user?.name) return participant.user.name;
    return participant.role === 'initiator' ? 'Person A' : 'Person B';
  }

  function getInitials(participant: Participant): string {
    const name = getDisplayName(participant);
    return name.charAt(0).toUpperCase();
  }

  function isOnline(participant: Participant): boolean {
    if (!participant.lastSeenAt) return participant.isActive;
    const lastSeen = new Date(participant.lastSeenAt);
    const now = new Date();
    // Consider online if seen in last 2 minutes
    return now.getTime() - lastSeen.getTime() < 2 * 60 * 1000;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="h-4 w-4" />
        Loading...
      </div>
    );
  }

  if (!isCollaborative || participants.length < 2) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <User className="h-4 w-4" />
        Solo session
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {participants.map((participant) => {
          const online = isOnline(participant);
          const isTyping = typingUsers.has(participant.userId);
          const isCurrentUser = participant.userId === currentUserId;

          return (
            <div key={participant.id} className="relative">
              <Avatar
                className={`h-8 w-8 border-2 ${
                  online ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <AvatarImage src={participant.user?.image || undefined} />
                <AvatarFallback
                  className={`text-xs ${
                    participant.role === 'initiator'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {getInitials(participant)}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  online ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              {/* Typing indicator */}
              {isTyping && !isCurrentUser && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {participants.length} participants
          </span>
          <Badge variant="secondary" className="text-xs">
            Collaborative
          </Badge>
        </div>
        {typingUsers.size > 0 && (
          <p className="text-xs text-gray-500 animate-pulse">
            {Array.from(typingUsers.values())
              .filter((name) => !participants.some(
                (p) => p.userId === currentUserId && getDisplayName(p) === name
              ))
              .join(', ')} is typing...
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { ExportButton } from '@/components/export-button';
import { SessionInviteDialog } from '@/components/session-invite-dialog';
import { ParticipantPresence } from '@/components/participant-presence';
import { useRealtimeMessages, useTypingIndicator, type RealtimeMessage } from '@/hooks/use-realtime-messages';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  userId?: string | null;
}

interface SessionData {
  id: string;
  topic: string;
  sessionMode: 'solo' | 'collaborative';
  initiatorId: string;
  status: string;
}

export default function SessionPage() {
  const params = useParams();
  const { data: authSession } = useSession();
  const sessionId = params.id as string;
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Handle incoming real-time messages
  const handleNewMessage = useCallback((message: RealtimeMessage) => {
    // Avoid duplicate messages
    if (processedMessageIds.current.has(message.id)) {
      return;
    }
    processedMessageIds.current.add(message.id);

    setMessages((prev) => {
      // Check if message already exists
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, {
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        userId: message.userId,
      }];
    });
  }, []);

  // Real-time messaging hook
  const { isConnected, typingUsers, sendTypingIndicator } = useRealtimeMessages({
    sessionId,
    onNewMessage: handleNewMessage,
    enabled: true,
  });

  // Typing indicator hook
  const { handleTyping, stopTyping } = useTypingIndicator(sendTypingIndicator);

  useEffect(() => {
    fetchSessionData();
    fetchMessages();
  }, [sessionId]);

  async function fetchSessionData() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionData({
          id: data.id,
          topic: data.topic,
          sessionMode: data.sessionMode || 'solo',
          initiatorId: data.initiatorId,
          status: data.status,
        });
      }
    } catch {
      console.error('Failed to load session data');
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Track existing message IDs to prevent duplicates
        data.forEach((m: Message) => processedMessageIds.current.add(m.id));
      }
    } catch {
      setError('Failed to load messages');
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input;
    setInput('');
    setLoading(true);
    setError('');
    stopTyping(); // Stop typing indicator when sending

    // Optimistic update
    const tempUserMessage: Message = {
      id: 'temp-user',
      role: 'user',
      content: userInput,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userInput }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();

      // Replace temp message and add assistant response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'temp-user'),
        data.userMessage,
        data.assistantMessage,
      ]);

      if (data.safetyAlert) {
        setError(`Safety alert: ${data.safetyAlert.message}`);
      }
    } catch {
      setError('Failed to send message. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== 'temp-user'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Session Chat</h2>
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="h-3 w-3" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <WifiOff className="h-3 w-3" />
              </span>
            )}
            {/* Participant presence for collaborative sessions */}
            {authSession?.user?.id && (
              <ParticipantPresence
                sessionId={sessionId}
                currentUserId={authSession.user.id}
                typingUsers={typingUsers}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Show invite button only for session initiator */}
            {sessionData?.initiatorId === authSession?.user?.id && (
              <SessionInviteDialog
                sessionId={sessionId}
                disabled={sessionData?.status !== 'active'}
              />
            )}
            <ExportButton sessionId={sessionId} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {/* Typing indicators from other users */}
            {typingUsers.size > 0 && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-500 italic">
                    {Array.from(typingUsers.values()).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                  </p>
                </div>
              </div>
            )}
            {/* AI thinking indicator */}
            {loading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping(); // Send typing indicator
              }}
              placeholder="Share your thoughts..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              onBlur={stopTyping} // Stop typing when input loses focus
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Channel } from 'pusher-js';
import {
  getPusherClient,
  getSessionChannel,
  PUSHER_EVENTS,
  type NewMessagePayload,
  type TypingPayload,
} from '@/lib/pusher/client';

export interface RealtimeMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  userId?: string | null;
  createdAt: string;
}

interface UseRealtimeMessagesOptions {
  sessionId: string;
  onNewMessage?: (message: RealtimeMessage) => void;
  onTypingChange?: (typing: { userId: string; userName: string; isTyping: boolean }) => void;
  enabled?: boolean;
}

interface UseRealtimeMessagesReturn {
  isConnected: boolean;
  typingUsers: Map<string, string>; // userId -> userName
  sendTypingIndicator: (isTyping: boolean) => Promise<void>;
}

export function useRealtimeMessages({
  sessionId,
  onNewMessage,
  onTypingChange,
  enabled = true,
}: UseRealtimeMessagesOptions): UseRealtimeMessagesReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const channelRef = useRef<Channel | null>(null);
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear typing indicator after timeout
  const clearTypingTimeout = useCallback((userId: string) => {
    const existing = typingTimeoutsRef.current.get(userId);
    if (existing) {
      clearTimeout(existing);
      typingTimeoutsRef.current.delete(userId);
    }
  }, []);

  const setTypingTimeout = useCallback((userId: string, userName: string) => {
    clearTypingTimeout(userId);

    const timeout = setTimeout(() => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
      typingTimeoutsRef.current.delete(userId);
    }, 3000); // Clear after 3 seconds of no typing

    typingTimeoutsRef.current.set(userId, timeout);
  }, [clearTypingTimeout]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) {
      // Pusher not configured - skip real-time features
      return;
    }

    const channelName = getSessionChannel(sessionId);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Handle connection state
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind('pusher:subscription_error', () => {
      setIsConnected(false);
    });

    // Handle new messages
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: NewMessagePayload) => {
      const message: RealtimeMessage = {
        id: data.id,
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        userId: data.userId,
        createdAt: data.createdAt,
      };

      onNewMessage?.(message);
    });

    // Handle typing indicators
    channel.bind(PUSHER_EVENTS.TYPING_START, (data: TypingPayload) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(data.userId, data.userName);
        return next;
      });
      setTypingTimeout(data.userId, data.userName);
      onTypingChange?.({ ...data, isTyping: true });
    });

    channel.bind(PUSHER_EVENTS.TYPING_STOP, (data: TypingPayload) => {
      clearTypingTimeout(data.userId);
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
      onTypingChange?.({ ...data, isTyping: false });
    });

    // Cleanup
    return () => {
      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();

      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
      setIsConnected(false);
      setTypingUsers(new Map());
    };
  }, [sessionId, enabled, onNewMessage, onTypingChange, setTypingTimeout, clearTypingTimeout]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      try {
        await fetch(`/api/sessions/${sessionId}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isTyping }),
        });
      } catch (error) {
        console.error('Failed to send typing indicator:', error);
      }
    },
    [sessionId]
  );

  return {
    isConnected,
    typingUsers,
    sendTypingIndicator,
  };
}

// Hook for debounced typing indicator
export function useTypingIndicator(
  sendTypingIndicator: (isTyping: boolean) => Promise<void>,
  debounceMs: number = 500
) {
  const typingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = useCallback(() => {
    if (!typingRef.current) {
      typingRef.current = true;
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      sendTypingIndicator(false);
    }, debounceMs);
  }, [sendTypingIndicator, debounceMs]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (typingRef.current) {
      typingRef.current = false;
      sendTypingIndicator(false);
    }
  }, [sendTypingIndicator]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleTyping, stopTyping };
}

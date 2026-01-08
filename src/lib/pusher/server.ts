import Pusher from 'pusher';

// Server-side Pusher instance for triggering events
// Requires environment variables:
// - PUSHER_APP_ID
// - PUSHER_SECRET
// - NEXT_PUBLIC_PUSHER_KEY
// - NEXT_PUBLIC_PUSHER_CLUSTER

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!appId || !key || !secret || !cluster) {
      // Return a mock pusher that does nothing if not configured
      // This allows the app to work without Pusher for development
      return {
        trigger: async () => ({}),
      } as unknown as Pusher;
    }

    pusherInstance = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
    });
  }

  return pusherInstance;
}

// Channel naming conventions
export function getSessionChannel(sessionId: string): string {
  return `session-${sessionId}`;
}

export function getPrivateSessionChannel(sessionId: string): string {
  return `private-session-${sessionId}`;
}

// Event types
export const PUSHER_EVENTS = {
  NEW_MESSAGE: 'new-message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  SESSION_UPDATED: 'session-updated',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
} as const;

export type PusherEventType = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS];

// Message payload types
export interface NewMessagePayload {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface TypingPayload {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface SessionUpdatedPayload {
  sessionId: string;
  stage: string;
  status: string;
}

// Helper to trigger events
export async function triggerSessionEvent<T>(
  sessionId: string,
  event: PusherEventType,
  data: T
): Promise<void> {
  const pusher = getPusher();
  const channel = getSessionChannel(sessionId);

  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error('Failed to trigger Pusher event:', error);
    // Don't throw - allow the app to continue even if Pusher fails
  }
}

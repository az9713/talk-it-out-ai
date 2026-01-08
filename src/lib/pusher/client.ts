'use client';

import PusherClient from 'pusher-js';

// Client-side Pusher instance for subscribing to channels
// Uses public environment variables:
// - NEXT_PUBLIC_PUSHER_KEY
// - NEXT_PUBLIC_PUSHER_CLUSTER

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      // Pusher not configured - return null
      return null;
    }

    pusherClient = new PusherClient(key, {
      cluster,
      forceTLS: true,
    });
  }

  return pusherClient;
}

// Cleanup function for when component unmounts
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}

// Re-export types and constants from server for consistency
export { PUSHER_EVENTS, getSessionChannel } from './server';
export type { NewMessagePayload, TypingPayload, SessionUpdatedPayload } from './server';

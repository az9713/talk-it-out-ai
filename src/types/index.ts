// Session stage enum - represents the NVC conversation flow
export type SessionStage =
  | 'intake'
  | 'person_a_observation'
  | 'person_a_feeling'
  | 'person_a_need'
  | 'person_a_request'
  | 'reflection_a'
  | 'person_b_observation'
  | 'person_b_feeling'
  | 'person_b_need'
  | 'person_b_request'
  | 'reflection_b'
  | 'common_ground'
  | 'agreement'
  | 'complete';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type MessageRole = 'user' | 'assistant' | 'system';

export type PartnershipStatus = 'pending' | 'active' | 'ended';

// Database model types (will match Drizzle schema)
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partnership {
  id: string;
  user1Id: string;
  user2Id: string | null;
  inviteCode: string;
  status: PartnershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  partnershipId: string;
  initiatorId: string;
  topic: string;
  stage: SessionStage;
  status: SessionStatus;
  currentSpeakerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  userId: string | null;
  role: MessageRole;
  content: string;
  stage: SessionStage;
  createdAt: Date;
}

export interface Perspective {
  id: string;
  sessionId: string;
  userId: string;
  observation: string | null;
  feeling: string | null;
  need: string | null;
  request: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agreement {
  id: string;
  sessionId: string;
  content: string;
  agreedByUser1: boolean;
  agreedByUser2: boolean;
  createdAt: Date;
}

// API request/response types
export interface CreateSessionRequest {
  partnershipId: string;
  topic: string;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
}

export interface AIResponse {
  message: string;
  nextStage?: SessionStage;
  requiresPartnerInput?: boolean;
  safetyAlert?: {
    type: 'crisis' | 'escalation' | 'abuse';
    message: string;
  };
}

// Session context for AI
export interface SessionContext {
  session: Session;
  messages: Message[];
  perspectives: {
    personA?: Perspective;
    personB?: Perspective;
  };
  currentUser: User;
  partner?: User;
}

// Mediator personality types and prompt builder

export type MediatorTone = 'warm' | 'professional' | 'direct' | 'gentle';
export type MediatorFormality = 'casual' | 'balanced' | 'formal';
export type MediatorResponseLength = 'concise' | 'moderate' | 'detailed';

export interface MediatorPersonality {
  tone: MediatorTone;
  formality: MediatorFormality;
  responseLength: MediatorResponseLength;
  useEmoji: boolean;
  useMetaphors: boolean;
  culturalContext?: string | null;
}

export const DEFAULT_PERSONALITY: MediatorPersonality = {
  tone: 'warm',
  formality: 'balanced',
  responseLength: 'moderate',
  useEmoji: false,
  useMetaphors: true,
};

const TONE_PROMPTS: Record<MediatorTone, string> = {
  warm: `Use a warm, empathetic tone throughout your responses. Express genuine care and understanding.
Make the user feel heard and supported. Use phrases like "I understand," "That sounds difficult," and "Thank you for sharing."`,

  professional: `Maintain a professional, composed tone. Be supportive but businesslike.
Keep responses focused and structured. Use clear, respectful language without being cold or distant.`,

  direct: `Be direct and straightforward in your communication. Get to the point efficiently while remaining respectful.
Avoid excessive hedging or over-explanation. State observations and suggestions clearly.`,

  gentle: `Use an especially gentle, nurturing tone. Be extra careful with sensitive topics and emotions.
Speak softly and reassuringly. Validate feelings frequently and create a very safe, non-judgmental space.`,
};

const FORMALITY_PROMPTS: Record<MediatorFormality, string> = {
  casual: `Use casual, conversational language. Feel free to use contractions and informal expressions.
Write as if having a friendly conversation. Avoid stiff or overly academic language.`,

  balanced: `Use a balanced mix of professional and conversational language.
Be approachable but maintain appropriate boundaries. Adapt your formality to match the user's style.`,

  formal: `Use formal, proper language throughout. Maintain professional decorum.
Avoid contractions and colloquialisms. Use complete sentences and proper grammar at all times.`,
};

const RESPONSE_LENGTH_PROMPTS: Record<MediatorResponseLength, string> = {
  concise: `Keep responses brief and focused. Aim for 2-3 sentences when possible.
Get to the essential point quickly. Only elaborate when absolutely necessary.`,

  moderate: `Provide balanced responses with enough detail to be helpful but not overwhelming.
Use 3-5 sentences typically. Include relevant context and explanation.`,

  detailed: `Provide thorough, comprehensive responses. Take time to fully explore each topic.
Include examples, context, and nuanced explanations. Don't rush through important points.`,
};

/**
 * Builds a personality modifier prompt based on user preferences
 */
export function buildPersonalityPrompt(personality: MediatorPersonality): string {
  const sections: string[] = [];

  // Add tone instructions
  sections.push('## Communication Style');
  sections.push(TONE_PROMPTS[personality.tone]);

  // Add formality instructions
  sections.push('## Language Formality');
  sections.push(FORMALITY_PROMPTS[personality.formality]);

  // Add response length instructions
  sections.push('## Response Length');
  sections.push(RESPONSE_LENGTH_PROMPTS[personality.responseLength]);

  // Add emoji instructions
  if (personality.useEmoji) {
    sections.push('## Emoji Usage');
    sections.push('Feel free to use appropriate emojis sparingly to add warmth and expressiveness. Use them to emphasize emotions or soften messages, but don\'t overuse them.');
  } else {
    sections.push('## Emoji Usage');
    sections.push('Do not use emojis in your responses. Keep communication text-based and professional.');
  }

  // Add metaphor instructions
  if (personality.useMetaphors) {
    sections.push('## Metaphors and Analogies');
    sections.push('Use metaphors and analogies when they can help clarify concepts or make abstract ideas more relatable. Draw from everyday experiences to illustrate points about communication and relationships.');
  } else {
    sections.push('## Metaphors and Analogies');
    sections.push('Avoid using metaphors or analogies. Communicate ideas directly and literally. Focus on clear, straightforward explanations.');
  }

  // Add cultural context if provided
  if (personality.culturalContext) {
    sections.push('## Cultural Considerations');
    sections.push(`The user has noted the following cultural context to consider: "${personality.culturalContext}". Be mindful of this in your communication style and recommendations.`);
  }

  return sections.join('\n\n');
}

/**
 * Example personalities for different presets
 */
export const PERSONALITY_PRESETS = {
  'warm-casual': {
    tone: 'warm' as const,
    formality: 'casual' as const,
    responseLength: 'moderate' as const,
    useEmoji: true,
    useMetaphors: true,
  },
  'professional-formal': {
    tone: 'professional' as const,
    formality: 'formal' as const,
    responseLength: 'detailed' as const,
    useEmoji: false,
    useMetaphors: false,
  },
  'direct-concise': {
    tone: 'direct' as const,
    formality: 'balanced' as const,
    responseLength: 'concise' as const,
    useEmoji: false,
    useMetaphors: false,
  },
  'gentle-supportive': {
    tone: 'gentle' as const,
    formality: 'casual' as const,
    responseLength: 'detailed' as const,
    useEmoji: true,
    useMetaphors: true,
  },
};

/**
 * Tone descriptions for UI display
 */
export const TONE_DESCRIPTIONS: Record<MediatorTone, { label: string; description: string }> = {
  warm: {
    label: 'Warm',
    description: 'Empathetic and caring, like talking to a supportive friend',
  },
  professional: {
    label: 'Professional',
    description: 'Composed and structured, like a skilled counselor',
  },
  direct: {
    label: 'Direct',
    description: 'Straightforward and efficient, getting to the point',
  },
  gentle: {
    label: 'Gentle',
    description: 'Extra soft and nurturing, very careful with sensitive topics',
  },
};

export const FORMALITY_DESCRIPTIONS: Record<MediatorFormality, { label: string; description: string }> = {
  casual: {
    label: 'Casual',
    description: 'Relaxed and conversational',
  },
  balanced: {
    label: 'Balanced',
    description: 'Mix of professional and approachable',
  },
  formal: {
    label: 'Formal',
    description: 'Proper and professional language',
  },
};

export const RESPONSE_LENGTH_DESCRIPTIONS: Record<MediatorResponseLength, { label: string; description: string }> = {
  concise: {
    label: 'Concise',
    description: 'Brief and to the point',
  },
  moderate: {
    label: 'Moderate',
    description: 'Balanced detail level',
  },
  detailed: {
    label: 'Detailed',
    description: 'Thorough explanations',
  },
};

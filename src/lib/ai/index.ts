import Anthropic from '@anthropic-ai/sdk';
import {
  SYSTEM_PROMPT,
  STAGE_PROMPTS,
  SAFETY_PROMPT,
  CRISIS_RESOURCES,
  COLLABORATIVE_SYSTEM_PROMPT,
  COLLABORATIVE_STAGE_PROMPTS,
} from './prompts';
import { buildPersonalityPrompt, DEFAULT_PERSONALITY, type MediatorPersonality } from './personality';
import type { SessionStage, Message, AIResponse } from '@/types';

export type SessionMode = 'solo' | 'collaborative';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SafetyCheckResult {
  safe: boolean;
  concerns: {
    crisis: boolean;
    abuse: boolean;
    escalation: boolean;
  };
  reason?: string;
}

export async function checkSafety(message: string): Promise<SafetyCheckResult> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `${SAFETY_PROMPT}\n\nMessage to analyze: "${message}"`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = JSON.parse(text);
    return parsed as SafetyCheckResult;
  } catch {
    // Default to safe if parsing fails
    return { safe: true, concerns: { crisis: false, abuse: false, escalation: false } };
  }
}

export async function generateResponse(
  messages: Message[],
  currentStage: SessionStage,
  userMessage: string,
  personality?: MediatorPersonality,
  sessionMode: SessionMode = 'solo'
): Promise<AIResponse> {
  // Check safety first
  const safetyCheck = await checkSafety(userMessage);

  if (!safetyCheck.safe) {
    if (safetyCheck.concerns.crisis) {
      return {
        message: CRISIS_RESOURCES,
        safetyAlert: { type: 'crisis', message: 'Crisis indicators detected' },
      };
    }
    if (safetyCheck.concerns.abuse) {
      return {
        message: CRISIS_RESOURCES,
        safetyAlert: { type: 'abuse', message: 'Potential abuse indicators detected' },
      };
    }
    if (safetyCheck.concerns.escalation) {
      return {
        message: `I notice things are getting heated. Let's take a moment to breathe.

Remember, the goal isn't to win - it's to understand each other better. Would you like to:
1. Take a short break and come back in a few minutes
2. Rephrase your thoughts more calmly
3. Move to a different aspect of the situation

What feels right to you?`,
        safetyAlert: { type: 'escalation', message: 'Escalation detected' },
      };
    }
  }

  // Build conversation history for Claude
  const conversationHistory = messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  // Add the current user message
  conversationHistory.push({
    role: 'user',
    content: userMessage,
  });

  // Select prompts based on session mode
  const isCollaborative = sessionMode === 'collaborative';
  const systemPrompt = isCollaborative ? COLLABORATIVE_SYSTEM_PROMPT : SYSTEM_PROMPT;
  const stagePrompts = isCollaborative ? COLLABORATIVE_STAGE_PROMPTS : STAGE_PROMPTS;
  const stagePrompt = stagePrompts[currentStage] || '';

  // Build personality modifier if provided
  const personalityPrompt = personality
    ? buildPersonalityPrompt(personality)
    : buildPersonalityPrompt(DEFAULT_PERSONALITY);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `${systemPrompt}\n\n${personalityPrompt}\n\nCurrent stage: ${currentStage}\n\n${stagePrompt}`,
      messages: conversationHistory,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Determine next stage based on response and current stage
    const nextStage = determineNextStage(currentStage, text);

    return {
      message: text,
      nextStage: nextStage !== currentStage ? nextStage : undefined,
    };
  } catch (error) {
    console.error('AI response error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate response: ${errorMessage}`);
  }
}

function determineNextStage(currentStage: SessionStage, response: string): SessionStage {
  const stageOrder: SessionStage[] = [
    'intake',
    'person_a_observation',
    'person_a_feeling',
    'person_a_need',
    'person_a_request',
    'reflection_a',
    'person_b_observation',
    'person_b_feeling',
    'person_b_need',
    'person_b_request',
    'reflection_b',
    'common_ground',
    'agreement',
    'complete',
  ];

  const currentIndex = stageOrder.indexOf(currentStage);

  // Look for indicators in the response that we should move to next stage
  const progressIndicators = [
    'thank you for sharing',
    "let's move on",
    'now that we have',
    "let's hear from",
    'person b',
    'next step',
    'summarize',
    'agreement',
    'conclude',
  ];

  const shouldProgress = progressIndicators.some((indicator) =>
    response.toLowerCase().includes(indicator)
  );

  if (shouldProgress && currentIndex < stageOrder.length - 1) {
    return stageOrder[currentIndex + 1];
  }

  return currentStage;
}

export async function generateWelcome(
  templateContext?: string,
  personality?: MediatorPersonality,
  sessionMode: SessionMode = 'solo'
): Promise<string> {
  const isCollaborative = sessionMode === 'collaborative';

  try {
    let prompt: string;

    if (isCollaborative) {
      prompt = templateContext
        ? `Start a new collaborative conflict resolution session. Both participants are present. They want to discuss the following topic:

"${templateContext}"

Welcome them both warmly by acknowledging they're here together to work through something important. Create a safe space and explain briefly how the process will work with both of them sharing their perspectives. Ask who would like to share their experience first.`
        : 'Start a new collaborative conflict resolution session. Both participants are present. Welcome them warmly, acknowledge their courage in doing this together, and ask them to describe the situation they want to work through. Explain that each person will have a chance to share their perspective.';
    } else {
      prompt = templateContext
        ? `Start a new conflict resolution session. The participant has indicated they want to discuss the following topic:

"${templateContext}"

Greet them warmly, acknowledge this topic, and ask them to share more details about their specific situation and how they're feeling about it. Be empathetic and create a safe space for them to open up.`
        : 'Start a new conflict resolution session. Greet the participants warmly and ask them to describe the situation they want to work through.';
    }

    // Build personality modifier if provided
    const personalityPrompt = personality
      ? buildPersonalityPrompt(personality)
      : buildPersonalityPrompt(DEFAULT_PERSONALITY);

    // Select system prompt based on mode
    const systemPrompt = isCollaborative ? COLLABORATIVE_SYSTEM_PROMPT : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: `${systemPrompt}\n\n${personalityPrompt}`,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  } catch (error) {
    console.error('Welcome message error:', error);
    return isCollaborative
      ? "Welcome to both of you! I'm here to help you work through this together using guided communication techniques. What situation would you like to discuss today?"
      : "Welcome! I'm here to help you work through a conflict using guided communication techniques. What situation would you like to discuss today?";
  }
}

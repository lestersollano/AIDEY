import { GoogleGenAI } from '@google/genai';

import {
  AIDEY_RESPONSE_JSON_SCHEMA,
  createFallbackReply,
  parseAideyReply,
  type AideyReply,
} from '@/types/aidey-response';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  text: string;
};

export type ChatSessionContext = {
  documentLabel?: string;
  atOfficeProximity?: {
    officeName: string;
    officeAddress?: string;
  };
};

export type ChatReply = AideyReply & {
  model: string;
};

/** Free-tier Gemini models, tried in order when one fails. */
const FREE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
] as const;

const MAX_MODEL_ATTEMPTS = 4;

function buildSystemPrompt(context?: ChatSessionContext): string {
  const documentContext = context?.documentLabel
    ? `The user is trying to obtain: ${context.documentLabel}. Keep guiding them toward that goal.`
    : 'Help the user obtain the government document or ID they need.';

  const arrivalContext = context?.atOfficeProximity
    ? `The user is now within 100 meters of ${context.atOfficeProximity.officeName}${
        context.atOfficeProximity.officeAddress
          ? ` (${context.atOfficeProximity.officeAddress})`
          : ''
      }. In the message, FIRST congratulate them for making it to the office (one short, warm sentence), THEN — only after that — give ONE short on-site instruction (e.g. which window, queue, or form to ask for). Both the congratulation and the instruction must be in the same message, congratulation first. Do NOT set mapDestination, needsLocation, or directions. `
    : '';

  return (
    'You are Aidey, a friendly virtual guide in a mobile app that helps Filipinos get government documents and IDs. ' +
    `${documentContext} ` +
    `${arrivalContext}` +
    'Reply in the same language the user writes in (Tagalog or English). ' +
    'You MUST respond with JSON matching the provided schema. ' +
    'Rules: ' +
    '(1) Give ONE short step or ONE question per reply — never long paragraphs or numbered lists in message (the arrival congratulation + instruction in rule 6 is the only exception, and it must still be brief). ' +
    '(2) Always include 2–5 suggestions chips. When asking if the user completed a task, include Oo/Yes and Hindi/No. ' +
    'Always include a clarification option like "Paano?" or "Explain more". ' +
    '(3) When the user asks about an office, nearest office, directions, how to get there, or a route — assume they want directions to that office. ' +
    'Set mapDestination with only name and query (e.g. name "PSA", query "Philippine Statistics Authority") for the most relevant agency; do NOT invent latitude/longitude. ' +
    'The app automatically uses GPS to find the nearest branch and shows the route on a map. Set needsLocation to false for these requests. ' +
    'Include an open_maps suggestion (e.g. label "Tingnan ang ruta", value "Tingnan ang ruta", action "open_maps") when mapDestination is set. ' +
    'Only set needsLocation to true and include a share_location suggestion if the user explicitly cannot share GPS or location failed before. ' +
    '(4) Use step.current to track progress (increment as the user completes steps). ' +
    '(5) Be practical for users who may be at the office right now — short, actionable guidance. ' +
    '(6) Only give on-site office instructions when the app signals the user has arrived within 100 meters of the office, and always congratulate them first before the instruction in that case; otherwise focus on getting there or preparing requirements.'
  );
}

export class AllModelsFailedError extends Error {
  constructor(message = 'All AI models failed to respond.') {
    super(message);
    this.name = 'AllModelsFailedError';
  }
}

function getApiKey() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_GEMINI_API_KEY. Add it to a .env file in the project root.',
    );
  }
  return apiKey;
}

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return client;
}

function normalizeReply(raw: string): AideyReply {
  const parsed = parseAideyReply(raw);
  if (parsed) return parsed;
  return createFallbackReply(raw);
}

async function sendMessageWithModel(
  model: string,
  history: ChatMessage[],
  newMessage: string,
  context?: ChatSessionContext,
): Promise<AideyReply> {
  const chat = getClient().chats.create({
    model,
    config: {
      systemInstruction: buildSystemPrompt(context),
      responseMimeType: 'application/json',
      responseJsonSchema: AIDEY_RESPONSE_JSON_SCHEMA,
    },
    history: history.map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.text }],
    })),
  });

  const response = await chat.sendMessage({ message: newMessage });
  const text = response.text?.trim();

  if (!text) {
    throw new Error('Walang natanggap na sagot mula sa AI.');
  }

  return normalizeReply(text);
}

export async function sendMessage(
  history: ChatMessage[],
  newMessage: string,
  context?: ChatSessionContext,
): Promise<ChatReply> {
  getApiKey();

  const models = FREE_MODELS.slice(0, MAX_MODEL_ATTEMPTS);
  let lastError: unknown;

  for (const model of models) {
    try {
      const reply = await sendMessageWithModel(model, history, newMessage, context);
      return { ...reply, model };
    } catch (error) {
      lastError = error;
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : 'Unknown AI error.';
  throw new AllModelsFailedError(detail);
}

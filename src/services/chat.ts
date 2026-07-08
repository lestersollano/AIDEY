import { GoogleGenAI } from '@google/genai';

import type { AppLocale } from '@/i18n/types';
import { getCachedLocale } from '@/contexts/locale-context';
import { translate } from '@/i18n';
import { DOCUMENTS } from '@/constants/documents';
import { getDocumentGuide, getRequirementLabel } from '@/constants/document-guides';
import type { DocumentGuideProgress } from '@/services/document-guide-progress';
import { readImageAsInlineData } from '@/utils/image-data';
import {
  AIDEY_RESPONSE_JSON_SCHEMA,
  createFallbackReply,
  parseAideyReply,
  type AideyReply,
  type ChecklistItem,
} from '@/types/aidey-response';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  text: string;
  imageUri?: string;
  imageMimeType?: string;
};

export type ChatImageInput = {
  uri: string;
  mimeType?: string;
};

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

export type ChatSessionContext = {
  documentLabel?: string;
  ownedDocumentIds?: string[];
  documentGuideProgress?: Record<string, DocumentGuideProgress>;
  atOfficeProximity?: {
    officeName: string;
    officeAddress?: string;
  };
  checklist?: ChecklistItem[];
  locale?: AppLocale;
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

const DOCUMENT_CATALOG_LIST = DOCUMENTS.map(
  (document) => `${document.id} = ${document.label}`,
).join('; ');

/** Summarizes what the user has already accomplished on their own inside the
 * app's step-by-step document guides (requirements/steps checklists, section
 * completion) — independent of anything discussed in this chat — so Aidey
 * doesn't re-ask or re-explain things already done. */
function buildGuideProgressContext(
  progressByDocument?: Record<string, DocumentGuideProgress>,
  locale: AppLocale = getCachedLocale(),
): string {
  if (!progressByDocument) return '';

  const summaries = Object.entries(progressByDocument)
    .map(([documentId, progress]) => {
      const hasAnyProgress =
        progress.checkedRequirements.length > 0 ||
        progress.checkedSteps.length > 0 ||
        progress.completedSections.length > 0;
      if (!hasAnyProgress) return null;

      const guide = getDocumentGuide(documentId, locale);
      const label = DOCUMENTS.find((document) => document.id === documentId)?.label;
      if (!guide || !label) return null;

      const parts: string[] = [];

      if (progress.completedSections.includes('requirements')) {
        parts.push('fully prepared all requirements');
      } else if (progress.checkedRequirements.length > 0) {
        const items = progress.checkedRequirements
          .map((index) => guide.requirements[index] && getRequirementLabel(guide.requirements[index]))
          .filter((item): item is string => Boolean(item));
        if (items.length) parts.push(`already prepared: ${items.join('; ')}`);
      }

      if (progress.completedSections.includes('steps')) {
        parts.push('already followed/completed all the process steps');
      } else if (progress.checkedSteps.length > 0) {
        const items = progress.checkedSteps
          .map((index) => guide.steps[index]?.title)
          .filter((item): item is string => Boolean(item));
        if (items.length) parts.push(`already did: ${items.join('; ')}`);
      }

      if (progress.completedSections.includes('upload')) {
        parts.push('already uploaded/saved a photo of the finished document');
      }

      if (!parts.length) return null;
      return `${label} — ${parts.join('; ')}`;
    })
    .filter((item): item is string => Boolean(item));

  if (!summaries.length) return '';

  return (
    "The user has already made real progress on their own by completing parts of the app's step-by-step document guide screens (checking off requirements/steps, finishing sections) — this did NOT happen through this chat, but it is genuinely done. " +
    `Treat it as fact and do NOT ask the user to redo, re-confirm, or re-explain these, and do NOT re-list requirements/steps already marked done: ${summaries.join(' | ')}. `
  );
}

function buildSystemPrompt(context?: ChatSessionContext): string {
  const locale = context?.locale ?? getCachedLocale();
  const replyLanguage =
    locale === 'en-US'
      ? 'Reply in English (US). '
      : 'Reply in Filipino (Tagalog). ';

  const documentContext = context?.documentLabel
    ? `The user is trying to obtain: ${context.documentLabel}. Keep guiding them toward that goal.`
    : 'Help the user obtain the government document or ID they need.';

  const ownedDocumentLabels = context?.ownedDocumentIds
    ?.map((id) => DOCUMENTS.find((document) => document.id === id)?.label)
    .filter((label): label is NonNullable<typeof label> => Boolean(label));

  const ownedDocumentsContext = ownedDocumentLabels?.length
    ? `The user already has these saved in their document catalogue: ${ownedDocumentLabels.join(', ')}. Treat these as documents/IDs the user already possesses — do NOT ask if they already have them or tell them how to get them from scratch; only offer to help with renewal, replacement, or using them as a requirement for something else if relevant. `
    : 'The user has not saved any documents in their catalogue yet. ';

  const guideProgressContext = buildGuideProgressContext(context?.documentGuideProgress, locale);

  const checklistContext = context?.checklist?.length
    ? `The task checklist so far (id/label/done) is: ${JSON.stringify(context.checklist)}. Return this EXACT list of items (same ids, same labels, same order) in your checklist field every time, only flipping "done" to true when that milestone is actually completed. Never rename, remove, reorder, or add items to an existing checklist unless the user's goal changes to something else entirely. `
    : '';

  const arrivalContext = context?.atOfficeProximity
    ? `The user is now within 25 meters of ${context.atOfficeProximity.officeName}${
        context.atOfficeProximity.officeAddress
          ? ` (${context.atOfficeProximity.officeAddress})`
          : ''
      }. In the message, FIRST congratulate them for making it to the office (one short, warm sentence), THEN — only after that — give ONE short on-site instruction (e.g. which window, queue, or form to ask for). Both the congratulation and the instruction must be in the same message, congratulation first. Do NOT set mapDestination, needsLocation, or directions. `
    : '';

  return (
    'You are Aidey, a friendly virtual guide in a mobile app that helps Filipinos get government documents and IDs. ' +
    `${documentContext} ` +
    `${ownedDocumentsContext}` +
    `${guideProgressContext}` +
    `${checklistContext}` +
    `${arrivalContext}` +
    replyLanguage +
    'If the user writes in a different language, you may match their language instead. ' +
    'You MUST respond with JSON matching the provided schema. ' +
    'Rules: ' +
    '(1) Give ONE short step or ONE question per reply — never long paragraphs or numbered lists in message (the arrival congratulation + instruction in rule 6 is the only exception, and it must still be brief). ' +
    '(2) Always include 2–5 suggestions chips. When asking if the user completed a task, include Oo/Yes and Hindi/No. ' +
    'Always include a clarification option like "Paano?" or "Explain more". ' +
    '(3) When the user asks about an office, the location of an office, directions, how to get there, or a route — or whenever your reply will result in a map being shown — ALWAYS assume they mean whichever branch/location is closest to them, even if they do not say "nearest" or "malapit". Never ask which branch or location they mean; just proceed with the closest one. ' +
    'Set mapDestination with only name and query (e.g. name "PSA", query "Philippine Statistics Authority") for the most relevant agency; do NOT invent latitude/longitude. ' +
    'The app automatically uses GPS to find the nearest branch and shows the route on a map. Set needsLocation to false for these requests. ' +
    'Include an open_maps suggestion (e.g. label "Tingnan ang ruta", value "Tingnan ang ruta", action "open_maps") when mapDestination is set. ' +
    'Only set needsLocation to true and include a share_location suggestion if the user explicitly cannot share GPS or location failed before. ' +
    '(4) Use step.current to track progress (increment as the user completes steps). ' +
    '(5) Be practical for users who may be at the office right now — short, actionable guidance. ' +
    '(6) Only give on-site office instructions when the app signals the user has arrived within 25 meters of the office, and always congratulate them first before the instruction in that case; otherwise focus on getting there or preparing requirements. ' +
    '(7) If the user says they already have a specific document or ID (e.g. "mayroon na akong...", "I already have...", "existing na ang..."), and it is NOT already listed as owned above, ask if they want to keep/save that document in their catalogue in the app. ' +
    `Match the document to exactly one id from this catalogue list (format "id = label"): ${DOCUMENT_CATALOG_LIST}. ` +
    'Include one suggestion with action "save_document" whose value is EXACTLY that matching id (never invent an id, never use the label as the value) and whose label is a short call to action like "Itago sa Catalogue". ' +
    'Always pair it with a decline suggestion (e.g. label "Hindi muna", value "Hindi muna", action "reply"). ' +
    'Only use action "save_document" when the document clearly matches one id in the list; otherwise ask a clarifying question instead. ' +
    '(8) If the user asks what IDs/documents they already have, or which ones they are missing, answer using the owned-documents list above (compare it against the catalogue) instead of asking them to repeat what they have. If asked about their progress on a specific document, also factor in the step-by-step guide progress noted above (if any) — it counts as real, already-completed work even though it happened outside this chat. ' +
    '(9) If a checklist state is already given to you above, you MUST return that EXACT same checklist (same ids, labels, order) in the "checklist" field of every reply from now on — only flip "done" to true for a milestone once it is genuinely finished based on the conversation (e.g. user confirms they have all documents, GPS arrival is signaled, user says they talked to the clerk). Never mark an item done just because you mentioned or explained it. ' +
    'If no checklist state is given above yet, but the user has clearly stated a specific multi-step task/goal (e.g. getting a specific document or ID, going to a specific office), include a "checklist" field starting with THIS reply — do not wait — with 3-5 short milestone items covering the whole journey end-to-end (e.g. "Ihanda ang mga kinakailangang dokumento", "Pumunta sa opisina", "Kausapin ang clerk o staff", "Kumpletuhin ang application/tanggapin ang output"), each with a stable id (lowercase-kebab-case), a short label, and done=false initially. ' +
    'Do not include a checklist field for simple one-off questions, greetings, or general info that is not a multi-step journey for the user to complete. ' +
    '(11) When the user sends an image, analyze it in the context of Philippine government documents and IDs. Identify what it likely shows, note anything missing or unclear, and guide the next step.'
  );
}

async function buildUserMessageParts(message: ChatMessage): Promise<GeminiPart[]> {
  const parts: GeminiPart[] = [];

  if (message.imageUri) {
    const inlineData = await readImageAsInlineData(message.imageUri, message.imageMimeType);
    parts.push({ inlineData });
  }

  if (message.text) {
    parts.push({ text: message.text });
  }

  return parts;
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
  newImage?: ChatImageInput,
): Promise<AideyReply> {
  const chat = getClient().chats.create({
    model,
    config: {
      systemInstruction: buildSystemPrompt(context),
      responseMimeType: 'application/json',
      responseJsonSchema: AIDEY_RESPONSE_JSON_SCHEMA,
    },
    history: await Promise.all(
      history.map(async (message) => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts:
          message.role === 'user'
            ? await buildUserMessageParts(message)
            : [{ text: message.text }],
      })),
    ),
  });

  const response = await chat.sendMessage({
    message: await buildUserMessageParts({
      role: 'user',
      text: newMessage,
      imageUri: newImage?.uri,
      imageMimeType: newImage?.mimeType,
    }),
  });
  const text = response.text?.trim();

  if (!text) {
    throw new Error(translate(context?.locale ?? getCachedLocale(), 'ai.noAiResponse'));
  }

  return normalizeReply(text);
}

export async function sendMessage(
  history: ChatMessage[],
  newMessage: string,
  context?: ChatSessionContext,
  newImage?: ChatImageInput,
): Promise<ChatReply> {
  getApiKey();

  const models = FREE_MODELS.slice(0, MAX_MODEL_ATTEMPTS);
  let lastError: unknown;

  for (const model of models) {
    try {
      const reply = await sendMessageWithModel(model, history, newMessage, context, newImage);
      return { ...reply, model };
    } catch (error) {
      lastError = error;
    }
  }

  const detail =
    lastError instanceof Error ? lastError.message : 'Unknown AI error.';
  throw new AllModelsFailedError(detail);
}

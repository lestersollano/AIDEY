import { GoogleGenAI } from '@google/genai';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  text: string;
};

const MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT =
  'You are a helpful assistant for Aidey, an app that helps Filipinos with documents and government IDs. ' +
  'Reply in the same language the user writes in (Tagalog or English). Keep answers concise, clear, and friendly.';

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

export async function sendMessage(
  history: ChatMessage[],
  newMessage: string,
): Promise<string> {
  const chat = getClient().chats.create({
    model: MODEL,
    config: {
      systemInstruction: SYSTEM_PROMPT,
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

  return text;
}

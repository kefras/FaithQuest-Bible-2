import { GoogleGenAI } from '@google/genai';

export interface DailyManna {
  verse: string;
  reference: string;
  devotional: string;
  date: string;
}

/**
 * Generates a deterministic daily verse and devotional using Gemini AI.
 * The content is the same for all users on a given day (seeded by date).
 */
export const getDailyManna = async (): Promise<DailyManna> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Check local cache first (same for all users on the same day)
  const cacheKey = `daily-manna-${today}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as DailyManna;
    } catch {
      // Ignore parse errors and fetch fresh
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Today's date is ${today}. Generate a daily Bible verse and devotional for a Bible quiz application called "FaithQuest Bible". 

Requirements:
- Pick a single, specific, inspiring Bible verse appropriate for today's date (use the date as a deterministic seed)
- Include the exact verse text
- Include the Bible reference (e.g., "John 3:16", "Psalm 23:1")
- Write a 2-sentence devotional commentary that applies the verse to daily life

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "verse": "For God so loved the world that he gave his one and only Son...",
  "reference": "John 3:16",
  "devotional": "First sentence of devotional. Second sentence of devotional."
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  const text = response.text?.trim() ?? '';

  // Strip markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  const parsed = JSON.parse(jsonText) as { verse: string; reference: string; devotional: string };

  const result: DailyManna = {
    verse: parsed.verse,
    reference: parsed.reference,
    devotional: parsed.devotional,
    date: today,
  };

  // Cache for the session
  sessionStorage.setItem(cacheKey, JSON.stringify(result));

  return result;
};

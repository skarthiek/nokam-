import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PREFERRED_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const CANDIDATE_MODELS = [
  PREFERRED_MODEL,
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash'
];

// Helper to call Gemini API with model fallback
async function callGemini(prompt, isJson = true) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      if (isJson) {
        payload.generationConfig = { responseMimeType: 'application/json' };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const rawText = data.candidates[0].content.parts[0].text;
        return { text: rawText, modelUsed: model };
      }

      const errMsg = data.error?.message || `HTTP ${res.status}`;
      console.warn(`[Gemini API] Model ${model} returned error (${res.status}): ${errMsg}`);
      lastError = new Error(`Model ${model}: ${errMsg}`);
    } catch (err) {
      console.warn(`[Gemini API] Request failed for model ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

// Clean and parse JSON response from Gemini
function parseJsonSafe(rawText) {
  try {
    // Strip markdown code fences if present
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[JSON Parse Error]', err.message, 'Raw text was:', rawText);
    throw new Error('Failed to parse AI response as JSON');
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    configuredModel: PREFERRED_MODEL,
    hasApiKey: Boolean(GEMINI_API_KEY)
  });
});

// Generate dynamic contextual keywords based on message and intent
app.post('/api/keywords', async (req, res) => {
  try {
    const { message, intent } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intentContext = intent ? `The intended negotiation strategy is: "${intent}".` : '';

    const prompt = `You are an expert executive communication and negotiation strategist.
Analyze the following incoming message from a client, partner, or customer:
"${message}"

${intentContext}

Generate a diverse list of 10 to 12 concise, punchy negotiation topics, levers, and contextual response keywords (each strictly 1 to 3 words) that a professional could use to craft a strategic response.
Examples: "Flexible Terms", "Adjust Scope", "Long-term Partnership", "Budget Alignment", "Phased Delivery", "Value Proposition", "Milestone Review".

Return ONLY a valid JSON object in this exact schema:
{
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7", "keyword 8", "keyword 9", "keyword 10"]
}`;

    const { text, modelUsed } = await callGemini(prompt, true);
    const parsed = parseJsonSafe(text);

    if (!Array.isArray(parsed.keywords) || parsed.keywords.length === 0) {
      throw new Error('Invalid keywords structure from model');
    }

    res.json({
      keywords: parsed.keywords,
      modelUsed
    });
  } catch (err) {
    console.error('Error generating keywords:', err);
    // Context-sensitive fallback so app never breaks
    const fallbackKeywords = [
      'Understand', 'Better Terms', 'Partnership', 'Future Scope',
      'Discuss', 'Flexible', 'Budget Fit', 'Value Add', 'Timeline', 'Quality'
    ];
    res.status(200).json({
      keywords: fallbackKeywords,
      warning: err.message,
      isFallback: true
    });
  }
});

// Generate dynamic AI drafts based on message, intent, and selected keywords
app.post('/api/drafts', async (req, res) => {
  try {
    const { message, intent, keywords } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intentMap = {
      'continue': 'Continue: Direct, collaborative, and moving the conversation forward toward agreement.',
      'soft-continue': 'Soft Continue: Diplomatic, empathetic, relationship-building, and exploring mutual fit gently.',
      'counter': 'Counter: Confident, value-anchored counter-proposal proposing alternative terms, pricing, or scope.',
      'end-close': 'End / Close: Professional, polite, clear closure while maintaining high goodwill for the future.'
    };

    const intentDescription = intentMap[intent] || intent || 'Professional negotiation response';
    const keywordList = Array.isArray(keywords) && keywords.length > 0 ? keywords.join(', ') : 'Mutual alignment, Next steps';

    const prompt = `You are an elite executive communications coach and negotiator.
An incoming message was received:
"${message}"

Strategic Intent: ${intentDescription}
Key concepts and levers to naturally weave in: ${keywordList}

Generate exactly 3 distinct, ready-to-send, professional draft responses.
- Draft 1: Diplomatic, empathetic, and bridge-building.
- Draft 2: Value-focused, strategic, and forward-looking.
- Draft 3: Crisp, concise, and action-oriented.

Guidelines:
- Maintain natural, human, confident tone (do not sound like an AI assistant).
- Weave the key concepts in seamlessly without forcing exact keyword repetition if unnatural.
- Length: 2 to 4 sentences per draft.

Return ONLY a valid JSON object in this exact schema:
{
  "drafts": [
    "First complete draft text...",
    "Second complete draft text...",
    "Third complete draft text..."
  ]
}`;

    const { text, modelUsed } = await callGemini(prompt, true);
    const parsed = parseJsonSafe(text);

    if (!Array.isArray(parsed.drafts) || parsed.drafts.length === 0) {
      throw new Error('Invalid drafts structure from model');
    }

    res.json({
      drafts: parsed.drafts,
      modelUsed
    });
  } catch (err) {
    console.error('Error generating drafts:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate drafts'
    });
  }
});

// Optional message intent analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `Analyze this incoming business message:
"${message}"

Identify:
1. The underlying sentiment / challenge (1 sentence).
2. Recommended intent out of these 4: "continue", "soft-continue", "counter", "end-close".
3. 10 relevant response keywords (1-3 words each).

Return ONLY valid JSON:
{
  "analysis": "Brief 1-sentence analysis",
  "recommendedIntent": "continue | soft-continue | counter | end-close",
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6", "kw7", "kw8", "kw9", "kw10"]
}`;

    const { text, modelUsed } = await callGemini(prompt, true);
    const parsed = parseJsonSafe(text);
    res.json({ ...parsed, modelUsed });
  } catch (err) {
    console.error('Error analyzing message:', err);
    res.status(200).json({
      analysis: 'Pricing objection and budget boundary',
      recommendedIntent: 'soft-continue',
      keywords: ['Understand', 'Flexible Terms', 'Scope Adjustment', 'Budget Fit', 'Partnership'],
      warning: err.message
    });
  }
});

// Serve static frontend from Vite production build
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all client-side routes
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`[Backend Server] Nokam AI API running on http://localhost:${port}`);
  console.log(`[Backend Server] Preferred Gemini model: ${PREFERRED_MODEL}`);
});

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const uint8 = new Uint8Array(audioBuffer);
  const file = new File([uint8], filename, {
    type: filename.endsWith('.m4a') ? 'audio/mp4' : 'audio/webm',
  });

  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'en',
  });

  return transcription.text;
}

function buildSystemPrompt(): string {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return `You are the AI backend for a property maintenance logging app at an apartment complex called Metro Fremont. The complex has 106 units: Floor 1 (units 101-153) and Floor 2 (units 201-253).

Today's date is ${today}.

The user will either:
A) LOG a new work order by describing what was done
B) ASK a question about past work orders
C) Give a BATCH of multiple entries to log at once

Determine the intent and respond with JSON only. No markdown, no backticks, no explanation.

For LOG intent, extract structured data:
{
  "intent": "log",
  "entries": [{
    "scope": "unit" | "building" | "complex",
    "unit_number": "242" | null,
    "description": "replaced garbage disposal",
    "cost": 180 | null,
    "vendor": "Mike's Plumbing" | null,
    "status": "completed" | "open" | "scheduled",
    "work_date": "${today}",
    "tags": ["appliance", "replacement", "kitchen"]
  }]
}

For ASK intent, determine the query type and generate filters:
{
  "intent": "ask",
  "query_type": "list" | "aggregate" | "rank",
  "natural_response": "Here are the 8 work orders for unit 242:",
  "filters": {
    "unit_number": "242",
    "date_from": "2026-01-01",
    "date_to": "2026-12-31",
    "tags": ["plumbing"],
    "scope": "unit",
    "status": "open",
    "vendor": "Adam",
    "cost_is_null": false,
    "floor": 2,
    "description_search": "move"
  },
  "aggregate": "sum" | "count" | "avg" | null,
  "aggregate_field": "cost" | null,
  "rank_by": "count" | "cost_sum" | null,
  "rank_group": "unit_number" | "vendor" | "tags" | null,
  "limit": 5
}

For EDIT intent (when editing an existing entry):
{
  "intent": "edit",
  "changes": {
    "cost": 200
  }
}

Notes:
- If she says "bucks" or "dollars" that's cost
- "Fixed", "replaced", "installed", "cleaned", "painted" = completed status
- "Needs", "broken", "leaking", "reported" = open status
- If no date mentioned, assume today: ${today}
- For relative dates like "6 days ago", "last week", "yesterday", compute the exact date from today (${today})
- For queries with relative dates, use a date range (date_from and date_to set to the same day) for exact day matches
- Auto-generate relevant tags from the description
- Unit numbers are 3 digits (floor + unit): 101-153, 201-253
- She might say "two forty two" meaning unit 242
- IMPORTANT: Always preserve the unit number the user spoke, even if it seems invalid. Set unit_number to exactly what they said (e.g. "405", "906"). Never set unit_number to null if a unit was mentioned — the user will correct it if needed
- For batch entries, parse each one separately into the entries array
- Clean up casual speech into clear descriptions (e.g. "fixed the toilet in 242" -> "Fixed toilet")
- If a person's name is mentioned in context as doing the work (e.g. "Adam came and told me he cleaned the carpets", "Mike fixed the sink"), set that person as the vendor for all relevant entries. A vendor can be a company name OR an individual's name.
- For ASK queries: use "vendor" filter when the user asks about work done by a specific person/company (e.g. "what work did Adam do?" → vendor: "Adam")
- For ASK queries: use "cost_is_null": true when the user asks about work orders with no cost recorded
- For ASK queries: use "floor" filter (1 or 2) when the user asks about an entire floor (e.g. "floor 2", "second floor"). Floor 1 = units 101-153, Floor 2 = units 201-253. Do NOT use unit_number for floor queries.
- For ASK queries: use "description_search" to search within work order descriptions when the user asks about a specific type of work (e.g. "move in", "carpet cleaning", "faucet"). This is a partial text match (case-insensitive). Use this INSTEAD of tags for topic-based queries since tags may not match exactly. Only use tags for broad category filters.`;
}

export async function parseTranscript(transcript: string): Promise<unknown> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: transcript }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the JSON response — strip any accidental markdown
  const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

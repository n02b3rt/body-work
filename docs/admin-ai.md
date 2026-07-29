# Admin AI (Gemini)

Assistive AI inside the Payload admin on the dashboard host only. Never runs on public sites.

## What it does

- Media ALT / caption suggestions (vision)
- SEO title, meta description, and post excerpt
- English draft for a Polish post
- Blog post draft from a short brief
- Page-builder section suggestions
- Floating help chat (advice only; no mutations)

Pattern: **Propose → preview → Insert / Discard**. Nothing is written silently.

## Stack

| Piece | Detail |
|---|---|
| Provider | Google AI Studio / Gemini API |
| Key | `GEMINI_API_KEY` in `.env` (see `.env.example`) |
| Primary model | `gemini-3.5-flash` |
| Fallback on 429 | `gemma-4-26b-a4b-it` |
| Client | [`src/lib/ai/gemini.ts`](../src/lib/ai/gemini.ts) — plain `fetch`, no npm SDK |
| Tasks | [`src/lib/ai/tasks.ts`](../src/lib/ai/tasks.ts) |
| API | `POST /api/admin/ai` with `{ task, ... }` |
| Auth | Payload session; staff roles |

Without the key, endpoints return **503** and the UI shows that AI is unavailable.

## Privacy

Free-tier Gemini may use prompts to improve Google's products. Do not send passwords, API keys, or customer PII. Editorial copy is a conscious trade-off of the free tier; a paid Gemini tier later can stop training on prompts.

> Read when: touching the Gemini-backed helpers in the dashboard, or adding a new AI-assisted field.

# Admin AI

Assistive AI inside the Payload admin, on the dashboard host **only**. It never runs on a public
site and never writes without a human accepting the suggestion.

## What it does

ALT text for uploads, SEO title and description, an English draft of a post, a post draft, and a
help chat.

## Files

| Role | Path |
|---|---|
| Provider client | `src/lib/ai/client.ts`, `gemini.ts` |
| Prompts | `src/lib/ai/prompts.ts` |
| Task definitions | `src/lib/ai/tasks.ts` |
| Auth guard | `src/lib/ai/auth.ts` |
| API routes | `src/app/api/admin/ai/` |
| UI | `src/components/admin/ai/` (`AiHelpProvider`, `AiSuggestButton`, `MediaAiPanel`, `SeoAiPanel`, `PostDraftAiPanel`) |
| English drafting panel | `src/components/admin/EnglishVersionPanel.tsx` |
| Smoke test | `scripts/smoke-gemini.ts` |

## Gotchas

- **Needs `GEMINI_API_KEY`.** Without it the panels should degrade, not crash.
- **Dashboard host only.** The auth guard is not decoration; do not call these routes from public code.
- **Suggestions are suggestions.** Nothing here writes to a document without an editor accepting it,
  and it should stay that way.

## Related

[`../admin-ai.md`](../admin-ai.md) · [`i18n.md`](./i18n.md) (English versions) · [`seo.md`](./seo.md)

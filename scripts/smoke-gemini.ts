/**
 * Smoke-test Gemini connectivity.
 * Run: pnpm payload run scripts/smoke-gemini.ts
 *
 * Uses `@/` imports: `payload run` rewrites those; relative imports outside its
 * root can exit 0 with no useful output (same gotcha as smoke-page-builder).
 */
import { generateGemini, isGeminiConfigured } from '@/lib/ai/gemini'

console.log('configured:', isGeminiConfigured())
if (!isGeminiConfigured()) {
  console.error('GEMINI_API_KEY missing')
  process.exit(1)
}

const result = await generateGemini({
  parts: [{ text: 'Reply with exactly: BODYWORK_OK' }],
  temperature: 0,
})
console.log(JSON.stringify(result, null, 2))
process.exit(result.ok ? 0 : 1)

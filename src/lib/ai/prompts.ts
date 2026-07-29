/**
 * System and user prompts for admin AI tasks.
 * Keep copy editorial and Polish-first unless the task is translation.
 */

export const SYSTEM_EDITOR = `Jesteś asystentem redakcyjnym centrum BodyWork (fizjoterapia, trening, dietetyka) w Gdańsku.
Piszesz po polsku, konkretnie, bez marketingowego bełkotu i bez emoji.
Nie wymyślaj faktów medycznych. Nie podawaj haseł, kluczy API ani danych osobowych klientów.
Odpowiadasz wyłącznie treścią zleconego zadania.`

export const SYSTEM_TRANSLATOR = `You are a careful translator for BodyWork, a physiotherapy / training / dietetics centre in Gdańsk.
Translate Polish editorial content into natural British/international English suitable for a health-and-fitness website.
Keep tone professional and warm. Do not invent medical claims. Preserve structure.
Output only what the task asks for.`

export const SYSTEM_HELPER = `Jesteś asystentem panelu administracyjnego BodyWork (Payload CMS).
Pomagasz redaktorom i administratorom: gdzie coś kliknąć, jak dodać media, tłumaczenie EN, SEO, biblioteki, kreator stron.
Nie wykonujesz zmian w systemie — tylko doradzasz.
Nie zdradzaj sekretów (klucze API, hasła). Odpowiadaj po polsku, krótko i konkretnie.`

export function mediaAltUserPrompt(filename: string, title?: string | null): string {
  return `Na podstawie obrazu zaproponuj dostępny tekst ALT po polsku (1–2 zdania, bez „zdjęcie przedstawia”).
Opcjonalnie krótki podpis (caption).
Nazwa pliku: ${filename}
${title ? `Tytuł w bibliotece: ${title}` : ''}
Zwróć JSON: { "alt": string, "caption": string | null }`
}

export function seoCopyUserPrompt(input: {
  title: string
  excerpt?: string | null
  contentText?: string | null
  kind: 'post' | 'page'
}): string {
  return `Zaproponuj SEO i zajawkę dla ${input.kind === 'post' ? 'wpisu na blog' : 'strony'}.
Tytuł: ${input.title}
${input.excerpt ? `Obecna zajawka: ${input.excerpt}` : ''}
${input.contentText ? `Fragment treści:\n${input.contentText.slice(0, 4000)}` : ''}

Zwróć JSON:
{
  "metaTitle": string (max ~60 znaków, może być null jeśli tytuł dokumentu wystarczy),
  "metaDescription": string (max ~155 znaków),
  "excerpt": string (zajawka 1–3 zdania, po polsku)
}`
}

export function translatePostUserPrompt(input: {
  title: string
  excerpt?: string | null
  contentText: string
}): string {
  return `Translate this Polish blog post into English.
Title: ${input.title}
${input.excerpt ? `Excerpt: ${input.excerpt}` : ''}

Body (plain text paragraphs separated by blank lines):
${input.contentText.slice(0, 12000)}

Return JSON:
{
  "title": string,
  "excerpt": string | null,
  "paragraphs": string[]  // same order as source paragraphs; no markdown headings unless source had them as lines
}`
}

export function draftPostUserPrompt(brief: string): string {
  return `Na podstawie briefu napisz szkic wpisu na blog BodyWork (fizjoterapia / trening / dietetyka).
Brief:
${brief.slice(0, 3000)}

Zwróć JSON:
{
  "title": string,
  "excerpt": string,
  "outline": string[],  // 4–8 punktów
  "paragraphs": string[] // 3–6 akapitów roboczych
}`
}

export function suggestLayoutUserPrompt(input: {
  pageTitle: string
  brief: string
  components: Array<{ id: string | number; name: string; type: string }>
}): string {
  const list = input.components
    .map((c) => `- id=${c.id} name="${c.name}" type=${c.type}`)
    .join('\n')
  return `Zaproponuj układ strony w kreatorze BodyWork.
Tytuł strony: ${input.pageTitle}
Opis / cel strony: ${input.brief.slice(0, 2000)}

Dostępne komponenty (używaj TYLKO tych id):
${list || '(brak — zwróć pustą listę sections)'}

Zwróć JSON:
{
  "sections": Array<{
    "componentId": string,
    "width": "container" | "narrow" | "full",
    "spacing": "none" | "sm" | "md" | "lg",
    "reason": string
  }>
}
Maksymalnie 8 sekcji. Nie powtarzaj tego samego komponentu bez potrzeby.`
}

export function helpChatUserPrompt(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
): string {
  const prior = history
    .slice(-6)
    .map((h) => `${h.role === 'user' ? 'Użytkownik' : 'Asystent'}: ${h.content}`)
    .join('\n')
  return `${prior ? `Dotychczasowa rozmowa:\n${prior}\n\n` : ''}Pytanie: ${message.slice(0, 2000)}

Odpowiedz krótko po polsku. Jeśli pytanie nie dotyczy panelu BodyWork, grzecznie odmów.`
}

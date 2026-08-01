> Read when: you need anything from the requirements. Find the row, open **only** that file.

# PRD: index

BODYWORK specification (v1.0, 24.07.2026; client: ul. Kajki 14, Poznań; delivery: Dominik, Norbert).
Replaces `body-work.com.pl` (WordPress + WooCommerce + qTranslate-X).

**This is a spec, not a briefing.** Nobody reads it end to end: open the one file you need.
Not sure which? Grep `docs/prd/`; don't read them in order.

| File | Read when |
|---|---|
| [`01-cele-uzytkownicy.md`](./01-cele-uzytkownicy.md) | building a feature and you need to know **who it's for**: business goals, personas, roles |
| [`02-zakres-mvp.md`](./02-zakres-mvp.md) | checking whether something is in MVP scope; looking for a user story |
| [`03-stan-obecny.md`](./03-stan-obecny.md) | "how did the old WordPress do this", or migrating data |
| [`04-architektura.md`](./04-architektura.md) | designing something cross-cutting: hosts, routing, layers |
| [`05-funkcjonalnosci.md`](./05-funkcjonalnosci.md) | building one feature and you want its full behavioural spec |
| [`06-dane-api.md`](./06-dane-api.md) | adding a collection, a field or an endpoint |
| [`07-bezpieczenstwo.md`](./07-bezpieczenstwo.md) | touching auth, permissions, GDPR, env vars (Payload, Redis, S3, Przelewy24, mail) |
| [`08-fazy.md`](./08-fazy.md) | "what's next", "is this in scope yet": delivery order and post-MVP scope |
| [`09-ryzyka-kryteria.md`](./09-ryzyka-kryteria.md) | closing out a phase: acceptance criteria, checklists, risks |
| [`10-zalaczniki.md`](./10-zalaczniki.md) | dependency doc links, client-supplied materials, open questions |

## Older docs cite "PRD §N"

`PRD.md` was one file until this split. Section numbers survive inside these files; this is where each one landed.

| PRD § | File |
|---|---|
| §1 Executive Summary, §2 Misja, §3 Użytkownicy | `01-cele-uzytkownicy.md` |
| §4 Zakres MVP, §5 User Stories | `02-zakres-mvp.md` |
| §6 Analiza stanu obecnego | `03-stan-obecny.md` |
| §7 Architektura | `04-architektura.md` |
| §8 Funkcjonalności | `05-funkcjonalnosci.md` |
| §9 Stos technologiczny | superseded by [`../stack.md`](../stack.md); original in `../archive/prd-stos-technologiczny.md` |
| §10 Model danych, §11 Specyfikacja API | `06-dane-api.md` |
| §12 Bezpieczeństwo, zgodność, konfiguracja | `07-bezpieczenstwo.md` |
| §13 Fazy wdrożenia, §14 Rozwój po MVP | `08-fazy.md` |
| §15 Ryzyka, §16 Kryteria sukcesu | `09-ryzyka-kryteria.md` |
| §17 Załączniki | `10-zalaczniki.md` |

## What isn't here

- **Technology stack:** PRD §9 was the spec written *before* the build. As-built, plus the
  "ask before installing" rule: [`../stack.md`](../stack.md). The original sits in
  [`../archive/prd-stos-technologiczny.md`](../archive/prd-stos-technologiczny.md), kept only for the reasoning.
- **What is actually built:** the PRD says what should exist. What does: [`../map.md`](../map.md)
  (including its "Not built yet" section) and [`../migration-tracker.md`](../migration-tracker.md).

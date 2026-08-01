> Read when: touching auth, permissions, GDPR or env vars (Payload, Redis, S3, Przelewy24, mail).

## 12. Bezpieczeństwo, zgodność i konfiguracja

### Uwierzytelnianie i role

| Rola                | Uprawnienia                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Admin**           | Wszystko: użytkownicy, ustawienia, przekierowania, zamówienia, treści                                  |
| **Redaktor**        | Strony, wpisy, aktualności, media, cennik, zespół, galerie, opinie — bez zamówień, klientów i ustawień |
| **Obsługa szkoleń** | Kursy, edycje, zamówienia, kody rabatowe, listy uczestników — bez treści marketingowych i ustawień     |
| **Customer**        | Wyłącznie własne zamówienia i dane (osobna kolekcja, brak dostępu do panelu)                           |

Wymuszone: silne hasła, 2FA dla roli Admin, blokada po nieudanych próbach, sesje wygasające, `/admin` dostępny tylko z hosta `dash.` (opcjonalnie dodatkowo za Cloudflare Access — darmowe do 50 użytkowników).

### Zabezpieczenia aplikacyjne

- Walidacja wszystkich wejść przez Zod; sanityzacja RichText przy renderowaniu
- CSRF (wbudowane w Payload/Next Server Actions)
- Nagłówki: CSP (z nonce), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limiting na Redis dla wszystkich publicznych endpointów
- Uploady: whitelist typów MIME, limit rozmiaru, przetwarzanie przez `sharp` (strip EXIF)
- Sekrety wyłącznie w zmiennych środowiskowych; brak sekretów w repo
- Automatyczne aktualizacje zależności (Renovate) + `pnpm audit` w CI

### Zgodność

- **RODO:** rejestr zgód, retencja danych zamówień (ustawowo 5 lat dla dokumentacji księgowej), procedura usunięcia danych osobowych z anonimizacją zamówień, umowa powierzenia z hostingodawcą (Hetzner — DPA dostępne), fonty i skrypty self-hosted, brak transferu poza EOG w warstwie serwerowej
- **Prawo konsumenckie:** regulamin sklepu jako strona HTML z wersjonowaniem, informacja o prawie odstąpienia i jego wyłączeniach dla usług w określonym terminie, potwierdzenie zamówienia z pełnym podsumowaniem
- **Dostępność:** WCAG 2.1 AA (§8.13)
- **Dofinansowanie UE:** obecna strona zawiera sekcję „Unia Europejska — współpraca" — jeśli wynika z niej obowiązek informacyjny w okresie trwałości projektu, treść musi zostać przeniesiona wraz z zachowaniem starego URL-a przez 301. **Do potwierdzenia z klientem.**

### Zmienne środowiskowe

```env
# Aplikacja
NODE_ENV=production
NEXT_PUBLIC_HUB_URL=https://body-work.pl
NEXT_PUBLIC_CENTRUM_URL=https://centrum.body-work.pl
NEXT_PUBLIC_AKADEMIA_URL=https://akademia.body-work.pl
NEXT_PUBLIC_DASH_URL=https://dash.body-work.pl

# Payload
PAYLOAD_SECRET=
DATABASE_URI=postgres://...
PREVIEW_SECRET=
REVALIDATE_SECRET=

# Redis
REDIS_URL=redis://...

# Media (S3-compatible)
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Przelewy24
P24_MERCHANT_ID=
P24_POS_ID=
P24_API_KEY=
P24_CRC=
P24_SANDBOX=false

# Poczta
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM="BODYWORK <noreply@body-work.pl>"
MAIL_ORDERS_TO=szkolenia@body-work.pl
MAIL_CONTACT_TO=info@body-work.pl

# Newsletter
LISTMONK_URL=
LISTMONK_USER=
LISTMONK_TOKEN=
LISTMONK_LIST_ID=

# Analityka
NEXT_PUBLIC_UMAMI_URL=
NEXT_PUBLIC_UMAMI_ID=
NEXT_PUBLIC_GTM_ID=GTM-P4TPSQ5
NEXT_PUBLIC_META_PIXEL_ID=605366126473059

# Monitoring
GLITCHTIP_DSN=
```

---


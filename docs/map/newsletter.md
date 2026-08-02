> Read when: touching the newsletter flow, the subscriber list, or any outgoing email including password resets.

# Newsletter and email

Double opt-in newsletter. **The list lives in our own Postgres; Resend only delivers.** That is a
cardinal decision: no SaaS holds the subscriber data.

## Newsletter

| Piece | Path |
|---|---|
| Subscribe endpoint | `src/app/api/newsletter/` |
| Confirm | `src/app/api/newsletter/confirm/` |
| Unsubscribe | `src/app/api/newsletter/unsubscribe/` |
| Collection | `src/collections/Subscribers.ts` |
| Pages | `src/app/[locale]/newsletter/` |
| Signup form | `src/components/centrum/NewsletterSignup.tsx` |
| Confirmation screen | shares `centrum/NoticeLayout.tsx` |
| Smoke test | `scripts/smoke-newsletter.ts` |

**Unsubscribe is GET-asks / POST-does on purpose**: a link prefetcher must not be able to unsubscribe
someone by following a URL.

## Email

- `src/lib/email.ts`: one `fetch` against Resend. No SDK, no new dependency.
- `src/lib/payload-email.ts`: a hand-rolled Payload email adapter. **Without it, password reset mail
  never arrives.**

## Gotchas

- **With no `RESEND_API_KEY`, mail is logged, not sent.** Useful in dev, silent in production if the
  variable is missing.
- **The success message deliberately differs from the reference.** "Zostałeś pomyślnie dodany" is
  untrue at that moment under double opt-in; ours says to check the inbox for the confirming link.

## Related

[`../prd/07-bezpieczenstwo.md`](../prd/07-bezpieczenstwo.md) · [`../stack.md`](../stack.md) (why Resend, and why the list is ours)

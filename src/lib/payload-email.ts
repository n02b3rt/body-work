import { defaultSender, sendEmail } from "./email";

/**
 * Payload's email adapter, pointed at the same Resend path the newsletter uses.
 *
 * **Without this, Payload writes emails to the console** (it says so at boot: "No email
 * adapter provided"). That is not cosmetic: password resets and email verification silently
 * go nowhere. Nothing in the panel reports it: the mail simply never arrives, and the
 * account is stuck.
 *
 * (This does not affect the 62 posts' bylines. `Authors` is deliberately not an auth
 * collection, see its own doc comment, so the 24 authors are credits, not logins.)
 *
 * Hand-rolled rather than `@payloadcms/email-resend` on purpose: the official adapter would
 * be a second dependency doing what `src/lib/email.ts` already does, and this way the
 * newsletter and the panel share one relay, one API key, and one place to swap providers.
 * The trade-off is that we own the `to`/`html` normalisation below: Payload's message shape
 * comes from nodemailer, which allows more forms than Resend's JSON API accepts.
 */

type PayloadMessage = {
  to?: unknown;
  subject?: unknown;
  html?: unknown;
  text?: unknown;
  from?: unknown;
};

/** nodemailer allows a string, a `{ name, address }` object, or an array of either. */
function normaliseAddress(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(normaliseAddress).filter(Boolean).join(", ");
  if (value && typeof value === "object" && "address" in value) {
    return String((value as { address: unknown }).address);
  }
  return "";
}

/** Payload sends strings, but the nodemailer type also permits a Buffer or a stream. */
function normaliseBody(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Buffer) return value.toString("utf8");
  return "";
}

export function resendEmailAdapter() {
  const sender = defaultSender();

  return () => ({
    name: "resend-fetch",
    defaultFromAddress: sender.address,
    defaultFromName: sender.name,
    sendEmail: async (message: PayloadMessage) => {
      const to = normaliseAddress(message.to);
      if (!to) {
        console.error("[BodyWork] Payload asked to send mail with no recipient: skipped.");
        return { ok: false };
      }

      const html = normaliseBody(message.html);
      const text = normaliseBody(message.text);

      const result = await sendEmail({
        to,
        subject: typeof message.subject === "string" ? message.subject : "",
        // Payload's auth emails carry HTML; keep a plain-text part either way, since a
        // password reset that trips a spam filter is worse than a plain one.
        html: html || `<p>${text}</p>`,
        text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        from: typeof message.from === "string" ? message.from : undefined,
      });

      if (!result.ok) {
        // Payload swallows a thrown error here into a generic failure, so log the reason
        // before rethrowing: otherwise "reset didn't arrive" has no trail at all.
        console.error("[BodyWork] Payload email failed:", result.error);
        throw new Error(result.error);
      }

      return result;
    },
  });
}

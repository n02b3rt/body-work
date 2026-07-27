/**
 * The one place that talks to Resend.
 *
 * Deliberately plain `fetch` against the REST API rather than the `resend` SDK — the whole
 * surface we need is one POST, and keeping it dependency-free means swapping the relay
 * later (Listmonk on top of SES, a plain SMTP host) is a change to this file only. See
 * `docs/stack.md` for why the relay is the one piece the PRD lets us not self-host.
 *
 * **Without `RESEND_API_KEY` set, mail is logged to the console instead of sent.** That is
 * intentional: the whole double opt-in flow stays testable in dev before anyone has an
 * account, and a missing key in production degrades to a visible log rather than a 500 in
 * the visitor's face.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Fallback matches Resend's own sandbox sender, which works before domain verification. */
const DEFAULT_FROM = "BODYWORK <onboarding@resend.dev>";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Overrides `EMAIL_FROM`; Payload passes its own sender through the adapter. */
  from?: string;
};

export type SendResult = { ok: true; skipped: boolean } | { ok: false; error: string };

/** `EMAIL_FROM` is in the usual `Name <address@host>` form; the adapter needs the parts. */
export function defaultSender() {
  const raw = process.env.EMAIL_FROM || DEFAULT_FROM;
  const match = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return {
    name: match?.[1] || "BODYWORK",
    address: match?.[2] || raw.trim(),
  };
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from: fromOverride,
}: SendEmailArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = fromOverride || process.env.EMAIL_FROM || DEFAULT_FROM;

  if (!apiKey) {
    console.warn(
      `[BodyWork] RESEND_API_KEY not set — email NOT sent.\n  to: ${to}\n  subject: ${subject}\n${text}`,
    );
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });

    if (!response.ok) {
      // Resend answers with a JSON body explaining the refusal (unverified domain, bad
      // key, invalid recipient). Surfacing it beats a bare status code.
      const detail = await response.text().catch(() => "");
      return { ok: false, error: `Resend ${response.status}: ${detail.slice(0, 500)}` };
    }

    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const COPY = {
  pl: {
    subject: "Potwierdź zapis do newslettera BODYWORK",
    preheader: "Jeszcze jedno kliknięcie i jesteś na liście.",
    heading: "Potwierdź zapis.",
    body: "Dostaliśmy zgłoszenie zapisu tego adresu do newslettera BODYWORK. Kliknij przycisk poniżej, żeby to potwierdzić — bez tego nie wyślemy Ci nic więcej.",
    cta: "Potwierdzam zapis",
    ignore:
      "Jeśli to nie Ty, po prostu zignoruj tę wiadomość — bez potwierdzenia adres nie trafi na listę.",
    fallback: "Jeśli przycisk nie działa, wklej ten adres w przeglądarkę:",
  },
  en: {
    subject: "Confirm your BODYWORK newsletter signup",
    preheader: "One more click and you're on the list.",
    heading: "Confirm your signup.",
    body: "We received a request to add this address to the BODYWORK newsletter. Click the button below to confirm — without it we won't send you anything else.",
    cta: "Confirm signup",
    ignore:
      "If this wasn't you, just ignore this message — the address won't be added without confirmation.",
    fallback: "If the button doesn't work, paste this address into your browser:",
  },
} as const;

export type EmailLocale = keyof typeof COPY;

/** Escapes text interpolated into the HTML body — the URL is ours, the copy is not user input, but this is cheap. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The double opt-in email. Table-based and inline-styled on purpose: email clients are not
 * browsers, and Outlook in particular ignores most of what the site's CSS relies on.
 */
export function confirmationEmail(locale: EmailLocale, confirmUrl: string) {
  const t = COPY[locale];
  const url = escapeHtml(confirmUrl);

  const html = `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:#f4f4f2;font-family:Helvetica,Arial,sans-serif;color:#1c2b46;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${t.preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:40px;">
            <tr>
              <td style="font-size:13px;letter-spacing:2px;text-transform:uppercase;padding-bottom:28px;">BODYWORK</td>
            </tr>
            <tr>
              <td style="font-size:26px;line-height:1.25;padding-bottom:20px;">${t.heading}</td>
            </tr>
            <tr>
              <td style="font-size:16px;line-height:1.7;padding-bottom:32px;">${t.body}</td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${url}" style="display:inline-block;background:#1c2b46;color:#ffffff;text-decoration:none;padding:16px 28px;border-radius:999px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">${t.cta}</a>
              </td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.6;color:#5b6577;padding-bottom:16px;">${t.fallback}<br><a href="${url}" style="color:#1c2b46;word-break:break-all;">${url}</a></td>
            </tr>
            <tr>
              <td style="font-size:13px;line-height:1.6;color:#5b6577;">${t.ignore}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${t.heading}\n\n${t.body}\n\n${confirmUrl}\n\n${t.ignore}`;

  return { subject: t.subject, html, text };
}

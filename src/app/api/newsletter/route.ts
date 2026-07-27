import { randomBytes } from "node:crypto";
import { getPayload } from "payload";
import config from "@payload-config";
import { confirmationEmail, sendEmail, type EmailLocale } from "@/lib/email";

/**
 * Newsletter signup: step one of a double opt-in.
 *
 * Nothing is ever mailed to a `confirmed` address from here and nothing is sent without a
 * token, so the worst a bot can do is make us send one confirmation to an address that
 * asked for it. Under RODO the confirmation click (with its timestamp and IP, recorded in
 * `subscribers`) is what makes the consent provable, which is why single opt-in was never
 * an option.
 *
 * **Every outcome answers the same way.** Whether the address is new, already on the list,
 * or was previously unsubscribed, the response is an identical `{ ok: true }`: otherwise
 * this endpoint becomes a way to ask "is this person a BODYWORK customer?".
 *
 * Note this lives at `/api/newsletter`, which `src/proxy.ts` passes through without
 * next-intl. The locale therefore arrives in the body rather than the path.
 */

/** Coarse per-IP limit. In-memory, so it resets on deploy and is per-instance: enough to
 *  blunt a script, not a substitute for a WAF rule once Cloudflare is in front of this. */
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, max: 5 };
const attempts = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((at) => now - at < RATE_LIMIT.windowMs);

  if (recent.length >= RATE_LIMIT.max) {
    attempts.set(ip, recent);
    return true;
  }

  recent.push(now);
  attempts.set(ip, recent);

  // The map would otherwise grow for the life of the process.
  if (attempts.size > 5000) {
    for (const [key, times] of attempts) {
      if (times.every((at) => now - at >= RATE_LIMIT.windowMs)) attempts.delete(key);
    }
  }

  return false;
}

function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

/** Good enough to reject typos and obvious junk; the confirmation click is the real test. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@,]+\.[a-z]{2,}$/i;

const ok = () => Response.json({ ok: true });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid-body" }, { status: 400 });
  }

  const { email, locale, source, company } = (body ?? {}) as Record<string, unknown>;

  // Honeypot: a hidden field no human fills in. Answer as if it worked, so the bot has
  // nothing to learn from the difference.
  if (typeof company === "string" && company.trim() !== "") return ok();

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return Response.json({ ok: false, error: "invalid-email" }, { status: 400 });
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  const normalisedEmail = email.trim().toLowerCase();
  const emailLocale: EmailLocale = locale === "en" ? "en" : "pl";

  try {
    const payload = await getPayload({ config });

    // `overrideAccess` is required: the collection closes `create` to everything else on
    // purpose, so that Payload's REST endpoint can't be used to stuff the list directly.
    const existing = await payload.find({
      collection: "subscribers",
      where: { email: { equals: normalisedEmail } },
      limit: 1,
      overrideAccess: true,
    });

    const current = existing.docs[0];

    // Already on the list: say nothing and send nothing. Re-mailing a confirmed address
    // on every form submission is how a signup form turns into a nuisance.
    if (current?.status === "confirmed") return ok();

    const token = current?.status === "pending" ? current.token : randomBytes(32).toString("hex");

    if (current) {
      // Covers both a pending signup being retried and someone who unsubscribed coming
      // back: either way they are pending again and must click a fresh link.
      await payload.update({
        collection: "subscribers",
        id: current.id,
        data: {
          status: "pending",
          locale: emailLocale,
          token,
          source: typeof source === "string" ? source.slice(0, 200) : current.source,
          consentIp: ip,
          unsubscribedAt: null,
        },
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: "subscribers",
        data: {
          email: normalisedEmail,
          status: "pending",
          locale: emailLocale,
          token,
          source: typeof source === "string" ? source.slice(0, 200) : undefined,
          consentIp: ip,
        },
        overrideAccess: true,
      });
    }

    const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const confirmUrl = `${base}/api/newsletter/confirm?token=${token}`;
    const { subject, html, text } = confirmationEmail(emailLocale, confirmUrl);

    const sent = await sendEmail({ to: normalisedEmail, subject, html, text });
    if (!sent.ok) {
      // The address is stored, so nothing is lost, but the visitor would sit waiting for a
      // mail that will never arrive, so this one case is worth admitting to.
      console.error("[BodyWork] newsletter confirmation failed to send:", sent.error);
      return Response.json({ ok: false, error: "send-failed" }, { status: 502 });
    }

    return ok();
  } catch (error) {
    console.error("[BodyWork] newsletter signup failed:", error);
    return Response.json({ ok: false, error: "server-error" }, { status: 500 });
  }
}

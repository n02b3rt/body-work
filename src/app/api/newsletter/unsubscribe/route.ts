import { getPayload } from "payload";
import config from "@payload-config";
import { localePath, SITE_URL } from "@/lib/metadata";

/**
 * Unsubscribe — **GET only asks, POST actually does it.**
 *
 * That split is not ceremony. Mail clients, corporate link scanners and spam filters
 * prefetch the URLs in an email, so a link that unsubscribes on GET quietly removes people
 * who never clicked anything. The link therefore lands on a page with a button, and the
 * button posts back here.
 *
 * (The one-click header standard, `List-Unsubscribe-Post`, is the exception that allows a
 * POST straight from the mail client. Worth adding to broadcasts when broadcasts exist —
 * it needs the header pair, not a different handler, so this route already fits it.)
 */
function statusRedirect(locale: string, status: string, token?: string, code = 302) {
  const url = new URL(`${SITE_URL}${localePath(locale, "/newsletter")}`);
  url.searchParams.set("status", status);
  if (token) url.searchParams.set("token", token);
  return Response.redirect(url, code);
}

async function findByToken(token: string) {
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: "subscribers",
    where: { token: { equals: token } },
    limit: 1,
    overrideAccess: true,
  });
  return { payload, subscriber: found.docs[0] };
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return statusRedirect("pl", "invalid");

  try {
    const { subscriber } = await findByToken(token);
    if (!subscriber) return statusRedirect("pl", "invalid");

    const locale = subscriber.locale === "en" ? "en" : "pl";

    if (subscriber.status === "unsubscribed") return statusRedirect(locale, "unsubscribed");

    // Nothing has changed yet — the page this lands on carries the button that does.
    return statusRedirect(locale, "confirm-unsubscribe", token);
  } catch (error) {
    console.error("[BodyWork] unsubscribe lookup failed:", error);
    return statusRedirect("pl", "error");
  }
}

export async function POST(request: Request) {
  // Sent as a plain form post from the status page, so it arrives form-encoded.
  const form = await request.formData().catch(() => null);
  const token = typeof form?.get("token") === "string" ? String(form.get("token")) : null;

  if (!token) return statusRedirect("pl", "invalid", undefined, 303);

  try {
    const { payload, subscriber } = await findByToken(token);
    if (!subscriber) return statusRedirect("pl", "invalid", undefined, 303);

    const locale = subscriber.locale === "en" ? "en" : "pl";

    if (subscriber.status !== "unsubscribed") {
      await payload.update({
        collection: "subscribers",
        id: subscriber.id,
        data: { status: "unsubscribed", unsubscribedAt: new Date().toISOString() },
        overrideAccess: true,
      });
    }

    return statusRedirect(locale, "unsubscribed", undefined, 303);
  } catch (error) {
    console.error("[BodyWork] unsubscribe failed:", error);
    return statusRedirect("pl", "error", undefined, 303);
  }
}

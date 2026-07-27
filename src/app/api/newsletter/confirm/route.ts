import { getPayload } from "payload";
import config from "@payload-config";
import { localePath, SITE_URL } from "@/lib/metadata";

/**
 * Step two of the double opt-in: the link in the confirmation email lands here.
 *
 * This is the moment consent becomes provable, so it is the moment we write the timestamp.
 * Everything else is redirects: the visitor should end up on a real page in their own
 * language, never looking at JSON.
 *
 * Clicking twice is not an error: an already-confirmed token reports success rather than
 * "invalid", because from the subscriber's side nothing is wrong.
 */
function statusRedirect(locale: string, status: string) {
  const url = new URL(`${SITE_URL}${localePath(locale, "/newsletter")}`);
  url.searchParams.set("status", status);
  return Response.redirect(url, 302);
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) return statusRedirect("pl", "invalid");

  try {
    const payload = await getPayload({ config });

    const found = await payload.find({
      collection: "subscribers",
      where: { token: { equals: token } },
      limit: 1,
      overrideAccess: true,
    });

    const subscriber = found.docs[0];
    if (!subscriber) return statusRedirect("pl", "invalid");

    const locale = subscriber.locale === "en" ? "en" : "pl";

    if (subscriber.status === "confirmed") return statusRedirect(locale, "confirmed");

    await payload.update({
      collection: "subscribers",
      id: subscriber.id,
      data: { status: "confirmed", confirmedAt: new Date().toISOString(), unsubscribedAt: null },
      overrideAccess: true,
    });

    return statusRedirect(locale, "confirmed");
  } catch (error) {
    console.error("[BodyWork] newsletter confirmation failed:", error);
    return statusRedirect("pl", "error");
  }
}

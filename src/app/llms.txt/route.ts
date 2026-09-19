import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { siteForRequestHost } from "@/lib/site-host";
import { ACADEMY_URL, ALFABET_RUCHU_URL, CENTRUM_URL, HUB_URL } from "../[locale]/hub/urls";

/**
 * `/llms.txt` for the hub: a plain-Markdown brief that answer engines can read without rendering the
 * page, built from the same `Hub` copy the page shows, so the two can't disagree.
 *
 * Hub host only. Outside `[locale]` for the same reason as `/feed.xml`, and the proxy never sees it
 * (its matcher skips file extensions), so this route checks the host itself; Centrum and the
 * dashboard get a 404.
 */
export async function GET() {
  if (siteForRequestHost((await headers()).get("host")) !== "hub") {
    return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const t = await getTranslations({ locale: "pl", namespace: "Hub" });
  const f = await getTranslations({ locale: "pl", namespace: "Footer" });
  const paragraphs = (key: string) => t.raw(key) as string[];

  const body = [
    "# BODYWORK",
    "",
    `> ${t("metaDescription")}`,
    "",
    "## Serwisy",
    "",
    `- [${t("centrumHeading")}](${CENTRUM_URL}/): ${t("centrumBody")}`,
    `- [${t("akademiaHeading")}](${ACADEMY_URL}): ${t("akademiaBody")}`,
    `- [${t("alfabetRuchuHeading")}](${ALFABET_RUCHU_URL}): ${t("alfabetRuchuBody")}`,
    "",
    "## O BODYWORK",
    "",
    ...paragraphs("about").flatMap((p) => [p, ""]),
    `## ${t("contact.heading")}`,
    "",
    t("contact.address"),
    "",
    `- ${f("addressLine1")}, ${f("addressLine2")}, ${f("addressLine3")}`,
    `- ${t("contact.receptionLabel")}: +48 ${f("phone")}, ${f("email")} (${t("contact.receptionHours")})`,
    `- ${t("contact.trainingLabel")}: +48 ${t("contact.trainingPhone")}, ${t("contact.trainingEmail")} (${t("contact.trainingHours")})`,
    "",
    "## Optional",
    "",
    `- [English version](${HUB_URL}/en)`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

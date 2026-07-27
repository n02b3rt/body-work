import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { MeetUsCta } from "@/components/centrum/MeetUsCta";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Footer" });
  return pageMetadata({ locale, path: "/kontakt", title: t("kontaktHeading") });
}

/**
 * The reference's `/kontakt` has **no content of its own**, its `<main>` holds nothing
 * but the shared footer's contact block, and there is no form (`<form>` appears zero
 * times) and no embedded map. So there is nothing to reproduce here, and this page is
 * composed from copy that already exists and has already been verified elsewhere in the
 * project: the footer's address/reception/hours and the homepage's "Spotkajmy się"
 * invitation. Nothing is invented.
 *
 * It carries only the invitation, and deliberately **not** an address/hours block: the
 * footer sits immediately below with exactly that, and rendering the same three columns
 * twice within one scroll read as a rendering bug rather than a design choice. The
 * footer is the canonical place for those details on every page, this one included.
 *
 * No map embed either, a Google Maps iframe sets third-party cookies, and there is no
 * consent mechanism yet (the cookies page is still to come). The footer's "Pokaż na
 * mapie" / "Nawiguj" buttons cover the need without that problem.
 */
type PageProps = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Footer");
  const tMeetUs = await getTranslations("MeetUs");
  const phone = t("phone");
  const email = t("email");

  return (
    <>
      <PageHero title={t("kontaktHeading")} titleSize="display" />

      <MeetUsCta
        heading={tMeetUs("heading")}
        body={tMeetUs("body", { phone, email })}
        phone={phone}
        email={email}
        callLabel={tMeetUs("call")}
        emailLabel={tMeetUs("sendEmail")}
      />
    </>
  );
}

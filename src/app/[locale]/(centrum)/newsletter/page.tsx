import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { NoticeLayout } from "@/components/centrum/NoticeLayout";
import { pageMetadata } from "@/lib/metadata";

/**
 * Where the newsletter emails land: the confirmation click, the unsubscribe click, and the
 * "that link is dead" case. Not a page anyone navigates to on purpose.
 *
 * The unsubscribe button is a plain `<form method="post">` rather than a fetch: this page
 * has to work in a webmail-launched browser tab with whatever JavaScript state it feels
 * like having, and a form post needs none of it.
 */

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; token?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "NewsletterStatus" });

  return {
    ...pageMetadata({ locale, path: "/newsletter", title: t("metaTitle") }),
    // A utility page with no content of its own: keep it out of the index. It is excluded
    // from `sitemap.ts` for the same reason.
    robots: { index: false, follow: false },
  };
}

export default async function NewsletterStatusPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { status, token } = await searchParams;
  const t = await getTranslations({ locale, namespace: "NewsletterStatus" });

  const home = (
    <Link href="/" className={buttonClasses("outline")}>
      {t("backHome")}
    </Link>
  );

  if (status === "confirmed") {
    return (
      <NoticeLayout
        code={t("confirmedCode")}
        heading={t("confirmedHeading")}
        body={t("confirmedBody")}
      >
        <Link href="/blog" className={buttonClasses("solid")}>
          {t("readBlog")}
        </Link>
        {home}
      </NoticeLayout>
    );
  }

  if (status === "unsubscribed") {
    return (
      <NoticeLayout
        code={t("unsubscribedCode")}
        heading={t("unsubscribedHeading")}
        body={t("unsubscribedBody")}
      >
        {home}
      </NoticeLayout>
    );
  }

  if (status === "confirm-unsubscribe" && token) {
    return (
      <NoticeLayout
        code={t("confirmCode")}
        heading={t("confirmHeading")}
        body={t("confirmBody")}
      >
        <form method="post" action="/api/newsletter/unsubscribe">
          <input type="hidden" name="token" value={token} />
          <button type="submit" className={buttonClasses("solid")}>
            {t("confirmButton")}
          </button>
        </form>
        {home}
      </NoticeLayout>
    );
  }

  if (status === "error") {
    return (
      <NoticeLayout code={t("errorCode")} heading={t("errorHeading")} body={t("errorBody")}>
        {home}
      </NoticeLayout>
    );
  }

  // No status, or a token that no longer matches anything: the same message either way,
  // since "expired" and "never existed" are indistinguishable from here, and telling them
  // apart would leak whether an address is on the list.
  return (
    <NoticeLayout code={t("invalidCode")} heading={t("invalidHeading")} body={t("invalidBody")}>
      {home}
    </NoticeLayout>
  );
}

import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { toE164 } from "@/lib/hub-jsonld";

/** Via `toE164`: the English `Footer.phone` already carries `+48`, the Polish one doesn't. */
const telHref = (phone: string) => `tel:${toE164(phone)}`;

/**
 * The reference's `#o-nas` and `#kontakt` sections, word for word: three centred paragraphs, then
 * "KONTAKT" with the address and both contact lines. The reference runs each contact line together
 * with ` / `; below `sm` the parts stack instead, and the separators only appear once they fit on
 * one line. The reception phone and email come from `Footer`, Centrum's own, so the sites can't drift.
 */
export async function Contact() {
  const t = await getTranslations("Hub");
  const f = await getTranslations("Footer");
  const about = t.raw("about") as string[];

  const link = "underline-offset-4 hover:underline";
  const lines = [
    {
      label: t("contact.receptionLabel"),
      phone: f("phone"),
      email: f("email"),
      hours: t("contact.receptionHours"),
    },
    {
      label: t("contact.trainingLabel"),
      phone: t("contact.trainingPhone"),
      email: t("contact.trainingEmail"),
      hours: t("contact.trainingHours"),
    },
  ];

  return (
    <>
      <section aria-label={t("pageHeading")} className="bg-white py-16 lg:py-24">
        <Container className="mx-auto max-w-5xl space-y-5 text-center text-[0.9375rem] leading-[1.7] tracking-[0.03em] text-[#003b5e]">
          {about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Container>
      </section>
      <section id="contact" aria-labelledby="contact-heading" className="bg-white pb-16 lg:pb-24">
        <Container className="text-center text-[0.9375rem] leading-[1.7] tracking-[0.03em] text-[#003b5e]">
          <h2 id="contact-heading" className="text-[2rem] font-normal uppercase tracking-[0.03em] lg:text-[2.5rem]">
            {t("contact.heading")}
          </h2>
          <p className="mt-5">{t("contact.address")}</p>
          {lines.map((line) => {
            const parts = [
              <>
                {line.label}: {t("contact.phonePrefix")}{" "}
                <a href={telHref(line.phone)} className={link}>
                  {line.phone}
                </a>
              </>,
              <>
                {t("contact.emailPrefix")}{" "}
                <a href={`mailto:${line.email}`} className={link}>
                  {line.email}
                </a>
              </>,
              <>{line.hours}</>,
            ];
            return (
              <p key={line.label} className="mt-3 flex flex-col sm:block">
                {parts.map((part, index) => (
                  <Fragment key={index}>
                    {index > 0 ? <span aria-hidden className="hidden sm:inline"> / </span> : null}
                    <span>{part}</span>
                  </Fragment>
                ))}
              </p>
            );
          })}
        </Container>
      </section>
    </>
  );
}

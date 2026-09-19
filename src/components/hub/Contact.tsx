import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { DIRECTIONS_URL, MAP_URL } from "@/lib/external-links";
import { toE164 } from "@/lib/hub-jsonld";
import { SectionIntro } from "./SectionIntro";

/** Via `toE164`: the English `Footer.phone` already carries `+48`, the Polish one doesn't. */
const telHref = (phone: string) => `tel:${toE164(phone)}`;

/**
 * The live homepage's "Kontakt" block, word for word: directions, opening hours, and both
 * contact points (Centrum's reception and course enquiries). The reception phone and email come
 * from the `Footer` namespace, Centrum's own, so the two sites can't drift apart.
 */
export async function Contact() {
  const t = await getTranslations("Hub.contact");
  const f = await getTranslations("Footer");
  const hours = t.raw("hours") as string[];

  const card = "rounded-3xl border border-brand-navy-soft/40 bg-white/60 p-8";
  const label = "text-label uppercase tracking-[0.2em] text-brand-green";
  const link = "underline-offset-4 hover:underline";

  const contacts = [
    { label: t("receptionLabel"), phone: f("phone"), email: f("email"), hours: t("receptionHours") },
    {
      label: t("trainingLabel"),
      phone: t("trainingPhone"),
      email: t("trainingEmail"),
      hours: t("trainingHours"),
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-16 border-t border-brand-navy-soft/40 bg-brand-surface py-20 lg:py-28"
    >
      <Container>
        <SectionIntro id="contact-heading" heading={t("heading")}>
          <p>{t("body")}</p>
        </SectionIntro>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-btn uppercase tracking-[0.1em] text-brand-navy">
          <a href={MAP_URL} rel="noopener" className={link}>
            {f("showOnMap")}
          </a>
          <a href={DIRECTIONS_URL} rel="noopener" className={link}>
            {f("getDirections")}
          </a>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16">
          <div className={card}>
            <h3 className={label}>{t("hoursLabel")}</h3>
            <ul className="mt-4 space-y-1 text-body text-brand-navy">
              {hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          {contacts.map((contact) => (
            <div key={contact.label} className={card}>
              <h3 className={label}>{contact.label}</h3>
              <p className="mt-4 text-body text-brand-navy">
                {t("phonePrefix")}{" "}
                <a href={telHref(contact.phone)} className={`${link} text-value`}>
                  {contact.phone}
                </a>
              </p>
              <p className="text-body text-brand-navy">
                {t("emailPrefix")}{" "}
                <a href={`mailto:${contact.email}`} className={link}>
                  {contact.email}
                </a>
              </p>
              <p className="mt-1 text-body text-brand-navy/70">{contact.hours}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type Status = "idle" | "sending" | "success" | "error";

export function NewsletterSignup() {
  const t = useTranslations("Newsletter");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<"error" | "errorInvalid" | "errorRateLimited">("error");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          locale,
          company,
          // Which page the signup came from: the section sits on most of them.
          source: window.location.pathname,
        }),
      });

      if (response.ok) {
        // Success here means "confirmation email sent", not "subscribed": the copy says so,
        // because the address does not join the list until the link in that mail is clicked.
        setStatus("success");
        return;
      }

      const body = await response.json().catch(() => null);
      setErrorKey(
        body?.error === "invalid-email"
          ? "errorInvalid"
          : body?.error === "rate-limited"
            ? "errorRateLimited"
            : "error",
      );
      setStatus("error");
    } catch {
      setErrorKey("error");
      setStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden border-t border-brand-navy-soft bg-background py-20 lg:py-28">
      {/* Full-bleed at every measured width, and a faint watermark rather than a photograph, so
        * it needs no placeholder: the 9KB it weighs arrives faster than a blur would help. */}
      <Image src="/images/home/newsletter-bg.webp" alt="" fill sizes="100vw" className="object-cover" />
      <Container className="relative z-10 flex flex-col items-center gap-14 text-center">
        <SectionHeading size="hero">
          {t("heading")}
          <br />
          {t("subheading")}
        </SectionHeading>

        {status === "success" ? (
          <p className="max-w-md text-body leading-[1.7] text-brand-navy">{t("success")}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col items-center gap-6">
              <label htmlFor="newsletter-email" className="sr-only">
                {t("placeholder")}
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("placeholder")}
                className="h-14 w-full rounded-full border border-brand-navy-soft bg-background px-6 text-center text-body text-brand-navy placeholder:text-brand-navy/60 focus:border-brand-navy focus:outline-none"
              />

              {/* Honeypot. Positioned off-screen rather than `display:none`, which the
                * cruder bots know to skip; a filled value is answered with a fake success
                * server-side so they learn nothing. */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="newsletter-company">Company</label>
                <input
                  id="newsletter-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className={buttonClasses("solid", "w-full disabled:opacity-60")}
              >
                {status === "sending" ? t("sending") : t("submit")}
              </button>

              {status === "error" ? (
                <p role="alert" className="text-label text-brand-navy">
                  {t(errorKey)}
                </p>
              ) : null}
            </form>
            {/* Sits outside the form so it isn't confined to the form's `max-w-sm`
             * and can stay on one line; it still wraps naturally on small screens. */}
            <p className="text-label text-brand-navy">
              {t.rich("consent", {
                link: (chunks) => (
                  <Link href="/regulamin" className="hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </>
        )}
      </Container>
    </section>
  );
}

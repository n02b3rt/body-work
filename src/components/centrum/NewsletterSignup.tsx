"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export function NewsletterSignup() {
  const t = useTranslations("Newsletter");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No newsletter backend yet (Listmonk isn't wired up — see docs/stack.md).
    setStatus("success");
  }

  return (
    <section className="relative overflow-hidden border-t border-brand-navy-soft bg-background py-20 lg:py-28">
      <Image src="/images/home/newsletter-bg.webp" alt="" fill sizes="100vw" className="object-cover" />
      <Container className="relative z-10 flex flex-col items-center gap-14 text-center">
        <SectionHeading size="hero">
          {t("heading")}
          <br />
          {t("subheading")}
        </SectionHeading>

        {status === "success" ? (
          <p className="text-body text-brand-navy">{t("success")}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col items-center gap-6">
              <label htmlFor="newsletter-email" className="sr-only">
                {t("placeholder")}
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("placeholder")}
                className="h-14 w-full rounded-full border border-brand-navy-soft bg-background px-6 text-center text-body text-brand-navy placeholder:text-brand-navy/60 focus:border-brand-navy focus:outline-none"
              />
              <button type="submit" className={buttonClasses("solid", "w-full")}>
                {t("submit")}
              </button>
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

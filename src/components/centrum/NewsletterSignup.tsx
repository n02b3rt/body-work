"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
    <section className="bg-brand-navy py-20 text-white lg:py-28">
      <Container className="flex flex-col items-center gap-8 text-center">
        <SectionHeading as="h2" className="text-white">
          {t("heading")}
          <br />
          {t("subheading")}
        </SectionHeading>

        {status === "success" ? (
          <p className="text-lg">{t("success")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
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
              className="h-14 flex-1 rounded-full border border-white/40 bg-transparent px-6 text-white placeholder:text-white/60 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-white bg-white px-7 text-sm font-semibold uppercase tracking-[0.1em] text-brand-navy transition-colors duration-200 hover:bg-transparent hover:text-white"
            >
              {t("submit")}
            </button>
          </form>
        )}
      </Container>
    </section>
  );
}

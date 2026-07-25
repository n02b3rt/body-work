import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-brand-navy text-white">
      {/* Placeholder for the hero video/image — real asset pending client delivery, see docs/sites.md */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-slate-800" aria-hidden />
      <Container className="relative z-10 flex flex-col items-center gap-6 py-32 text-center">
        <h1 className="max-w-4xl text-4xl font-bold uppercase tracking-tight sm:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-white/85 sm:text-xl">{t("subtitle")}</p>
      </Container>
    </section>
  );
}

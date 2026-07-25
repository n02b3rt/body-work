"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export type AccordionItemData = {
  heading: string;
  body: string;
  image?: string;
};

type AccordionProps = {
  items: AccordionItemData[];
};

/** Stack of expandable rows — the reference's "Kiedy warto?" list. Its closed row
 * turns navy on hover, and the toggle is a labelled pill from `lg` up but a compact
 * chevron below that. */
export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-brand-navy-soft bg-background">
      {items.map((item, index) => (
        <AccordionRow
          key={item.heading}
          item={item}
          open={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        />
      ))}
    </div>
  );
}

function AccordionRow({
  item,
  open,
  onToggle,
}: {
  item: AccordionItemData;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Statements");
  const panelId = useId();

  return (
    <div className="border-b border-brand-navy-soft">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "group flex w-full items-center gap-6 text-left transition-colors duration-200",
          open ? "bg-brand-navy text-background" : "text-brand-navy hover:bg-brand-navy hover:text-background",
        )}
      >
        <Container className="flex items-center justify-between gap-6 py-6 lg:py-8">
          <span className="text-h-menu">{item.heading}</span>

          {/* Pill on desktop, chevron circle below it — as in the reference. */}
          <span
            className={cn(
              buttonClasses("outline"),
              "hidden shrink-0 border-current bg-transparent text-current group-hover:bg-transparent group-hover:text-current lg:inline-flex",
            )}
          >
            {open ? t("showLess") : t("learnMore")}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current lg:hidden">
            <svg
              viewBox="0 0 10 16"
              width="7"
              height="14"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className={cn("transition-transform duration-200", open ? "-rotate-90" : "rotate-90")}
            >
              <path d="M0 0L4.88 4.88L0 9.76" transform="translate(2 3)" />
            </svg>
          </span>
        </Container>
      </button>

      <div
        id={panelId}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        {/* The panel splits the full section width: padded copy on the left, the
         * image filling its half edge to edge (no container padding around it). */}
        <div className="min-h-0">
          <div className="grid lg:grid-cols-2">
            <div className="px-4 py-12 sm:px-6 lg:py-16 lg:pl-8 lg:pr-16">
              <p className="text-body text-brand-navy">{item.body}</p>
            </div>
            {item.image ? (
              <div className="relative min-h-[18rem] w-full lg:min-h-full">
                <Image
                  src={item.image}
                  alt={item.heading}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

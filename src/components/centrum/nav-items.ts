"use client";

import { useTranslations } from "next-intl";

export type NavChild = { label: string; href: string; external?: boolean };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/** Menu structure mirrors the scraped reference nav — see docs/scraped-site-map.md. */
export function useNavItems(): NavItem[] {
  const t = useTranslations("Nav");

  return [
    {
      label: t("personalTraining"),
      href: "/trening-personalny",
      children: [
        { label: t("personalTrainingIndividual"), href: "/trening-personalny/trening-indywidualny" },
        { label: t("personalTrainingPairs"), href: "/trening-personalny/trening-w-parze" },
        { label: t("personalTrainingAssessment"), href: "/trening-personalny/ocena-funkcjonalna" },
        { label: t("personalTrainingTrainers"), href: "/trening-personalny/trenerzy" },
      ],
    },
    {
      label: t("physiotherapy"),
      href: "/fizjoterapia",
      children: [
        { label: t("physiotherapyManual"), href: "/fizjoterapia/terapia-manualna" },
        { label: t("physiotherapyRehab"), href: "/fizjoterapia/rehabilitacja-ruchowa" },
        { label: t("physiotherapyBelly"), href: "/fizjoterapia/zdrowy-brzuch" },
        { label: t("physiotherapySpecialists"), href: "/fizjoterapia/specjalisci" },
      ],
    },
    {
      label: t("groupTraining"),
      href: "/trening-grupowy",
      children: [
        { label: t("groupTrainingClasses"), href: "/trening-grupowy/zajecia-grupowe" },
        { label: t("groupTrainingPlan"), href: "/trening-grupowy/plan-zdrowej-zmiany" },
        {
          label: t("groupTrainingSchedule"),
          href: "https://bodywork-poznan.cms.efitness.com.pl/kalendarz-zajec",
          external: true,
        },
        { label: t("groupTrainingMedicover"), href: "/trening-grupowy/medicover" },
      ],
    },
    {
      label: t("dietetics"),
      href: "/dietetyka",
      children: [
        { label: t("dieteticsSpecialist1"), href: "/dietetyka/iwona-stachowiak" },
        { label: t("dieteticsSpecialist2"), href: "/dietetyka/magdalena-hajduk-warchol" },
      ],
    },
    {
      label: t("bodylab"),
      href: "/bodylab",
      children: [
        { label: t("bodylabVald"), href: "/bodylab/technologia-vald" },
        { label: t("bodylabComposition"), href: "/bodylab/analiza-skadu-ciala" },
      ],
    },
    { label: t("pricing"), href: "/cennik" },
    { label: t("massage"), href: "/masaz" },
    { label: t("blog"), href: "/blog" },
  ];
}

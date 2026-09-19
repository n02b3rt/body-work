/**
 * The hub's structured data, as one `@graph`.
 *
 * The hub is the brand's front door, so it is where the organisation itself is described: the
 * umbrella `Organization`, the `WebSite` and `WebPage` it publishes, and the three places a visitor
 * can go, each typed for what it is. Centrum keeps the `@id` it already declares on its own pages
 * (`<centrum>/#business`), so a crawler merges the two descriptions instead of seeing two businesses.
 *
 * No imports on purpose: every URL and every string comes in as an argument, which keeps this
 * testable under Node's own runner (see `tests/hub-jsonld.test.ts`) and keeps the hub's origin out
 * of `src/lib/metadata.ts`, which is Centrum's.
 */

type Thing = Record<string, unknown>;

export type HubJsonLdInput = {
  locale: string;
  /** The hub's origin, no trailing slash. */
  hubUrl: string;
  /** This page's own canonical URL. */
  pageUrl: string;
  centrumUrl: string;
  academyUrl: string;
  alfabetRuchuUrl: string;
  title: string;
  description: string;
  /** Site-relative or absolute. */
  logo: string;
  image: string;
  sameAs: string[];
  contact: {
    streetAddress: string;
    postalCode: string;
    city: string;
    phone: string;
    email: string;
    trainingPhone: string;
    trainingEmail: string;
    latitude: number;
    longitude: number;
    mapUrl: string;
  };
  destinations: {
    centrum: { name: string; description: string };
    academy: { name: string; description: string };
    alfabetRuchu: { name: string; description: string };
  };
  faq: { question: string; answer: string }[];
};

/** `609 805 660` → `+48609805660`, the form schema.org and `tel:` links both expect. */
export function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("48") && digits.length === 11 ? `+${digits}` : `+48${digits}`;
}

export function hubJsonLd(input: HubJsonLdInput): Thing {
  const { hubUrl, pageUrl, contact, destinations } = input;
  const abs = (url: string) => (url.startsWith("http") ? url : `${hubUrl}${url}`);
  const strip = (url: string) => url.replace(/\/$/, "");

  const orgId = `${hubUrl}/#organization`;
  const websiteId = `${hubUrl}/#website`;
  const centrumId = `${strip(input.centrumUrl)}/#business`;
  const academyId = `${strip(input.academyUrl)}/#organization`;
  const alfabetId = `${hubUrl}/#alfabet-ruchu`;

  const address = {
    "@type": "PostalAddress",
    streetAddress: contact.streetAddress,
    postalCode: contact.postalCode,
    addressLocality: contact.city,
    addressCountry: "PL",
  };

  const organization: Thing = {
    "@type": "Organization",
    "@id": orgId,
    name: "BODYWORK",
    url: `${hubUrl}/`,
    logo: { "@type": "ImageObject", url: abs(input.logo) },
    image: abs(input.image),
    description: input.description,
    email: contact.email,
    telephone: toE164(contact.phone),
    address,
    sameAs: input.sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: toE164(contact.phone),
        email: contact.email,
        areaServed: "PL",
        availableLanguage: ["pl", "en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        name: destinations.academy.name,
        telephone: toE164(contact.trainingPhone),
        email: contact.trainingEmail,
        areaServed: "PL",
        availableLanguage: ["pl"],
      },
    ],
    subOrganization: [{ "@id": centrumId }, { "@id": academyId }, { "@id": alfabetId }],
  };

  const centrum: Thing = {
    "@type": "HealthAndBeautyBusiness",
    "@id": centrumId,
    name: destinations.centrum.name,
    description: destinations.centrum.description,
    url: input.centrumUrl,
    image: abs(input.image),
    telephone: toE164(contact.phone),
    email: contact.email,
    address,
    geo: { "@type": "GeoCoordinates", latitude: contact.latitude, longitude: contact.longitude },
    hasMap: contact.mapUrl,
    parentOrganization: { "@id": orgId },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "22:00",
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "14:00" },
    ],
  };

  const academy: Thing = {
    "@type": "EducationalOrganization",
    "@id": academyId,
    name: destinations.academy.name,
    description: destinations.academy.description,
    url: input.academyUrl,
    telephone: toE164(contact.trainingPhone),
    email: contact.trainingEmail,
    address,
    parentOrganization: { "@id": orgId },
  };

  const alfabetRuchu: Thing = {
    "@type": "EducationalOrganization",
    "@id": alfabetId,
    name: destinations.alfabetRuchu.name,
    description: destinations.alfabetRuchu.description,
    url: input.alfabetRuchuUrl,
    parentOrganization: { "@id": orgId },
  };

  const website: Thing = {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${hubUrl}/`,
    name: "BODYWORK",
    inLanguage: input.locale,
    publisher: { "@id": orgId },
  };

  const webpage: Thing = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: input.title,
    description: input.description,
    inLanguage: input.locale,
    isPartOf: { "@id": websiteId },
    about: { "@id": orgId },
    primaryImageOfPage: { "@type": "ImageObject", url: abs(input.image) },
    // The page's whole job: the three places it sends people, in the order it shows them.
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [
        [destinations.centrum.name, input.centrumUrl],
        [destinations.academy.name, input.academyUrl],
        [destinations.alfabetRuchu.name, input.alfabetRuchuUrl],
      ].map(([name, url], index) => ({ "@type": "ListItem", position: index + 1, name, url })),
    },
  };

  const faq: Thing = {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    isPartOf: { "@id": `${pageUrl}#webpage` },
    inLanguage: input.locale,
    mainEntity: input.faq.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, webpage, centrum, academy, alfabetRuchu, ...(input.faq.length ? [faq] : [])],
  };
}

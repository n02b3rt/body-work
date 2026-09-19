/** The hub's own origin: the bare host, see the note in `src/lib/metadata.ts`. */
export const HUB_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(/\/$/, "");

export const CENTRUM_URL = (process.env.NEXT_PUBLIC_CENTRUM_URL || "http://centrum.localhost:3000").replace(
  /\/$/,
  "",
);

/** Akademia has no env var of its own yet, it isn't built (see docs/map.md); same value is
 * hardcoded in `centrum/Header.tsx` and the Centrum homepage's service grid. */
export const ACADEMY_URL = "https://akademia.body-work.pl";

/** Real, external, confirmed from the client's own `home-trojpodzial` reference page. */
export const ALFABET_RUCHU_URL = "https://alfabetruchu.podia.com/";

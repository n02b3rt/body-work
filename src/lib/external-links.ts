/** Off-site destinations the Centrum links to, in one place so they can't drift apart
 * (`SCHEDULE_URL` had been copied into three files). */

/** eFitness booking calendar: the class schedule lives there, not on our site. The
 * reference is inconsistent about this, its header dropdown links out here while its
 * mega-menu and mobile nav point at an internal `/trening-grupowy/grafik-zajec`, a page
 * that carries no content of its own. We link out everywhere, since that is the only
 * destination that actually exists. */
export const SCHEDULE_URL = "https://bodywork-poznan.cms.efitness.com.pl/kalendarz-zajec";

export const INSTAGRAM_URL = "https://www.instagram.com/body_work_centrum/";
export const FACEBOOK_URL = "https://www.facebook.com/centrumbodywork/?locale=pl_PL";

/**
 * Where the "Zobacz galerię" / "Zobacz" buttons point.
 *
 * **The reference links these at `/galeria`, which does not exist**, it 404s on the
 * live site, has no entry in `sitemap.xml` and no folder in the scrape, yet four places
 * link to it (the homepage's "Przyjazna przestrzeń" card, `/fizjoterapia`,
 * `/trening-personalny` and `/instrukcja`). So the broken link is the client's, not
 * ours. Rather than ship four dead buttons or invent a gallery page with no reference
 * content, they point at the Instagram profile, which is in practice the photo gallery
 * of the space these buttons promise. **Confirm the intended target with the client**;
 * if a real gallery page arrives, this is the single line to change.
 */
export const GALLERY_URL = INSTAGRAM_URL;

/** The centre on Google Maps, and turn-by-turn directions to it. Used by the footer,
 * the mega-menu's "Mapa dojazdu" and the contact page. */
export const MAP_URL =
  "https://www.google.com/maps/place/BODYWORK/@52.41825,16.890763,15z/data=!4m6!3m5!1s0x470444beb9f08a6b:0x9005d9db3042bade!8m2!3d52.4182498!4d16.8907633!16s%2Fg%2F11byvnvxmm";
export const DIRECTIONS_URL =
  "https://www.google.com/maps/dir//Kajki+14,+60-545+Poznań/@52.4036757,16.8899891,14z";

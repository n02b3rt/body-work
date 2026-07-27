/**
 * Cards rendered per pagination step.
 *
 * Its own module with no imports on purpose: `BlogList` is a Client Component, and taking this
 * from `blog-listing.ts` would drag Payload into the browser bundle. Both the server routes and
 * the client list read it from here so the three cannot drift apart.
 */
export const BLOG_PAGE_SIZE = 9;

> Read when: adding or editing a collection, a global, a shared field, or the Payload config itself.

# CMS / Payload

Payload CMS 3 runs in-process inside the Next.js app. No separate backend, no HTTP round-trip:
Server Components read content through `getPayload()`.

## Entry points

- Config: `src/payload.config.ts` (DB adapter, editor, collections, globals, Polish admin i18n)
- Panel and API: `src/app/(payload)/` (admin at `/admin`, REST and GraphQL under `/api`)
- Host proxy: `src/proxy.ts`

## Collections

`src/collections/`, one file each.

| Collection | Holds |
|---|---|
| `Users.ts` | staff and client accounts, roles, username login |
| `Media.ts` | uploads, conversion, a11y and SEO fields |
| `Pages.ts` | the nested page tree plus the builder layout |
| `Posts.ts` | blog posts |
| `Categories.ts` | blog categories |
| `Authors.ts` | post authors (trainers, not CMS accounts) |
| `PostTranslations.ts` | English versions of posts |
| `Subscribers.ts` | the newsletter list |
| `SiteComponents.ts` | the editor's saved compositions |

## Globals and shared fields

`src/globals/SiteSettings.ts` (brand identity, contact, default SEO), `src/globals/ThemeColors.ts`.
Shared field definitions: `src/fields/meta.ts` (SEO), `src/fields/page-layout.ts` (builder sections).

## Access

`src/access/roles.ts`. Roles are `administrator`, `edytor`, `klient`. Use the helpers; never invent a
parallel permission check. See [`accounts.md`](./accounts.md).

## Gotchas

- **`src/payload-types.ts` (754 KB) and `src/app/(payload)/admin/importMap.js` are generated.**
  Never hand-edit, never hand-merge, never read in full. Take either side of a conflict and regenerate.
- **The admin is reachable only on the dashboard host.** Public hosts return a plain 404 for `/admin`,
  not a redirect, so the dashboard hostname does not leak.
- **`/admin/c/*` and `/admin/g/*`** are proxy rewrites to Payload's `/collections/` and `/globals/`.
  Built-in Payload links may still show the long form.
- **Payload pushes the dev schema on startup.** If it warns about a destructive change, stop and ask.
  Never answer it with `docker compose down -v`: one volume holds every parallel agent's database.
- **Admin POSTs need the CSRF `Origin` to match the dashboard URL, including the port.** A port drift
  between `.env` and `pnpm dev --port` leaves the panel looking logged in while saves return 403.

## After a schema change

```bash
pnpm generate:types
```
```bash
pnpm generate:importmap
```

## Related

Skill `payload-schema` · [`../architecture.md`](../architecture.md) · [`../decisions.md`](../decisions.md)

> Read when: touching roles, permissions, login, the user collection, or anything that creates an account.

# Accounts and roles

Three roles, login by username **or** email, no public self-registration. Shared across all four
sites: one account works everywhere, permissions decide what it sees.

## Roles

`administrator` · `edytor` · `klient`

- **administrator:** everything.
- **edytor:** Treści, E-commerce, and the parts of Zarządzanie that are content (Tłumaczenia,
  Wygląd, Ustawienia → Treści). Content delete and `ThemeColors` update included. `Users` and the
  ops views stay admin-only.
- **klient:** blocked from the admin panel entirely. This is the role a future checkout will create.

Helpers live in `src/access/roles.ts`. **Never invent a parallel permission check.**

## Files

| Role | Path |
|---|---|
| Access rules | `src/access/roles.ts` |
| Collection | `src/collections/Users.ts` |
| Username, password, availability, display name | `src/lib/users/` (`username.ts`, `password.ts`, `availability.ts`, `display-name.ts`, `slugify-pl.ts`, `index.ts`) |
| First-user screen | `src/components/admin/users/CreateFirstUserForm.tsx`, `CreateFirstUserView.tsx` |
| Create/edit enhancements | `src/components/admin/users/UserFormEnhancements.tsx` |
| Styles | `src/components/admin/users/password-tools.module.css` |
| Availability API | `src/app/api/admin/users/availability/` |

Display name comes from `getDisplayName`: full name if present, otherwise username.

## Gotchas

- **No public self-registration.** Accounts are created by an administrator, or later by checkout.
- **The password generator is hand-rolled crypto**, deliberately, to avoid a new dependency.
- **Stock Payload Auth still renders confirm-password on create.** It is hidden with CSS only when
  `html.bw-users-create` is set by `UserFormEnhancements`.
- **Rows predating the role rename** (`redaktor`, `moderator`) need a one-off update or a clean database.
- Checkout account creation is deferred, but the helpers in `src/lib/users/` are ready to reuse.

## Related

[`cms-payload.md`](./cms-payload.md) · [`../prd/07-bezpieczenstwo.md`](../prd/07-bezpieczenstwo.md)

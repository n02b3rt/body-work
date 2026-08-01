> Read when: changing the dashboard navigation, the welcome screen, or any custom admin view.

# Admin panel

The dashboard is Payload's admin with a custom nav, a custom dashboard and several custom views.
It is reachable only on the dashboard host.

## Navigation

- Structure: `src/admin/nav-tree.ts` (nested, WordPress-style; stub leaves point at `/admin/coming-soon?section=<id>`)
- Render: `src/components/admin/AdminNav.tsx`, replacing Payload's `DefaultNav`
- Icons: `src/components/admin/nav-icons.tsx` (16x16 viewBox, sized via CSS)
- **Presentation lives in `src/app/(payload)/custom.css` under `.bw-nav*`**, not in the component.
  Active state is background plus font weight, with no inset border and no Payload link indicator.

Payload's `admin.group` is deliberately not used: it cannot express multi-level nav.

## Views

`src/components/admin/`

| File | Screen |
|---|---|
| `WelcomeDashboard.tsx` | the dashboard landing screen |
| `PagesTree.tsx` | the expandable page tree |
| `ComingSoonView.tsx` | stub target for unbuilt sections |
| `SeoPreview.tsx`, `SeoHints.tsx` | SEO panel on editable documents |
| `UpdatesView/Panel.tsx`, `LibrariesView/Panel.tsx`, `package-report-ui.tsx` | see [`package-updates.md`](./package-updates.md) |
| `EnglishVersionPanel.tsx` | see [`admin-ai.md`](./admin-ai.md) |

Sub-folders have their own map entries: `media/`, `builder/`, `appearance/`, `users/`, `ai/`.

## Short URLs

Nav links use `/admin/c/<slug>` and `/admin/g/<slug>`; `src/proxy.ts` rewrites them to Payload's
`/collections/` and `/globals/`. Built-in Payload links may still show the long form.

## Gotchas

- **After adding an admin component, run `pnpm generate:importmap`** or it will not render.
- **Every string an editor sees follows the house style**: one short dry line, not a tutorial.
  This is enforced by the `admin-copy` skill and [`../admin-copy.md`](../admin-copy.md).
- **Editors work in Polish.** Polish strings in collection and global configs are fine and expected.

## Related

Skill `admin-copy` · [`../admin-copy.md`](../admin-copy.md) · [`../conventions.md`](../conventions.md)

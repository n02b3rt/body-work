> Read when: touching the Aktualizacje or Biblioteki screens, or the dependency report behind them.

# Package updates

Two screens off one shared report. They differ **only** in how the table is rendered.

| Screen | Shows |
|---|---|
| Kokpit → Aktualizacje | outdated packages only: declared range, installed version, latest, one release-notes link |
| Zarządzanie → Biblioteki | plain inventory: installed version plus npm, project-site and GitHub icon links. **No orange update highlight, no latest column, no counts** |

## Files

| Role | Path |
|---|---|
| Report and cache | `src/lib/package-updates.ts` |
| Client-safe shared types and `releaseNotesUrl` | `src/lib/package-updates-shared.ts` |
| API | `src/app/api/admin/package-updates/` |
| Table renderer (both modes) | `src/components/admin/package-report-ui.tsx` |
| Aktualizacje | `src/components/admin/UpdatesView.tsx`, `UpdatesPanel.tsx` |
| Biblioteki | `src/components/admin/LibrariesView.tsx`, `LibrariesPanel.tsx` |

## Gotchas

- **One report, one 24 h cache, two table modes.** Do not fork the data layer to change a column.
- **Only Aktualizacje owns the scheduler.** Biblioteki reads versions and links, nothing else.
- **GitHub tag URLs assume a `v` prefix** (`releases/tag/vX`), which is the common case. Packages
  without Releases may 404 on it; that is still better than inventing a non-GitHub path. Non-GitHub
  repos fall back to a search.
- **Sorting is alphabetical.** Status deliberately does not reorder rows.
- **This panel only reports.** It never installs anything: the stack rule says a human approves every
  dependency change first.

## Related

[`../stack.md`](../stack.md) · [`admin-panel.md`](./admin-panel.md)

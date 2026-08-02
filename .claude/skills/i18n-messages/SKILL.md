---
name: i18n-messages
description: Why a translated string can render as a raw key path in the browser, and what to do about it. Use whenever you add or rename a key in messages/pl.json or messages/en.json, make a component "use client" that reads translations, or see a literal key path like Blog.title rendered on the page.
---

**Only 11 of the 48 namespaces are shipped to the browser.** `getMessages()` is 188 KB; client
components need 7.1 KB, so the list is explicit rather than automatic.

A `"use client"` component reading a namespace that is not on that list renders the **key path**
instead of the string. That is the symptom; this is the fix:

1. Add the namespace to `src/i18n/client-namespaces.ts`.
2. Verify:

```bash
pnpm check:messages
```

Rules worth keeping:

- Add every key to **both** `messages/pl.json` and `messages/en.json`. Default locale is `pl`.
- Don't hardcode user-facing Polish in a frontend component when a message key exists.
- New component = bilingual from the start, not "for now".
- **Server components don't need any of this**: prefer keeping a component on the server, and pass
  the string down as a prop, over adding a namespace to the client bundle.
- Legitimate PL/EN count differences exist (`Blog.categoryLocative.*` declines in Polish and not in
  English; `BlogTeasers` guards with `t.has()`). A mismatch is not automatically a bug.

Posts are different: English versions live in the `PostTranslations` collection, and **a post with no
translation 404s in EN**. See `docs/i18n.md`. CMS builder pages are Polish-only by design.

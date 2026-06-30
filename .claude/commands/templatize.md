---
description: One-time. Convert an existing demo store into a clean white-label template.
argument-hint: <path-to-your-demo> "<current brand name in the demo>"
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(cp:*), Bash(ls:*), Bash(mkdir:*), Bash(grep:*)
disable-model-invocation: true
---

You are converting an existing, finished ecommerce site into the reusable `template/` defined in
`CLAUDE.md`. This runs **once**. After it, every store is just a config swap.

Input:
- Source demo path: `$1`
- The brand name currently hardcoded in the demo: `$2`

Steps:

1. **Copy** the demo into `template/` (preserve structure). Work only inside `template/` from
   here on — never touch the original at `$1`.

2. **Inventory what varies.** Using Grep, find every occurrence in `template/` of:
   - the brand name `$2` (in JSX, page titles, `index.html`, manifest, email strings)
   - hardcoded colors: hex (`#xxxxxx`), `rgb(...)`, and Tailwind arbitrary values (`bg-[#...]`,
     `text-[...]`), plus named theme colors in `tailwind.config`
   - contact info, social links, SEO title/description
   - any product data hardcoded in components rather than loaded from the API/DB

3. **Create `src/store.config.js`** exactly in the shape from `CLAUDE.md`. Fill it with the
   demo's *current* values (so the template still builds identically to the demo).

4. **Parameterize, in this order:**
   - **Theme.** Collapse the demo's colors into `theme.primary / secondary / accent` (pick the
     three that carry the design; map shades to these). Wire `tailwind.config.js` to import the
     theme. Rewrite components to semantic classes (`bg-primary`, etc.). Remove every raw hex
     and `bg-[#...]` from components.
   - **Brand.** Replace every `$2` literal with a reference to `store.brand.name` (or the right
     config field). Wire `index.html` title/meta and the manifest to `store.seo` / `store.brand`
     (use a small head manager or a build-time replace — match what the demo already does).
   - **Contact / social / locale.** Point them at the config.
   - **Catalog.** Move any hardcoded demo products into `server/src/seed/seed.js` so products
     come only from the DB. Confirm components fetch from the API, not from inline arrays.

5. **Verify the contract.** Re-grep `template/` for the brand name `$2`, raw hex, and `bg-[#`.
   The only allowed remaining hits are inside `src/store.config.js`. List any you could not
   safely move and explain why.

6. **Report** a short summary:
   - the three theme colors you chose and what they map to
   - the config fields you populated
   - anything left hardcoded that needs a human decision (a punch list)
   - confirmation that `template/` still builds/runs the same as the demo

Do not start generating stores. This command only produces a clean, parameterized template.

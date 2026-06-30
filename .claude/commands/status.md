---
description: List generated stores and whether the template is ready.
allowed-tools: Read, Glob, Bash(ls:*), Bash(cat:*)
disable-model-invocation: true
---

Report current state. Do not modify anything.

1. Is `template/` present and parameterized? (Check that `template/src/store.config.js` exists.)
   If not, tell the user to run `/templatize` first.
2. List every folder in `stores/`. For each, read its `src/store.config.js` and show:
   brand name, niche type, the three theme colors, and currency.
3. For each store, check whether `server/src/seed/seed.js` has a non-empty catalog and whether a
   punch list exists at `docs/reviews/<slug>.md` (note if it still has open items).
4. Keep it to a compact table.

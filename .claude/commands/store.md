---
description: Spin up a new branded store from the template. Just describe the brand, niche, and colors.
argument-hint: "<brand name>, sells <what>, <color theme/vibe>"  [extra: contact, currency, tone]
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(cp:*), Bash(ls:*), Bash(mkdir:*), Bash(grep:*)
disable-model-invocation: true
---

Spin up a complete branded store from `template/`, following the contract in `CLAUDE.md`.

The brief: **$ARGUMENTS**

### 1. Parse + confirm (the only human checkpoint)
Turn the brief into a structured spec and write it to `docs/briefs/<slug>.md`, where `<slug>` is
the kebab-case brand name. Fill in:
- brand name, tagline, a 1-line positioning
- niche type + product noun (singular/plural)
- color theme: if the user gave hex, use it; if they gave a vibe ("warm earthy", "luxury gold &
  black"), translate it into `primary / secondary / accent` hex that is legible and on-brand
- locale/currency (default DZD / fr-DZ unless stated), contact + social if given, copy tone

Print the spec and **STOP. Ask the user to confirm or edit before continuing.**

### 2. Clone the template
After confirmation: `cp -r template/ stores/<slug>/`. From here, work only inside
`stores/<slug>/`. Never modify `template/`.

### 3. Brand + theme
Invoke the **brand-themer** subagent on `stores/<slug>/` with the confirmed spec. It writes
`src/store.config.js` (brand, theme, contact, social, locale, seo). Verify afterward that no raw
hex or old placeholder brand name leaked outside the config.

### 4. Copy
Invoke the **copywriter** subagent. It rewrites the on-page marketing copy (hero, value props,
about/footer, category blurbs, CTAs) for this brand, niche, and tone — pulling brand strings
from the config, not hardcoding them.

### 5. Catalog
Invoke the **catalog-generator** subagent. It generates a realistic catalog for the niche
(categories + products with names, descriptions, prices in the store currency, and placeholder
images) and writes `server/src/seed/seed.js` against the existing Mongoose models.

### 6. QA
Invoke the **store-reviewer** subagent (read-only). It checks `stores/<slug>/` for: leftover
template brand name or placeholder strings, raw hex / `bg-[#` in components, theme consistency,
responsive/touch issues, and broken config references. It writes a punch list to
`docs/reviews/<slug>.md`.

Then **you** (this session, which can edit) apply each item on that punch list. Re-grep to
confirm zero leakage of the old brand name and zero raw hex outside the config.

### 7. Hand off
Print the run commands for the new store:
```
cd stores/<slug>
npm install            # both root and server, per the template's setup
# set server/.env (MONGO_URI, CLOUDINARY_*) from .env.example
node server/src/seed/seed.js
npm run dev
```
And a 3-line summary: brand, theme colors, product count.

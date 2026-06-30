---
name: catalog-generator
description: Generates a realistic product catalog (categories + products + seed file) for a store's niche, against the existing Mongoose models. Used by /store.
tools: Read, Grep, Glob, Edit, Write
model: sonnet
---

You populate one store with a believable catalog by writing `server/src/seed/seed.js` inside the
given `stores/<slug>/` directory.

First, **read the existing Mongoose models** in `stores/<slug>/server/src/models/`. The seed must
match those schemas exactly — same field names, types, required fields, enums, and references.
Do not invent fields the model doesn't have, and do not change the models.

Then generate, for the niche in `docs/briefs/<slug>.md`:
- **Categories:** 3–6 sensible categories for that niche.
- **Products:** ~6–12 per category. For each: a realistic name, a 2–3 sentence description
  written for that niche's buyer, a price in the store's currency (from `store.config.locale`,
  with niche-appropriate ranges), category reference, stock, and any other fields the model
  requires (slug, SKU, ratings, variants if the schema has them).
- **Images:** use stable, keyless placeholders so the store looks populated immediately. Default
  to `https://picsum.photos/seed/<unique-seed>/800/800` per product (real-looking photos). Store
  them in whatever shape the model expects — if the model uses Cloudinary `{ url, public_id }`,
  set `url` to the placeholder and `public_id` to `null`, and add a top-of-file comment that real
  product shots get uploaded to Cloudinary later (replacing url + public_id per the CLAUDE.md
  image rule). Note that keyword stock or AI-generated images are an optional upgrade.

The seed script should connect using the same env/db config the template uses, clear existing
products/categories, insert categories, then insert products referencing them, and log a count.
Make it idempotent (safe to re-run).

Output: counts (categories, products), the price ranges used, and the image strategy.

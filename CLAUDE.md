# Ecommerce store builder — constitution

This repo is a **white-label ecommerce factory**. It holds one polished reference design
(`template/`) and spins up rebranded, restocked copies of it into `stores/<slug>/`.

The core principle: **the template never changes per store.** Everything that varies between
stores lives in a single source of truth. A store is created by copying the template and
overwriting that source — not by editing components.

---

## The single source of truth

Every store has exactly one file that holds everything brand-specific:

`src/store.config.js`

```js
export const store = {
  brand: {
    name: "ACME",              // shown everywhere via this value, never hardcoded in JSX
    tagline: "Short value prop",
    logoText: "ACME",          // text logo fallback
    logo: "/logo.svg",         // optional image logo
    favicon: "/favicon.svg",
  },
  niche: {
    type: "general",           // e.g. "perfume", "sneakers", "skincare"
    productNoun: "product",    // used in copy: "fragrance", "pair", "serum"
    productNounPlural: "products",
  },
  theme: {
    primary:   "#111111",      // brand color — buttons, links, accents
    secondary: "#f5f5f4",      // surfaces / muted backgrounds
    accent:    "#c0a062",      // highlights, badges, hover
  },
  contact:  { email: "", phone: "", whatsapp: "", address: "" },
  social:   { instagram: "", facebook: "", tiktok: "" },
  locale:   { currency: "DZD", currencySymbol: "DA", locale: "fr-DZ", lang: "fr" },
  seo:      { title: "", description: "", ogImage: "" },
};
```

### Rules that make this work — every agent obeys these
1. **No brand-specific literal appears anywhere except `store.config.js`.** No hardcoded brand
   name in components, no hardcoded hex in components, no hardcoded contact info, no hardcoded
   SEO title. Components import from the config.
2. **Theme flows to Tailwind.** `tailwind.config.js` imports the theme and exposes it as
   semantic color tokens. Components use `bg-primary`, `text-accent`, `border-secondary` — and
   **never** raw hex or arbitrary `bg-[#...]` values.

   ```js
   // vite.config.js  (same module system as the reference: ESM here)
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'
   
   export default defineConfig({
     plugins: [react() ,tailwindcss()],
     assetsInclude: ['**/*.mp4', '**/*.glb', '**/*.gltf'],})

   ```

3. **Product data comes only from the database/seed**, never hardcoded in components. The seed
   file is the catalog: `server/src/seed/seed.js`.
4. **Changing the entire look of a store = editing three hex values** in `store.config.js`.
   If that isn't true, the templatizer did not finish — fix the template, not the store.

---

## Tech stack — FIXED (matches the reference) <!-- EDIT THIS to match your demo -->
- Frontend: **React + Vite**, **Tailwind CSS**, **Framer Motion**, **Axios**, **GSAP**, **THREE.js**
- Backend: **Node + Express**, **MongoDB + Mongoose**
- Images: **Cloudinary** (+ **multer** for uploads)

Do not introduce libraries outside this list without an explicit instruction.

## Project structure — FIXED (mirror the reference) <!-- EDIT THIS to match your demo -->
```
template/                         # the clean reference — DO NOT edit during a store 
  client/
    index.html
    src/
      assets/                       # here the images files 
      store.config.js               # ← single source of truth
      components/                   # one component per file, semantic color classes only
        Home/
        AboutUS/
        Products/
        Contact/
        Shared/
        Admin/
      pages/
  vite.config.js
  api.js                          # Here the Backend api that connects the backend to the frontend 
  server/
    src/
      config/                     # cloudinary config, db connection
      models/                     # one Mongoose model per file
      routes/
      controllers/
      seed/seed.js                # ← the catalog lives here
stores/                           # generated stores land here, one folder per store
  <slug>/                         # a full copy of template/ with config + seed swapped
docs/
  briefs/<slug>.md                # the confirmed brief for each store
  reviews/<slug>.md               # QA punch list per store
```

## Conventions
- **One module per file.** One component per file, one model per file, one route group per file.
- **Image handling.** Upload to Cloudinary, store only `{ url, public_id }` in MongoDB — never
  binaries. On record delete, delete the Cloudinary asset by `public_id`.
- **Per-store isolation.** A store build reads `template/` and writes `stores/<slug>/`. It must
  never modify `template/`.
- **Locale default** is Algeria (DZD, fr-DZ) — override per brief when specified.

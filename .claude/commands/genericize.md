---
description: One-time. Strip niche-specific modules from template/ and collapse to a single generic Product, leaving a neutral ecommerce base.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
disable-model-invocation: true
---

`template/` is currently a **phone store**. This converts it into a **neutral ecommerce base**:
the commerce core stays, everything phone-specific is removed, and the several product types
collapse into ONE generic `Product` pipeline. After this runs once, `/store` can build any niche.

Work only inside `template/`. It is a copy — the live store at `client/` + `server/` is never
touched. Do not modify `store.config.js`, `applyTheme.js`, or the Tailwind theme (already
templatized) except their niche-specific fields.

### Step 1 — Inventory & propose a plan
Invoke the **base-extractor** subagent to scan `template/` and classify every model, controller,
route, page, and component as **KEEP** (commerce core, niche-agnostic) or **DROP** (phone-
specific). It must also list all product-type models and choose ONE to promote to the canonical
`Product` (and its category model to `Category`), preferring the most generic (fewest domain
fields).

For this codebase the expected plan is roughly:

**KEEP** — `Categories`, `Order`, `User`, `Contact`, `DeliveryArea` models; `auth`, `order`,
`contact`, `deliveryArea`, `gallery` controllers/routes; `AdminDashboard`, `AdminCategories`,
`AdminOrders`, `AdminUsers`, `AdminContactMessages`, `AdminDeliveryAreas`, `AdminGallery`,
`AdminProducts`; Home `Hero`(rewritten), `BestSellers`, `Categories`, `CTA`, `WhyUs`,
`Services`; Shared `NavBar`, `Footer`, `Cart`, `ProtectedRoute`, `ScrollToTop`; `FinalizeOrder`;
Pages `HomePage`, `ContactPage`, `Login`, `NotFound`, and the cart/checkout pages; `App.jsx`,
`main.jsx`, `index.css`, `applyTheme.js`, `store.config.js`; `utils/cloudinary`, `asyncHandler`.

**DROP** — `Phone`, `PhoneBrands`, `Cases`, `Accessories`, `AccessoriesCategories`,
`RepairRequest`, `SellRequest` models + their controllers/routes; Admin `AdminPhoneBrands`,
`AdminCases`, `AdminAccessories`, `AdminAccessoriesCategories`, `AdminRepairRequests`,
`AdminSellRequests`; Products `PhoneDetails`, `AccessoryDetails`, `CaseDetails`; Pages
`PhonesPage`, `CasesPage`, `AccessoriesPage`, `RepairPage`, and any sell/trade-in page; the
Samsung `.glb` asset and the 3D hero rendering inside `Hero.jsx`.

**Product source** — promote whichever existing product type is most generic (likely
`Accessories` + `AccessoriesCategories`) into `Product` + `Category`. The agent confirms by
reading the models.

Treat the above as the *expected* answer; the agent verifies it against the real files and
adjusts (the Pages list was truncated during inventory, so it must discover the full set).

### Step 2 — Confirm (checkpoint)
Print the final plan: the keep list, the drop list, and which product type becomes `Product`.
**STOP and wait for confirmation or edits before deleting anything.**

### Step 3 — Execute (after confirmation)
The base-extractor then:
- Deletes every DROP file.
- Promotes the chosen product type to `Product`: renames its model/controller/routes/pages/
  details/admin to generic `Product` names and strips domain-specific fields. Final fields:
  `name, slug, description, price, images:[{url,public_id}], category(ref Category), stock,
  featured, timestamps`. Generalizes the chosen category model to `Category`.
- Rewires references so nothing imports a deleted file: `Order` line items → `Product`; `Cart`
  → single `Product` type; `App.jsx` routes + `NavBar` → remove dropped pages and point
  browse/details/category at `Product`; Home sections → `Product`/`Category`.
- Rewrites `Hero.jsx` into a clean responsive hero (headline/sub/CTA + an image slot, using the
  existing semantic theme classes) and removes the `.glb` asset and React Three Fiber imports.
  Leaves R3F/drei in `package.json` but flags them as removable if nothing else uses them.
- Rewrites `server/src/seed/seed.js` to seed generic `Category` + `Product` only.

### Step 4 — Verify
Grep `template/` for `Phone`, `PhoneBrand`, `Cases`, `Accessor`, `Repair`, `Sell`, `.glb`, and
`react-three`. There must be no live imports or references (only optionally-unused deps).
Confirm no file imports a deleted module and all routes resolve. Report the keep/drop summary,
the `Product`/`Category` mapping, and any leftover reference that needs a human decision.

Never leave the base non-compiling. If a removal would break something you cannot safely
rewire, stop and flag it instead of guessing. Do not start a store build.
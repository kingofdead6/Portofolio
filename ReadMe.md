# 🚀 Store Generation Workflow

Follow this sequence exactly to transform the template into a fully customized store.

---

## 1️⃣ Genericize the Template

Run:

```bash
/genericize
```

**Notes:**

* No arguments are required.
* The command operates directly on the `template/` directory.
* It will generate a **keep/drop plan** and then stop.
* Review the proposed changes carefully.
* Confirm the plan or make any necessary adjustments before proceeding.

---

## 2️⃣ Validate the Generic Template

After the genericization process completes, perform a full end-to-end verification.

### Build & Test

Run both the client and server, then manually test the following flow:

```text
Home
  ↓
Products
  ↓
Product Details
  ↓
Cart
  ↓
Checkout
```

### Why This Step Matters

This validation ensures that:

* All template assumptions have been removed correctly.
* Navigation flows remain functional.
* Data models are working as expected.
* The storefront can be safely transformed into a different business domain.

Skipping this step may allow hidden template-specific dependencies to survive and break future store generation.

---

## 3️⃣ Generate a Real Store

Once the generic template has been verified, run:

```bash
/store "Lumière, sells artisan candles, warm earthy palette (terracotta + cream), French"
```

### Expected Outcome

The system will generate a complete candle store with:

* 🕯️ Artisan candle catalog
* 🎨 Warm earthy visual identity

  * Terracotta
  * Cream
* 🇫🇷 French branding and content
* 🛒 Functional storefront experience

### Important

The catalog generation will now work correctly because it will be using a generic:

```ts
Product
```

model rather than a domain-specific:

```ts
Phone
```

model.

This allows the generator to create products for any business category without requiring additional schema changes.

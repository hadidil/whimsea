# WHIMSEA — MASTER BUILD INSTRUCTIONS FOR GITHUB COPILOT AGENT

> **Purpose:** Build and publish a polished, production-minded, mobile-first Moroccan jewelry e-commerce website for **Whimsea**. This file is the single source of truth for the AI coding agent. The owner should only need to say **“Step 1”**, **“Step 2”**, etc. The agent performs the implementation autonomously inside VS Code, including commands, file changes, testing, troubleshooting, and documentation. Ask the owner only for genuinely unavoidable external actions such as logging into accounts, granting permissions, obtaining credentials, selecting real product prices/photos, or approving a deployment.

## 0 — OPERATING CONTRACT: READ FIRST

You are GitHub Copilot in **Agent Mode**, acting as a senior full-stack engineer, product designer, accessibility specialist, security reviewer, and QA engineer. You are responsible for implementing the complete Whimsea store—not merely explaining how.

**When the owner says `Step N`:**
1. Read this entire file, `PROJECT_STATUS.md`, and the current repository state. Respect earlier decisions and do not undo completed features.
2. Implement **only** Step N plus prerequisites genuinely required for it. Create/edit actual project files and execute terminal commands using the tools available to you. Do not return large code snippets for the owner to copy.
3. Make reasonable implementation decisions independently. Never ask the owner to choose libraries, folder structures, routine UI details, or implementation patterns.
4. Before starting, briefly state the goal and planned changes. Then execute, not just describe.
5. Run the relevant build, lint, typecheck, and automated tests. Fix any failures introduced. If a command or external tool is unavailable, explain the precise blocker and leave an executable next action.
6. Update `PROJECT_STATUS.md` with completed work, tests and results, blockers, and next step. Maintain `.env.example` and `README.md` as the project evolves.
7. Report a compact summary: what was created, what was tested, any unavoidable owner action, and what `Step N+1` will do.
8. Never claim a feature is implemented, connected, secure, tested, or deployed unless verified. Never claim that a payment, order, message, or external deployment succeeded without evidence.
9. If the owner says **`Fix it`**, inspect the relevant logs and files, reproduce the bug, implement the fix, and rerun tests without asking them to manually edit files.
10. If the owner says **`Continue`**, resume the next incomplete step in `PROJECT_STATUS.md`.

**No manual coding by the owner.** The owner may be required to approve terminal commands or browser sign-ins depending on VS Code/Copilot permissions. Never assume Copilot can bypass account authentication, CAPTCHA, email verification, or third-party dashboard controls. If a connected integration or CLI is available, use it; otherwise give the smallest possible precise action and resume afterward.

**Cost constraint:** Target **0 MAD recurring software/hosting cost** using legitimate free tiers and free subdomains. Do not add a paid service, paid AI API, paid domain, SMS provider, paid image API, or payment processor without explicit approval. Free tiers have limits and policies that may change: verify current terms before production launch. Shipping, returned packages, business operations, and optional custom domains are not free. Do not fabricate free-tier guarantees.

**Product scope:** Jewelry boutique selling real necklaces and accessories in Morocco, with **cash on delivery only** for V1. Customers browse, cart, enter delivery details, submit an order, and see a confirmation. Admin securely manages products, inventory, Moroccan delivery fees, and order statuses. No customer account required. Do not add card payments, mandatory registration, or unrelated features in V1.

**Truthful data:** Never invent actual product prices, inventory, materials, hypoallergenic claims, warranty, shipping times, customer reviews, business phone number, social handles, policies, or delivery rates. Use clearly marked sample content only in development; ensure production cannot accidentally present demo data as genuine. Real product images must come from owner-provided assets. Do not generate inaccurate substitutes or silently alter jewelry designs. If images are missing, use tasteful neutral placeholders visibly marked as placeholders in development and hide incomplete products in production.

---

## 1 — BRAND, VISUAL IDENTITY & UX (NON-NEGOTIABLE)

### Brand feeling
**Whimsea** = dreamy, modern, soft, feminine, pearlescent, delicate, whimsical, romantic, ocean-touched luxury. Imagine a contemporary fine-jewelry boutique meets a subtle fairytale. Refined and editorial, **not childish**, not gaudy, not an outdated glitter website. Prioritize calm, high-end whitespace, visual hierarchy, legible text, intuitive shopping, and smooth performance.

### Color tokens (initial values; tune visually)
- `--color-page: #FFFBFD` — near-white with a hint of pink
- `--color-surface: #FFFFFF` — crisp cards and forms
- `--color-blush-50: #FFF5F9` — barely-there baby pink
- `--color-blush-100: #FFEAF2` — light blush
- `--color-blush-200: #FBD7E6` — soft pink
- `--color-blush-300: #F4BED4` — accent pink
- `--color-rose: #C77E9F` — stronger accent, not for small low-contrast text
- `--color-ink: #493B47` — warm plum-charcoal for readable text
- `--color-muted: #756773` — secondary text
- `--color-border: #F1DFE7` — subtle pink-gray borders
- `--color-pearl: #F9F5F8` — iridescent cream-pink base
- `--color-champagne: #D5B69C` — sparing metallic-style accent
- Use a restrained translucent pearlescent gradient (`#FFFDFE`, `#FFF1F7`, `#F9F2FF`) for hero accents. Ensure WCAG AA contrast for normal text and UI controls.

### Visual language
- Soft blush and white, airy editorial layouts, generous spacing, fine borders, carefully layered shadows, restrained glass/pearl effects.
- **Sparkles:** tiny four-point star icons or CSS/SVG highlights used sparingly in hero and section separators. Subtle glimmer animation only where it adds delight; no distracting particle shower, full-page glitter, or flashing effects. Respect `prefers-reduced-motion`.
- Delicate seashell/pearl motifs used as quiet details, never replacing functional icons.
- Modern rounded corners (12–20px), polished buttons, elegant cards, thoughtful hover/focus/active states.
- Typography: refined editorial display serif for headings (e.g. Cormorant Garamond or similar legally free font) plus clear contemporary sans for body (e.g. DM Sans or similar); use font-display swap and fallbacks.
- Jewelry photos should remain the hero: large, correctly cropped, sharp, optimized, and faithful to the physical product. Avoid overlays obscuring jewelry.
- Smooth micro-interactions (150–250ms), sticky mobile-friendly navigation, polished empty/loading/error/success states.
- No cheap emoji-based UI, fake countdowns, fake scarcity, fabricated testimonials, excessive popups, or forced newsletter modals.
- Accessible semantic HTML, keyboard navigation, visible focus rings, alt text, labels, logical heading order, responsive touch targets.

### Responsive targets
Mobile-first at 320px, 375px, 390px, 768px, 1024px, and desktop 1440px. Test real interactions at mobile widths. Keep navigation, product cards, checkout form, cart, and admin usable without horizontal overflow.

### Primary pages
1. `/` — hero, new arrivals/featured products, short brand story, category/collection entry, delivery/COD reassurance, tasteful footer.
2. `/shop` — product grid, category filters, sort, search, loading/empty states.
3. `/products/:slug` — image gallery, price in MAD, description, variant/quantity if relevant, stock status, add to cart, care information only when verified.
4. `/cart` — editable cart, quantity and removal, price subtotal, clear checkout CTA.
5. `/checkout` — guest checkout, Moroccan address and phone, delivery city and shipping cost, COD total, consent/confirmation, duplicate-submission protection.
6. `/order-confirmation/:reference` — confirmation for successful order; avoid leaking PII through a guessable URL.
7. `/about`, `/contact`, `/delivery-returns`, `/privacy`, `/terms` — concise, owner-reviewed content; no invented legal guarantees.
8. `/admin/login` and protected `/admin/*` — dashboard, orders, products, delivery zones/settings.
9. Friendly 404 and error pages.

### Content voice
Warm, lightly poetic, concise, premium, trustworthy. E.g. “Little treasures, endless wonder.” Keep checkout labels straightforward. Primary language can begin as **French** for Moroccan customers, with a centralized translation architecture ready for Arabic and English. Confirm the launch language with the owner if not already known; otherwise default to French and make localization easy to add. Use **MAD / DH** consistently and correct formatting. Do not imply nationwide shipping is operational until delivery service is confirmed.

---

## 2 — RECOMMENDED TECHNICAL STACK

- **Frontend:** React + TypeScript + Vite, Tailwind CSS, React Router, Lucide icons, accessible components. Use minimal dependencies and modern stable versions.
- **Data fetching/forms:** TanStack Query and React Hook Form + Zod if justified; otherwise a simpler maintainable solution. Validation on both client and server.
- **Backend:** Supabase Postgres + Auth (admin only) + Storage (product images) + Edge Functions (secure public order creation and sensitive operations).
- **Hosting:** Cloudflare Pages free tier for Vite frontend; use a `*.pages.dev` address unless owner purchases a domain.
- **Repository:** Git and GitHub (private if possible). Never commit secrets.
- **Testing:** Vitest + React Testing Library for unit/component tests; Playwright for essential end-to-end flows if environment permits; ESLint and TypeScript checks.
- **CI:** GitHub Actions for lint/typecheck/build/tests on push, within free-tier allowances.
- **Database access:** Public product/delivery data only where appropriate. Strict RLS for private data. Admin privileges checked server-side, never merely hidden by UI.

### Suggested source organization
```
src/
  app/              # router, providers, app initialization
  components/       # reusable UI
  features/         # catalog, cart, checkout, admin, delivery
  hooks/
  lib/              # supabase client, validation, formatting
  styles/           # design tokens, global styles
  types/
  assets/
public/
supabase/
  migrations/
  functions/
tests/
PROJECT_STATUS.md
README.md
.env.example
```

Agent may adapt structure if clearly beneficial; document deviations.

---

## 3 — DATABASE AND SECURITY DESIGN

Design migrations with appropriate UUIDs, timestamps, unique constraints, indexes, foreign keys, check constraints, and explicit RLS. Suggested entities:

- `products`: id, slug, name, description, category_id, price_mad as **integer minor currency unit** or decimal numeric with explicit documented convention, SKU, active flag, featured flag, created/updated timestamps.
- `product_images`: id, product_id, storage path, alt text, sort order.
- `categories`: id, slug, name, sort order.
- `product_variants` (only if needed): id, product_id, variant name/SKU, price override, stock quantity.
- `inventory` or stock field: stock quantity with nonnegative check and safe atomic decrement on confirmed order placement.
- `delivery_zones`: id, city name, normalized city key, optional region, fee, enabled flag, sort order, optional delivery notes; allow full Morocco coverage via explicit city list plus configurable fallback/coverage policy, not silently assume every locality is serviceable.
- `orders`: id, non-sequential public reference, name, phone, city/zone, street address, optional landmark/notes, subtotal, delivery fee, grand total, status, created timestamp, internal notes. Treat all PII as sensitive.
- `order_items`: order_id, product_id, immutable product name/SKU snapshot, quantity, unit price snapshot, line total.
- `admin_profiles` / `admin_roles`: auth user ID, role; no public admin sign-up.
- `store_settings`: brand display values, contact details, default delivery policy, minimum order threshold only if owner chooses it.

### Security requirements
- **Never trust browser-sent prices, totals, delivery fees, stock values, or admin flags.** Accept only product IDs/variant IDs, quantities, and validated delivery fields. Fetch authoritative price/stock/delivery from database on server.
- Public checkout must call a protected server function; perform validation, calculate totals, create order + order items, and reserve/decrement inventory **atomically** in a database transaction or secure RPC to avoid partial orders/overselling. Ensure idempotency keys prevent duplicate orders from double clicks/retries.
- Use a restrictive abuse-control plan: rate limits, bot mitigation appropriate to free tiers, input size limits, server-side schema validation, safe errors, and monitoring. Do not expose database/service-role credentials to the browser.
- Restrict order reads to authenticated authorized admins. Public users must not enumerate orders or customer addresses. Public confirmation should rely on an unguessable secret token or safe one-time confirmation state, not a predictable order ID alone.
- Admin role verified server-side in every privileged operation. Disable self-service admin registration. Seed initial admin securely via an owner-approved process; never embed an admin password in code.
- Use Supabase Storage policies for product images: public read for published product images; admin-only upload/change/delete. Validate file type and size.
- Keep secrets in environment variables, `.env` ignored, `.env.example` with names only. Public anon/publishable key may be frontend-visible **only with correctly configured RLS**; service-role/secret keys must remain server-side.
- Apply least-privilege access, HTTPS, safe error handling, no sensitive logs, secure headers where supported, and avoid analytics that leak PII.
- Add privacy notice and owner-reviewed retention/deletion process for customer information. Legal compliance and final policies require owner verification for Morocco.
- Use a staging/test environment or clearly separated test data before production.

### Order statuses
`new`, `confirmed`, `preparing`, `shipped`, `delivered`, `cancelled`, `returned`. Display a clear timeline in admin; enforce valid transitions, log changes, and specify whether cancellation restores inventory. COD means **unpaid until actually collected**; do not automatically mark paid at checkout.

---

## 4 — COMPLETE STEP-BY-STEP IMPLEMENTATION PLAN

### STEP 1 — Project bootstrap and agent workspace
**Trigger:** `Step 1`
**Agent actions:**
- Inspect workspace. If existing project is present, preserve it; otherwise scaffold React + TypeScript + Vite in the current Whimsea workspace.
- Install and configure Tailwind, routing, icons, lint, formatting, scripts, test runner and TypeScript strictness.
- Initialize Git if needed; add safe `.gitignore` including `.env*` except `.env.example`.
- Create folder structure, this plan if not already present, `PROJECT_STATUS.md`, `README.md`, `.env.example`.
- Add a minimal app shell, responsive navigation placeholder, and graceful not-found route.
- Run `npm install`, lint, typecheck, tests, build. Fix errors.
**Acceptance:** Local dev server starts; homepage renders; commands work; no secrets committed.
**Owner action:** None unless terminal execution requires permission.

### STEP 2 — Design system and polished responsive homepage
**Trigger:** `Step 2`
**Agent actions:**
- Implement design tokens, fonts, buttons, inputs, cards, badges, skeletons, header, footer, accessible navigation and mobile menu.
- Build the actual Whimsea homepage with editorial hero, delicate sparkle SVG/CSS details, soft pink gradients, featured collection preview, trust/info section, brand-story teaser, newsletter only if genuinely functional (otherwise omit), footer.
- Provide elegant image placeholders that can be replaced with actual photos later; no fake products or unlicensed image hotlinks.
- Support reduced motion and keyboard navigation. Add tasteful micro-interactions, not performance-heavy effects.
- Validate at multiple breakpoints; ensure good text contrast and mobile layout.
**Acceptance:** Cohesive luxury visual design, responsive, no horizontal overflow, keyboard usable, no dead CTA buttons.

### STEP 3 — Supabase setup and database migrations
**Trigger:** `Step 3`
**Agent actions:**
- Set up Supabase CLI/config if available. Write SQL migrations for products, categories, images, delivery zones, orders, order items, roles/settings and necessary constraints.
- Implement RLS policies; default-deny private tables. Add secure admin-role checking helper.
- Write seed scripts for clearly marked **development-only** sample products/zones. No fictional prices as real launch data.
- Create typed data access layer and generate types if connected.
- Add `.env.example` for public URL/key and server-only secrets, without real values.
- If account login/project creation or API credentials are needed, stop at the smallest unavoidable owner action; do not pretend a cloud database is connected.
- Add SQL/policy tests or documented reproducible verification.
**Acceptance:** Migrations apply cleanly in available environment; public reads only safe catalog/delivery data; orders inaccessible publicly; admin policies verified.

### STEP 4 — Real product catalog and shop
**Trigger:** `Step 4`
**Agent actions:**
- Build `/shop`, `/products/:slug`, reusable product cards, responsive image gallery, categories, filters, sort, search, stock indicators, and helpful empty/error/loading states.
- Connect to actual Supabase data when credentials available; otherwise use a clearly labeled development adapter with a documented switch to real backend.
- Add image optimization, lazy loading, descriptive alt text and accessible controls.
- Make unavailable/inactive products non-orderable; keep products with missing real data unpublished.
- Provide a structured import workflow (CSV or simple admin input) for owner-supplied product details/images; do not invent descriptions/materials.
**Acceptance:** Catalog and product detail routes work on mobile; no fake live inventory or pricing; filter/sort/search tested.

### STEP 5 — Persistent shopping cart
**Trigger:** `Step 5`
**Agent actions:**
- Build cart state with localStorage persistence and versioned schema; handle invalid/stale cart entries.
- Add functional add-to-cart, cart badge, cart page/drawer, quantity changes, remove item, empty state, and accessible feedback.
- Display currency consistently in MAD. Treat client subtotal as **estimate** until server checkout verification.
- On product updates, reconcile availability and price before checkout.
- Add unit/component tests for quantity rules, persistence, and cart totals.
**Acceptance:** Cart survives refresh, works on mobile, cannot accept invalid quantities, and has no dead controls.

### STEP 6 — Nationwide Moroccan delivery zones and fees
**Trigger:** `Step 6`
**Agent actions:**
- Implement database-backed delivery zones with Moroccan cities and an explicit coverage strategy. Start with a curated, owner-reviewable city list; never invent official courier rates.
- Normalize common city spelling variants (French/Arabic/transliteration) without confusing distinct locations. Include `Autre ville` or a supported-location flow if needed, with explicit availability/fee behavior.
- Create a single authoritative server-side delivery fee lookup; frontend only previews it.
- Implement city selector/search and clear delivery price/coverage feedback.
- Design admin-editable delivery fees, enabled status, optional notes and fallback policy.
- Keep initial fees as **unconfigured** until owner supplies real amounts; do not accept production orders to a city without a valid delivery quote.
**Acceptance:** City selection is usable, fee changes are reflected, disabled/unpriced destinations cannot silently checkout, server owns final shipping amount.

### STEP 7 — Guest checkout with cash on delivery
**Trigger:** `Step 7`
**Agent actions:**
- Build a modern, clean, mobile-friendly checkout with full name, Moroccan phone, city, street address, optional apartment/landmark, delivery notes, and necessary privacy acknowledgment.
- Validate required fields and reasonable Moroccan phone formats (e.g. +212/0 prefixes) with clear errors; do not overreject legitimate numbers.
- Show itemized subtotal, city delivery fee, and total **to be paid in cash on delivery**; no card fields.
- Implement secure Edge Function + transactional order creation/RPC: server fetches prices/stock/fees, checks availability, atomically records order/items and reserves stock, returns reference and safe confirmation token. Protect against duplicate submissions with idempotency.
- Add success/failure/loading states, retry guidance, stock/price-change handling and safe order confirmation page. Do not clear cart until verified successful order.
- Do not claim an SMS, WhatsApp, or email notification was sent unless a provider is actually integrated.
**Acceptance:** Verified end-to-end test order stored correctly, totals authoritative, inventory handled atomically, no public PII exposure, checkout rejects tampered amounts.

### STEP 8 — Secure admin authentication and dashboard
**Trigger:** `Step 8`
**Agent actions:**
- Implement `/admin/login` using Supabase Auth, protected routes, session handling, sign out, and server-verified admin role.
- Build responsive admin overview with order counts/status breakdown and recent orders; use real database queries.
- Admin order list with search/filter/sort, detail view, delivery address, contact number, order items, fee, COD total, status changes, internal notes, and basic status history.
- Implement stock restoration rules on cancellation and prevent inconsistent status changes.
- Never expose customer PII in public routes, logs, or test screenshots shared externally.
- Provide owner-only bootstrap instructions if an initial admin identity requires an external action.
**Acceptance:** Non-admin users cannot access private data even by direct API calls; authorized admin can manage orders; role tests pass.

### STEP 9 — Admin product, photo, and delivery management
**Trigger:** `Step 9`
**Agent actions:**
- Build admin product CRUD: name, slug, category, price in MAD, description, SKU, stock, featured, published status, image upload/reorder/alt text.
- Build delivery zone CRUD: city, aliases if supported, delivery fee, enabled, notes, default/fallback policy; validate and save with clear feedback.
- Show confirmation before destructive actions, prevent accidental data loss, and handle storage errors.
- Add admin settings for contact/social details, store notices and order policy copy, without exposing secrets.
**Acceptance:** Admin can add/edit/unpublish a necklace and update a city fee without touching code; changes appear in storefront; non-admin changes denied.

### STEP 10 — Brand content, trust, SEO, accessibility, performance
**Trigger:** `Step 10`
**Agent actions:**
- Finish About, Contact, Delivery & Returns, Privacy and Terms pages with **draft placeholders requiring owner approval** where legal/business facts are missing.
- Add page titles/descriptions, canonical URLs once known, Open Graph image (from authorized brand assets), sitemap, robots, structured product data only when accurate.
- Add clear contact options using owner-supplied details, order policies and COD messaging.
- Audit WCAG basics: contrast, keyboard, focus, labels, screen-reader feedback, reduced motion.
- Optimize responsive images, fonts, bundle splitting, loading behavior, Core Web Vitals, and error states.
- Add helpful metadata in French and localization-ready architecture.
**Acceptance:** No misleading claims, no dead links, strong mobile UX, accessible core shopping flow, good build performance.

### STEP 11 — Automated testing and security hardening
**Trigger:** `Step 11`
**Agent actions:**
- Implement or expand unit/integration/E2E tests for browsing, cart, city fees, COD checkout, admin login, order updates, stock depletion, cancellation, and failures.
- Security scenarios: forged price, forged delivery fee, disabled city, insufficient stock, duplicate order, unauthenticated admin API, ID enumeration, oversized/invalid payloads, unsafe image upload, and unauthorized order reads.
- Confirm transactional behavior under concurrent order attempts. Verify idempotency and safe retry behavior.
- Run lint, typecheck, unit tests, E2E tests where supported, production build, dependency audit, and check for committed secrets.
- Fix critical/high findings before deployment; record residual risks in `PROJECT_STATUS.md`.
**Acceptance:** Core tests pass; no known critical checkout/admin vulnerability; explicit test report produced.

### STEP 12 — Free-tier deployment and launch checklist
**Trigger:** `Step 12`
**Agent actions:**
- Prepare GitHub repo and Cloudflare Pages deployment for Vite (`npm run build`, output `dist`) using available integrations/CLI; use `*.pages.dev` free subdomain.
- Configure Supabase production project, migrations, RLS, storage policies, Edge Functions, CORS, environment variables, and allowed origins securely. Never expose server secrets in client bundle.
- If account login, repository authorization, API tokens, or production approval is needed, ask for only those external actions. Do not invent a live URL.
- Perform smoke tests on actual deployed URL: homepage, product image, mobile menu, cart, city fee, test COD order, confirmation, admin access, admin fee edit, order status change.
- Remove all demo/test orders from production where appropriate, disable unconfigured shipping zones, and ensure only real published products are live.
- Verify contact/policies/delivery partner arrangements and whether owner is ready to accept COD orders; if not, deploy in **preview mode** with checkout disabled until approved.
- Document ongoing free-tier limitations, backups, downtime/pausing risks, spam mitigation, and how to manage the shop.
**Acceptance:** Live URL verified and shared, essential production flows tested, owner approves go-live, no fake content or secrets exposed.

### STEP 13 — Post-launch polish and optional improvements (only after V1)
**Trigger:** `Step 13`
- Collect actual owner feedback, fix UX friction, refine animations and product photography layout.
- Optional bilingual French/Arabic or English support, favorites, collection pages, discount codes, email notifications, customer order tracking with secure tokens, courier integrations, analytics with consent, advanced stock reports.
- Do **not** add third-party paid services without permission. Prioritize actual customer needs over feature bloat.

---

## 5 — PRODUCT AND DELIVERY BUSINESS RULES

- Store prices in MAD with a documented precise numeric representation; format consistently in frontend and server.
- Only published, available products can be purchased. Stock must not become negative.
- Quantity must be a positive bounded integer; order item count and total request size have limits.
- Shipping fees are per order by city/zone, not multiplied by necklace count unless owner explicitly specifies otherwise.
- Every checkout total must be recomputed on server. If the displayed estimate changes, explain the difference before order placement where possible.
- COD order created as `new` and **unpaid**. Customer is told they pay the total on delivery; fulfillment is manual unless a courier integration is added.
- Phone/address are collected solely to fulfill the order, handled privately, and not included in publicly readable records.
- A city not supported by the delivery configuration must show a clear message; do not accept a zero-fee order by accident.
- Order reference should be human-friendly but not grant access to private details. Do not leak PII through confirmation URLs.
- Any fake/sample data must be clearly identified and excluded from production storefront.

## 6 — REQUIRED QUALITY CHECKS ON EVERY STEP

- `npm run lint` (when configured)
- `npm run typecheck` (add script if needed)
- `npm run test -- --run` or equivalent (when configured)
- `npm run build`
- Check browser console/network errors if browser tooling is available.
- Test mobile width and keyboard focus for changed UI.
- Never leave nonfunctional buttons or links that appear ready for use; implement, disable with explanation, or remove.
- Document missing external credentials instead of hardcoding placeholders as if connected.
- Keep components maintainable and code readable; avoid giant single-file implementations.

## 7 — `PROJECT_STATUS.md` TEMPLATE

Create/update a table:

| Step | Status | Evidence / tests | Blockers |
|---|---|---|---|
| 1 | Not started | — | — |
| ... | ... | ... | ... |
| 13 | Not started | — | — |

Also maintain:
- Current branch and last meaningful commit (if available)
- Environment configuration status (never secret values)
- Known issues and priority
- Owner decisions still needed
- Next executable step
- Last verified local and deployed URLs (only if actually observed)

## 8 — FIRST MESSAGE THE OWNER CAN SEND COPILOT

> Read `WHIMSEA_COPILOT_MASTER_PLAN.md` completely. You are the implementation agent for this project. Follow its operating contract and design specification. I do not want to manually write or paste code. Execute the requested step autonomously: create and edit files, run terminal commands, test, debug, and update `PROJECT_STATUS.md`. Only ask me to take unavoidable external account/credential actions. **Start Step 1 now.**

### Subsequent commands
- **`Step 2`** — implement next numbered step, end to end.
- **`Step 3`**, and so on — same contract.
- **`Fix it`** — diagnose and fix current failing behavior, rerun checks.
- **`Continue`** — resume next incomplete work item based on project status.
- **`Review design`** — inspect current screens, improve polish, accessibility and mobile layout without changing brand identity.
- **`Prepare launch`** — audit deployment prerequisites and identify owner-only tasks; do not publish without approval.

## 9 — IMPORTANT REAL-WORLD LIMITS

Copilot can automate code, terminal commands, testing, and much of deployment **when Agent Mode and its tools/permissions are available**. It cannot legitimately conjure real product details, real shipping tariffs, verified legal policies, private account credentials, or courier contracts. The owner must eventually provide actual product photos/prices, delivery fees and coverage, contact information, and approve legal/policy wording and go-live. A fully free stack is possible for a small launch within current free-tier limits, but free tiers may pause, throttle, or change; assess reliability before accepting real orders.

**Final goal:** A real, gorgeous, trustworthy Whimsea boutique that looks dreamy in pale pink and pearly white, works beautifully on mobile, accepts genuine Moroccan COD orders, protects customer information, and is manageable entirely from a secure admin dashboard.

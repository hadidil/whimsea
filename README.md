# Whimsea

Whimsea is a mobile-first Moroccan jewelry boutique, built with React,
TypeScript, Vite, Tailwind CSS, and React Router.

## Local development

```bash
npm install
npm run dev
```

The current shell includes a responsive navigation, a polished French-language
landing page, a typed catalog adapter, a responsive shop with search, category
filters, sorting, loading/error/empty states, and placeholder-safe product
detail pages, and a protected admin catalogue manager. When Supabase is not configured, clearly labeled demo products
are shown and live checkout remains unavailable. The local cart is
functional for development previews, persists a versioned state in
`localStorage`, caps quantities by displayed stock, and labels its subtotal as
an estimate until server-side checkout verification is implemented. Delivery
zones are loaded only when Supabase exposes enabled zones with real configured
fees; otherwise the cart and checkout clearly report that delivery is not
configured. When configured, `/checkout` validates guest details locally and
submits only product IDs and quantities to the authoritative idempotent COD
RPC; the cart is cleared only after a confirmed response.

The Supabase foundation is prepared in `supabase/migrations` with strict RLS,
admin role policies, an authoritative idempotent COD order function, and a
transactional admin order-status workflow with cancellation stock restoration.
Supabase credentials are intentionally not included; see
`supabase/README.md` for the owner setup step.

Set `VITE_SITE_URL` to the approved production origin during a production
build to generate `public/sitemap.xml`. The project intentionally does not
invent a domain or social profile. `public/robots.txt` excludes private and
order-specific routes from crawlers.

The private admin surfaces are `/admin/login` and `/admin`. They remain
unavailable without Supabase configuration. The first owner must be created
through Supabase Auth and explicitly added to `admin_profiles`; no service-role
secret is used in the client. Authenticated admins manage products, delivery
zones, and product images at `/admin/catalog`; images use the `product-images`
Storage bucket and retain editable alt text and ordering.

## Cloudflare Pages deployment

The Vite production output is `dist`. For a Cloudflare Pages project connected
to the GitHub repository, use:

- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `24` (or the current supported LTS configured by the owner)
- `VITE_SITE_URL`: the approved HTTPS production origin
- `VITE_SUPABASE_URL`: the production Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: the production Supabase publishable/anon key

Only the publishable Supabase key belongs in Pages environment variables. Never
add a service-role key. The repository includes response headers in
`public/_headers`. Wrangler's `single-page-application` asset handling provides
the SPA fallback; do not add a catch-all `public/_redirects` rule when deploying
with `wrangler deploy`, because Workers rejects that rule as an infinite loop.

Until Supabase, owner-approved products, delivery fees, legal/contact details,
and COD operations are configured, deploy as a preview. The app intentionally
keeps live checkout unavailable when the required public configuration is
missing.

### Launch checklist

1. Create or connect the GitHub repository and deploy the `dist` output to a
   `*.pages.dev` preview.
2. Create the production Supabase project, apply every migration in
   `supabase/migrations`, configure the `product-images` bucket, and add the
   approved site origin to Supabase CORS.
3. Configure the three `VITE_*` variables in Pages for preview and production
   separately. Redeploy after setting `VITE_SITE_URL` so the sitemap is built.
4. Create the owner in Supabase Auth, add the user UUID to `admin_profiles`, and
   sign in at `/admin/login`.
5. Add only real published products, approved images, enabled delivery zones,
   fees, contact details, and policy copy. Disable every unconfigured zone.
6. Smoke-test the deployed origin: homepage, product image, mobile navigation,
   cart, city fee, test COD order, confirmation, admin access, fee editing, and
   order status changes.
7. Remove test orders and approve go-live only after the owner confirms the
   delivery partner and readiness to accept COD orders.

Cloudflare Pages and Supabase free tiers can pause, throttle, or limit usage.
Keep database backups and review order access regularly; do not treat a free
tier as a backup or uptime guarantee.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```

`npm run format:check` verifies formatting and `npm run format` applies it.

## Environment

Copy `.env.example` to `.env.local` only when a later step connects Supabase.
Never commit `.env` or `.env.local` files.

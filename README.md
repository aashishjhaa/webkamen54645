# WebKamen

A responsive independent digital studio website for **web.kamen.in**. Next.js App Router, React, TypeScript, Three.js, and PostgreSQL with Drizzle. All artwork and fonts are local; the site does not depend on a remote image or font service.

## Run locally

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The four public routes are `/`, `/services`, `/about`, and `/contact`. A build needs no email credentials. Use `npm run build` for production and `npm run start` to serve that build. Node 22 is recommended.

## Importing into Vercel (checklist)

1. **Import the whole repository**, especially `assets/encoded/` (base64 text) and the SVG artwork in `public/`. Binary images and fonts are rebuilt automatically by `next.config.ts`; they do not need to be committed. If you upload files manually, include everything under `assets/encoded/`.
2. Framework preset **Next.js**, root directory = the repository root, build command `next build`, no output-directory override. Use Node 20.9+ (Vercel's default is fine).
3. No environment variables are needed to build or to render the site identically. `CONTACT_*`, `RESEND_API_KEY`, and `DATABASE_URL` only enable form delivery (see below).
4. Typography is bundled with `next/font/local`; no request goes to Google Fonts. All UI glyphs live inside Poppins, and the asterisk mark is an SVG, so no device substitutes a system font.
5. The WebGL sculpture frames exactly like its static poster at every screen shape (hero "contain", About "cover"), so the poster-to-3D swap does not move or restyle the artwork.
6. `npm run build` also type-checks. If a deployment ever differs from your local build, compare the commit SHA first, then hard-refresh to clear the browser's cached CSS.

## Contact delivery on Vercel

Import the repository using Vercel’s standard **Next.js** preset, with the repository root as the project directory. Configure the following **server-only** environment variables in Settings → Environment Variables, then redeploy. Never prefix these values with `NEXT_PUBLIC_`.

| Variable | Purpose |
|---|---|
| `CONTACT_TO_EMAIL` | The exact private destination specified by the site owner in the build brief. One address only. An address fingerprint on the server rejects any other destination. |
| `CONTACT_FROM_EMAIL` | A sender on your verified domain, for example `WebKamen <studio@your-domain.example>`. This is not the visitor’s email. |
| `RESEND_API_KEY` | A Resend API key with sending permission for the verified domain. |
| `DATABASE_URL` | Recommended: pooled PostgreSQL connection string for shared throttling and duplicate prevention across function instances. |

In Resend, add a sending domain, publish the exact DNS records shown in its dashboard (DKIM and the required SPF/return-path records), and wait for **Verified**. Use a sender on that domain. The Node.js `POST /api/contact` route sends plain-text email to the single configured owner destination, with the validated visitor address as `reply_to`. A successful provider API response with an email ID is required before the interface confirms acceptance. Provider acceptance is not a guarantee of inbox arrival.

**Shared database guards:** set `DATABASE_URL` in the terminal environment or `.env`, then run `npx drizzle-kit push`. Only HMAC fingerprints, timestamps, and delivery state are stored; no message bodies, names, email addresses, or raw IPs. Old records are pruned after 24 hours on subsequent inquiries. With a configured database, an unavailable or uninitialized database fails closed. Without a database, the route uses bounded per-instance throttling and Resend’s global idempotency keys. Use PostgreSQL for production-wide limits.

Validation includes a streamed 32 KiB body limit, input length limits, email and service validation, a honeypot, basic timing and origin checks, a five-inquiry/15-minute rate limit, concurrency protection, and 24-hour duplicate suppression. The API never echoes provider errors or destination details. Drafts stay in session storage until the provider accepts the inquiry. Missing settings or a failed send leaves the draft intact and offers the exact WhatsApp handoff.

**Final owner checks:** submit one clearly labeled test through the deployed form, confirm its receipt in the actual destination inbox, check Reply-To, and review Resend’s delivery event. No real email should be sent during development tests. Keep preview deployments unconfigured for email unless deliberately testing delivery.

## Custom domain

Add `web.kamen.in` under Vercel → Project → Settings → Domains. Apply the DNS record Vercel displays for that subdomain; do not replace unrelated root-domain or email records. Wait for DNS verification and TLS issuance, then confirm all four direct URLs. The site includes canonical URLs, route-specific metadata, a social preview, a WK favicon, robots.txt, and sitemap.xml. Publishing or changing the live domain is left to its owner.

## Art and interactions

- `src/lib/mark-points.json`: the two outlines traced from the supplied WK artwork. Shared by the header/footer SVGs and shallow beveled Three.js extrusions.
- `src/lib/studio-scene.ts`: procedural light tent, satin finish, contact and cast shadows, two camera compositions. No remote models or texture dependencies.
- `src/components/Sculpture.tsx`: client-only renderer behind matching static WebP posters. Click or use **Turn the mark**. Desktop pointer movement is restrained; touch panning and zoom stay native. Rendering stops when idle, offscreen, or hidden. GPU resources are disposed on unmount. Reduced motion and unavailable WebGL use the poster.
- `public/images`: the optimized fictional Arc lamp image, both WK posters, contour artwork, subtle grain, and social preview (restored from `assets/encoded/`). The unoptimized lamp source JPEG is a local-only file used by the artwork script; it is not needed to build or deploy. The lamp project is a demonstration, not a client claim.
- **Encoded assets (important for GitHub → Vercel):** every binary (the three WebP posters/photos, the social JPEG, the grain PNG, and the five Poppins `.woff2` files) also exists as base64 text in `assets/encoded/`. `next.config.ts` restores the real files before compilation, so a repository that carries only text files still builds and renders identically. Keep `assets/encoded/` in version control; the restored binaries themselves are git-ignored.
- `src/fonts` + `src/app/fonts.ts`: Poppins (weights 300–700, Latin) restored from `assets/encoded` and loaded with `next/font/local`. Next.js hashes, preloads, and caches the files and generates a size-matched fallback face, so nothing is fetched from Google and Vercel renders the same type as a local build. Every glyph in the UI is inside Poppins; the asterisk mark is SVG.
- `scripts/render-assets.mjs`: regenerate the static artwork from the actual live geometry. Run `npx playwright install --with-deps chromium`, then `node scripts/render-assets.mjs`. Not required to build or deploy.

The inquiry walkthrough has no timer. Its three keyboard-operable tabs and previous/next buttons lead through the ad, the product page, and a human-reviewed draft. The sample quote button opens step three. The editable review dialog never sends a message.

## Verification

```sh
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```

Browser and delivery checks are documented in `TESTING.md`. The live WhatsApp and social anchors open external services in a new tab. The prefilled WhatsApp message is never sent automatically.

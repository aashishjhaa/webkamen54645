# Verification

The repository includes reproducible checks for layout, navigation, scene behavior, form states, and backend delivery. Results below are recorded after running the checks, not inferred from implementation.

## Reproduce

1. Install dependencies with `npm ci` and Chromium with `npx playwright install --with-deps chromium`.
2. Set up PostgreSQL and run `npx drizzle-kit push` with `DATABASE_URL` in the environment or `.env`.
3. Run `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, and `npm run build`.
4. Serve the production build, with email delivery **unconfigured**, and run `TEST_BASE_URL=http://127.0.0.1:3000 node scripts/verify-ui.mjs`.
5. For the backend contract checks, provide the owner-designated destination privately as `WEBKAMEN_TEST_RECIPIENT` and run `node scripts/verify-delivery.mjs`. This harness uses mock provider functions only. No transport redirection or test-success switch is exposed through the public endpoint.

UI evidence is written to `.artifacts/screens/` and `.artifacts/ui-results.json`. The browser checks cover 360×800, 390×844, 768×1024, 1024×768, 1440×900, and 844×390 phone landscape. These are Chromium emulations, not physical-device claims.

## Recorded results

| Check | Result |
|---|---|
| Type generation / TypeScript / production compilation | Passed. All four routes and both API endpoints built successfully. |
| Managed production start and `/api/health` | Passed with the local PostgreSQL instance. |
| Direct route and responsive checks | All 24 route/viewport combinations returned 200 with one primary heading, correct canonicals, and no horizontal overflow. Full-page screenshots were captured and visually inspected. |
| Public links | Exactly one 56 px WhatsApp bubble on each route, exact Instagram/Facebook URLs, and the correct decoded WhatsApp message. No tested form field, navigation link, or primary button was obscured. |
| Sculpture | Live WebGL on Home and About. A keyboard-initiated turn changed the actual scene pixels and returned to rest. Touch tapping worked in mobile emulation. |
| Static presentation | Reduced motion did not initialize WebGL. Forced WebGL unavailability preserved the poster, interactive walkthrough, and chat link. |
| Inquiry example | Keyboard tabs, both navigation directions, trade quote → structured brief, editable draft, and reviewed state all passed. |
| Contact | All three service query parameters preselected correctly. Actual unconfigured API returned 503. The failed form retained its draft across reload. Mocked acceptance showed a pending state, disabled duplicate clicks, confirmed acceptance, and cleared the draft. |
| Delivery handler and database | Mock provider tests verified a single fixed recipient, Reply-To, complete plain-text details, input validation, payload cap, honeypot and origin checks, provider rejection, missing acceptance IDs, simultaneous duplicates, wrong destination, missing credentials, and shared rate limits. No actual email was sent. |
| Privacy | The designated recipient address was absent from all public assets, all client bundles, and server-rendered HTML of all four routes. |
| WhatsApp web handoff | Desktop and Android mobile user agents both received HTTP 200 after the wa.me redirect, retaining the exact phone number and composer text. No message was sent. |
| Browser runtime | No uncaught page errors during the checks. |

## External boundaries

No live Vercel deployment, domain change, actual inbox receipt, authenticated social session, or native WhatsApp launch is claimed. The exact external destinations and decoded WhatsApp composer text are verified locally. The owner must verify sender DNS, production delivery and receipt, and native handoff on their own phone or desktop.

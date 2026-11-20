# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Thai corporate marketing teams producing large volumes of ad images and video.
- Agencies and production houses running several brands, one project per client.
- Event organizers using Photo Event (kiosk: guest photo → generate → print card or QR).
- Individual creators and the general public (PERSONAL organizations).

## Product Purpose
AI Cave is an AI image, video and audio generation platform for organizations. A customer is an
Organization holding a plan, credit and members; work happens inside Projects with their own members and credit quota.

## Positioning
Governed AI production for teams: credit flows Org → Project → Member, role and group permissions,
a shared Brand Kit and shared Templates keep every generation on budget and on brand.
Neighbouring tools (Midjourney, Runway, Canva AI) sell the generator; AI Cave sells control over a team using it.

## Operating Context
Generation flow: fill a form → credit reserved → queued → BytePlus model → saved to the project Library → credit charged (refunded on failure) → realtime update.
Public pages: home, features, pricing, community feed, Photo Event share page, sign up / login (Keycloak SSO incl. Google).

## Capabilities and Constraints
- Generate: Image (Seedream 4.5, Seedream 5.0 Pro), Video (Seedance 1.0 Pro, 2.0, 2.0 Mini, 2.5), Audio (SeedAudio 1), OmniHuman 1.5 (photo + voice → talking video), DreamActor M2.0 (motion transfer from a reference video).
- Creative tools: Workflow (multi-step canvas, output of one block feeds the next), Image Editor and Video Editor, Templates (Prompt Guide), AI Assistant (prompt help, image → prompt).
- Brand and team: Brand Kit (Logo, Color, Typography, Brand voice, CI prompt + negative prompt), Projects, three-level credit, roles, group permissions, invites and bulk add, usage Dashboard.
- Store, share, events: Library, All Activity, Public Social (post to Facebook, Instagram, TikTok, YouTube after approval), Photo Event.
- Model list lives in the database; admins add or disable models without a deploy.
- Photo Event kiosk has per-event settings for orientation, screen size and UI scale; UI changes elsewhere must leave them working.
- Billing exists but is infrastructure, not a selling point; do not feature it on marketing pages.
- Public Social is presented as available, never "coming soon".
- AI Cave Community is a separate website; it is the only thing marketed as "coming soon" until its link exists.

## Brand Commitments
- Name: AI Cave. Keep the logo and its indigo/cyan colors.
- Marketing pages use the same color system and light/dark mode as the signed-in app (`app/theme/themeConfig.ts`).
- Copy language: Thai and English, switchable (TH default); every public string lives in `app/home/i18n/copy.ts`.
- Primary action: request a demo (`/contact-sale?topic=…`), the same button in every spot; secondary: start for free (sign up).
- Marketing copy names processes (Generate Image, Generate Video), never models: models change in the database without a deploy.
- The admin Announcement popup stays on public pages (may be restyled, never removed).

## Evidence on Hand
- Showcase images and videos on BytePlus TOS (`ai-cave.tos-ap-southeast-3.bytepluses.com/mockup/...`) and `public/images/` — use only these.
- No customer logos, testimonials or usage numbers exist. Do not fabricate any.
- Confirmed by the owner (2026-11-18) for marketing: 50–70%* lower production cost on everyday graphics, short videos and mockups (footnoted to the AI Cave product information document); every asset is approved before publishing; organization data and prompts are never used to train public models.

## Product Principles
1. Show the work: real generated media carries the argument, not adjectives.
2. Control is the differentiator: every feature story ends in who can spend, approve or reuse.
3. One account, one look: the public site and the app feel like the same product.
4. Honest claims: only shipped capabilities and real assets.

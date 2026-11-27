---
name: AI Cave
description: Governed AI image, video and audio production for teams, in one navy-night dark-first look shared by the app and the public site.
colors:
  # Brand (both modes)
  cave-indigo: "#6A61EE"
  cave-indigo-deep: "#4B49A1"
  cave-indigo-mist: "#E3E2FA"
  signal-mint: "#0FEAB6"
  ember-orange: "#FF8F00"
  go-green: "#22C55E"
  alarm-red: "#FF3C38"
  actor-blue: "#0D4DE5"
  # Dark mode "Night Indigo" (default)
  night-floor: "#0C0D24"
  night-header: "#0A0B1E"
  night-sider: "#111230"
  night-sider-line: "#212357"
  night-wall: "#15163A"
  night-ledge: "#1D1F4E"
  night-seam: "#27295E"
  night-control-line: "#34377A"
  night-rail: "#23255C"
  night-mist: "#A9ACD6"
  night-muted: "#7D7FA4"
  night-chalk: "#EEEFFB"
  paper-white: "#FFFFFF"
  form-panel-dark: "#1A1B44"
  form-field-dark: "#23255C"
  # Dark-mode accents from the reference
  tile-violet: "#867DFF"
  tile-blue: "#6086FF"
  avatar-blue: "#3F6DEB"
  avatar-pink: "#C93A80"
  # Light mode "Lavender haze"
  lavender-canvas: "#F6F5FC"
  lavender-sider: "#FBFAFF"
  lavender-raised: "#F3F1FD"
  lavender-field: "#EFEDFA"
  lavender-line: "#E6E3F5"
  lavender-control-line: "#D6D1EE"
  lavender-placeholder: "#A19EBB"
  ink-violet: "#1E1B3A"
  ink-violet-soft: "#5B5876"
  lavender-indigo: "#6D5DF5"
  lavender-indigo-text: "#5B4BE0"
  lavender-indigo-wash: "#EFEBFF"
  # Light-mode readable text tones for status and type colors (pass 4.5:1)
  mint-text-light: "#08705C"
  green-text-light: "#15703A"
  orange-text-light: "#9A4A0B"
  red-text-light: "#B42318"
  video-text-dark: "#A29EF2"
  actor-text-dark: "#7FA2FF"
  mint-text-dark: "#4FD6C8"
  error-text-dark: "#F2848E"
  # Landing-only
  mint-gradient-light: "#078A6D"
  warn-dark: "#F5A524"
  warn-light: "#B76E00"
typography:
  app-page-title:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "30px"
    fontWeight: 600
  app-heading:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "24px"
    fontWeight: 600
  app-title:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "20px"
    fontWeight: 600
  app-subtitle:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "18px"
    fontWeight: 600
  app-lead:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "16px"
    fontWeight: 500
  app-body:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  app-strong:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  app-label:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  app-caption:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  app-micro:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "11px"
    fontWeight: 500
  landing-display:
    fontFamily: "Prompt, sans-serif"
    fontSize: "52px"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  landing-headline:
    fontFamily: "Prompt, sans-serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  landing-title:
    fontFamily: "Prompt, sans-serif"
    fontSize: "20px"
    fontWeight: 600
  landing-body:
    fontFamily: "Prompt, sans-serif"
    fontSize: "16px"
    fontWeight: 400
rounded:
  small: "6px"
  focus: "6px"
  control: "10px"
  tile: "10px"
  action: "12px"
  card: "16px"
  pill: "9999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary-dark:
    backgroundColor: "{colors.cave-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    height: "40px"
  button-primary-light:
    backgroundColor: "{colors.lavender-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    height: "40px"
  input-dark:
    backgroundColor: "{colors.night-ledge}"
    textColor: "{colors.night-chalk}"
    rounded: "{rounded.control}"
  input-light:
    backgroundColor: "{colors.lavender-field}"
    textColor: "{colors.ink-violet}"
    rounded: "{rounded.control}"
  card-dark:
    backgroundColor: "{colors.night-wall}"
    textColor: "{colors.night-chalk}"
    rounded: "{rounded.card}"
  card-light:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-violet}"
    rounded: "{rounded.card}"
  menu-item-selected-dark:
    backgroundColor: "{colors.cave-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
  menu-item-selected-light:
    backgroundColor: "{colors.lavender-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
  table-header-dark:
    backgroundColor: "{colors.night-ledge}"
    textColor: "{colors.night-chalk}"
  table-header-light:
    backgroundColor: "{colors.lavender-raised}"
    textColor: "{colors.ink-violet}"
  modal-dark:
    backgroundColor: "{colors.night-wall}"
    textColor: "{colors.night-chalk}"
    rounded: "{rounded.card}"
  modal-light:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-violet}"
    rounded: "{rounded.card}"
  landing-demo-button:
    backgroundColor: "{colors.cave-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  landing-demo-button-light:
    backgroundColor: "{colors.lavender-indigo}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  landing-secondary-link:
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  landing-secondary-link-light:
    textColor: "{colors.ink-violet}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
---

# Design System: AI Cave

## Overview

**Creative North Star: "The Lit Cave"**

The interface is the cave at night: quiet levels of navy indigo (or, in light mode, white panels on a lavender canvas) that never compete with what the team makes. The light comes from the work. Generated images, videos and audio carry the colour; the UI lends colour only to the one primary action, the selected navigation item, and the small marks that say which kind of job a result is.

The signed-in app is Operate territory: dense, scannable, antd-based, set in Anuphan at 14px so long Thai and English labels stay compact. The public site is the same cave seen from the entrance: identical palette and light/dark switch, but set in Prompt with larger, tighter headlines, pill-shaped actions and one authored gradient on type. Dark is the default in both.

Depth is borders first, one shadow second. Cards sit on the canvas with a 1px seam; only floating things (dropdowns, popovers, modals, the workspace form panel) cast a shadow.

**Key Characteristics:**
- Dark-first, with a full "Lavender haze" light mode, not an inverted afterthought.
- Indigo is the action colour; mint is a signal, never a fill for large areas.
- Both modes: every text tone on a panel passes 4.5:1; seed colours that fail are swapped for a readable text tone (darker in light, lighter in dark).
- 10px corners on controls, 16px on cards, pills on header chips, toolbar tracks, status pills and public-site actions.
- One generation type, one colour: image, video, audio, OmniHuman and DreamActor each own a mark.

## Colors

Navy-indigo or lavender neutrals carrying one indigo action colour and a mint signal, with a fixed colour per generation type.

### Primary
- **Cave Indigo** (dark, white text 4.61:1) / **Lavender Indigo** (light): primary buttons, active tab ink bar, slider track, segmented selection, focus/hover border on fields. Links and active text use a text tone: **Video Text Dark** (#A29EF2, 7.2:1 on Night Wall) in dark, **Lavender Indigo Text** in light.
- **Tile Violet → Tile Blue** (dark): the diagonal gradient on the selected sider tile, the organization initial and the user avatar. Light uses solid Lavender Indigo for the same marks.
- **Cave Indigo Deep**: the darkened brand band on the public site (white text reaches 7.6:1) and the dark scrollbar hover.
- **Cave Indigo Mist / Lavender Indigo Wash**: the primary-tinted background behind selected or highlighted rows (`colorPrimaryBg`).

### Secondary
- **Signal Mint**: antd's info colour, the image-type mark, the second stop of the brand gradient and scrollbar. Large mint fills are never used. In light mode its text tone is **Mint Text Light**.

### Tertiary (status and generation types)
- **Ember Orange**: warning and the audio-type mark (light text tone **Orange Text Light**).
- **Go Green**: success and the OmniHuman-type mark (light text tone **Green Text Light**).
- **Alarm Red**: error (text tones **Error Text Dark** / **Red Text Light**).
- **Mint Text Dark**: the Active status pill text (7.4:1 on its 14% mint fill); light uses **Mint Text Light**.
- **Avatar Blue / Avatar Pink**: member avatars, picked from the name so a person keeps one colour (alongside Cave Indigo); a step deeper than the reference so white initials pass 4.5:1 (4.57 / 4.77). Never used for anything else.
- **Actor Blue**: the DreamActor-type mark (dark text tone **Actor Text Dark**). Video uses Cave Indigo (dark text tone **Video Text Dark**).
- Type badges use the mark at 12% alpha (`mark + 1F`) as a quiet fill.

### Neutral
- **Night Floor**: page background and layout body in dark mode.
- **Night Header**: the header bar and the project workspace canvas, one step below the floor.
- **Night Sider / Night Sider Line**: the left rail and its right edge.
- **Night Wall**: cards, containers, header chips, modals and drawers in dark mode.
- **Night Ledge**: input/select/number fields, table headers, elevated surfaces, hover tiles in dark mode.
- **Night Seam / Night Control Line**: card and panel borders / field borders.
- **Night Rail**: progress and credit-bar rails.
- **Night Mist / Night Chalk / Night Muted**: secondary text (7.9:1) / primary text (15.2:1) / placeholder only (4.5:1).
- **Form Panel Dark / Form Field Dark**: the workspace generate-form panel and its fields, an indigo step above the canvas with a 45% indigo edge.
- **Lavender Canvas / Paper White / Lavender Sider**: light page canvas, cards and panels, sider and menu background.
- **Lavender Raised / Lavender Field**: light elevated surfaces and table headers / input fills and progress rails.
- **Lavender Line / Lavender Control Line**: light borders / light field borders.
- **Ink Violet / Ink Violet Soft**: light primary text / secondary and tertiary text.
- **Lavender Placeholder**: placeholder text only; it fails AA as body text.

### Named Rules
**The Light-From-The-Work Rule.** Colour on a screen comes from generated media, the one primary action, the selected nav item and type marks. Everything else is neutral.

**The Readable Tone Rule.** A seed colour that falls under 4.5:1 as small text gets its darker text tone (the `*-text-light` / `*-text-dark` tokens); never lighten a background to rescue it.

**The Dark Text Tone Rule.** In dark mode indigo text is Video Text Dark, error text is Error Text Dark, Active text is Mint Text Dark; Cave Indigo and Alarm Red are fills only. (Closes the 2026-11-26 misses: 4.38, 3.48 and 4.33:1.)

**The One Type, One Colour Rule.** Image is mint, video is indigo, audio is orange, OmniHuman is green, DreamActor is blue, everywhere a type is shown. Read them from `typeColor()`, never pick a new hue.

## Typography

**App Font:** Anuphan (400, 500, 600) with sans-serif fallback, applied globally through `--font-app-sans`.
**Landing Font:** Prompt (300 to 600), swapped in by the landing shell for public pages only.

**Character:** Anuphan is a compact, even Thai-Latin UI face that keeps dense forms calm; Prompt is rounder and more confident, reserved for persuasion.

### Hierarchy
Anuphan ships three weights only (400, 500, 600). The app scale below is measured from the code (antd `Title` levels and inline sizes); 12px is the most used size in dense panels.
- **App page title** (600, 30px, antd `Title` level 2): page-level headings.
- **App heading** (600, 24px, `Title` level 3 / `text-2xl`): section headings.
- **App title** (600, 20px, `Title` level 4 / `text-xl`): panel and modal titles.
- **App subtitle** (600, 18px, `text-lg`): card titles and emphasised figures.
- **App lead** (500, 16px, `Title` level 5 / `text-base`): lead lines and larger labels.
- **App body** (400, 14px, antd default / `text-sm`): all signed-in UI text and fields; 600 for emphasis.
- **App label** (500, 13px): form labels and compact rows.
- **App caption** (400, 12px, `text-xs`): metadata, helper text, chips, table secondary lines.
- **App micro** (500, 11px; 10px only in badges): counters and tiny badges; never body text.
- **Landing display** (600, 36px mobile / 52px desktop, line-height 1.08, tracking -0.03em, balanced): the hero headline only.
- **Landing headline** (600, 28px mobile / 36 to 40px desktop, line-height 1.15, tracking -0.02em): section titles, often capped near 24ch.
- **Landing title** (600, 20px): card and block titles.
- **Landing body** (400, 16px; buttons 15 to 16px semibold).
- Thai headlines on public pages drop the negative tracking and open line-height to 1.3.

### Named Rules
**The Two Faces Rule.** Anuphan inside the app, Prompt on public `.landing` pages. Prompt in dense app UI reads as bloated; compare any font change against a production screenshot first.

**The Three Gradients Rule.** Gradient text (indigo to mint, sweeping once on enter) appears in exactly three places: the hero headline, the Results figures and the final CTA headline.

## Layout

The app is a fixed shell: a 64px header (56px on mobile) and a left icon sider (collapsing to a 92px slide-in rail on mobile below 768px) around page content on the canvas. Pages that paint their own background read the raw theme tokens (`colorBgBase`), so a theme change must be checked on the busiest screen, the project workspace, not only list pages. The workspace pairs a floating form panel with a results area on the darker Night Header tone.

The public site uses a 1200px centred container with 16px gutters on mobile and 32px from 768px up, a 64px sticky translucent navbar (85% background, backdrop blur), and anchor scroll padding of 64px (126px when the features group nav is present).

Spacing follows antd's 4px unit, not overridden: 4, 8, 12, 16, 24, 32px (the `spacing` tokens). Grouped controls such as segmented grids use 8px; antd Card bodies keep their 24px; hand-built panels mostly use 16px (`p-4`, the most common) and 24px (`p-6`) for roomy ones; public gutters are 16px and 32px. Scrollbars are hidden app-wide; scrolling surfaces rely on content and fades, not visible bars.

**Breakpoints.** Tailwind's 640px (`sm`), 768px (`md`, the main mobile/desktop switch: sider becomes a slide-in rail, gutters widen), and 1024px (`lg`); antd's 1200px (`xl`) widens the project list. `xl:` Tailwind classes are rare; design at 360px, 768px and 1280px.

**Theme switching.** `ThemeProvider` sets `theme-dark` or `theme-light` on the root element, stores the choice in a `theme` cookie for a year, and starts in dark. antd receives `getThemeConfig(mode)`; plain CSS keys off the root class (scrollbars, `--legacy-*`); public pages receive `--l-*` variables from the landing shell. A new screen must read one of these three, never its own mode check.

## Elevation & Depth

Hybrid and restrained: tonal layering plus a single border does almost all the work, and shadow is reserved for things that float above the page.

### Shadow Vocabulary
- **Overlay** (`0 8px 24px rgba(0,0,0,0.16)` dark / `0.08` light): dropdowns, popovers, modals.
- **Workspace panel** (dark `0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.55)`; light `0 1px 2px rgba(30,27,58,0.06), 0 8px 24px -12px rgba(30,27,58,0.18)`): floating workspace panels, one elevation, no border.
- **Form panel dark** (`0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 40px -14px rgba(0,0,0,0.65)` with a `rgba(106,97,238,0.45)` edge): the generate form.
- **Light tertiary** (`0 1px 2px rgba(30,27,58,0.04), 0 2px 8px rgba(109,93,245,0.06)`): antd's subtle light-mode lift.
- **Landing demo button** (`0 10px 24px -12px` in the primary colour): the public primary action's glow, also under the page's one primary action in the app (New Project).
- **Sider tile** (`0 6px 16px -4px` primary at 45%): the selected sider tile only.

### Named Rules
**The Border-Or-Shadow Rule.** A card gets a border, a floating panel gets a shadow; never both, never a halo.

## Shapes

Gently rounded and consistent: 10px on every control (buttons, inputs, selects, menu items), 6px on small controls and tags (antd derives it from the 10px seed; 12px is its large radius), 16px on cards and modals, 12px on the page's primary action, 10px on sider tiles, 6px on public-site focus rings offset 3px. Full pills: header chips (organization, Change Package, credit), toolbar tracks (search, segmented filter, view toggle), status pills, round icon buttons and public-site actions. Media thumbnails are clipped to the container radius.

## Components

Calm, compact antd controls recoloured to the cave; the public site trades corners for pills and adds motion with purpose.

### Buttons
- **Shape:** gently rounded (10px), 40px tall.
- **Primary:** Cave Indigo (dark) / Lavender Indigo (light) with white text.
- **Default / text:** primary text colour; text buttons hover to the elevated surface (Night Ledge / Lavender Raised).
- **Public primary ("request a demo"):** one pill button in the same colour in every spot, 14px 28px padding (10px 20px small), primary-coloured glow, hover to 90% opacity, press to 98% scale.
- **Public secondary:** an outlined pill with the line colour, hover fills with the raised surface.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** Night Wall / Paper White.
- **Shadow Strategy:** none at rest; see Elevation.
- **Border:** Night Seam / Lavender Line.

### Inputs / Fields
- **Style:** filled with Night Ledge / Lavender Field, bordered with Night Seam / Lavender Control Line, 10px corners. Same for Input, InputNumber and Select.
- **Focus / Hover:** border shifts to the primary colour.
- **Placeholder:** Lavender Placeholder in light mode.

### Tags (the most used component, 134 places)
- **Style:** antd `Tag`, 12px text, small corners (6px, antd's derived small radius from the 10px seed), tinted fill with a matching border.
- **Status tags:** use the semantic presets `success`, `warning`, `error`, which resolve to Go Green, Ember Orange and Alarm Red (with their light text tones).
- **Type tags:** generation types use the type mark, not an antd preset (see Generation-type mark).
- **Incumbent drift:** about 30 tags still use antd palette names (`blue`, `green`, `orange`, `gold`); see Don'ts.

### Modals / Drawers
- **Background:** Night Wall / Paper White, transparent header, 16px corners from the card radius, Overlay shadow.
- **Content padding:** antd default (20px 24px); title at App title (20px, 600).

### Tables
- **Header:** Night Ledge / Lavender Raised with primary text; borders in Night Seam / Lavender Line.
- **Rows:** on the card surface; secondary lines in App caption (12px) and secondary text colour.

### Navigation
- **App sider:** Night Sider / Lavender Sider background. Items have no row fill: the icon sits in a ~40×34px tile (10px corners) above a 13px label. Selected: the tile is the Tile Violet → Tile Blue gradient (solid Lavender Indigo in light) with the sider-tile shadow, white icon, label in primary text at 600. Others: Night Mist icon and label; hover fills the tile with Night Ledge / Lavender Raised.
- **Header:** Night Header bar with a Night Ledge bottom line; chips are 40px pills on Night Wall with a Night Seam border; the Community pill keeps its own gradient.
- **Page title row:** `PageSubHeader` sits on the page floor (no band), title 30px/600, count chip in primary text on a 18% primary tint.
- **Tabs:** selected label in primary text, primary ink bar.
- **Segmented:** track in the field colour, selected segment solid primary with white text; on page toolbars the track and segments are pills, 40px tall.
- **Public navbar:** sticky 64px bar, 85% translucent background with blur and a bottom line; the locale switch's active option is a raised chip.

### Generation-type mark (signature)
Every result, activity row and type chip carries its generation type's mark colour (see The One Type, One Colour Rule), with text in that mode's readable tone and a 12% tint as the badge fill.

### Project card
16px corners, Night Wall with a Night Seam border (primary border on hover). A 104px media mosaic (one large tile plus two); a project with no work shows its initials (first letters of the first two words, or the first two letters of one word, skipping Thai leading vowels) at 56px on a primary → Cave Indigo Deep gradient with faint concentric rings, grey when deleted. Body 18px padding: name 18px/600 with a status pill on the right (Active in mint, Deleted in red, 14% / 12% tints); credit row with the used figure at 26px/600, "/ N used" 14px, "N left" 14px/600 (mint when untouched, warning plus "Low ·" under 10%); the credit bar below (unchanged: used grey on the left, what is left coloured on the right); member avatars 26px and the created date at 14px.

### Credit bar (signature)
Credit is a segmented bar whose segments slide (200ms, `cubic-bezier(0.2, 0.8, 0.2, 1)`) as the job's cost changes, so the cost of the next Generate is visible before it is pressed.

### Loading
A 2px top progress bar in the current colour for app-shell loads, a pulsing logo mark before the session exists, and a neutral shimmer skeleton for media. All motion stops under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** read colours from `aiCaveColors` / `getThemeConfig(mode)` / `typeColor()` and spacing/shadows from `app/theme/surface.ts`; never hard-code a hex in a component.
- **Do** design both modes together: dark is the default, the Lavender haze light mode ships at the same quality.
- **Do** keep 10px control corners and 16px card corners; pills only where Shapes lists them.
- **Do** give every motion a `prefers-reduced-motion` fallback that keeps state readable (opacity and colour may still ease).
- **Do** use the same "request a demo" pill, same colour, in every spot on public pages.

### Don't:
- **Don't** use antd's stock blue `#1677ff` (still present in the legacy mobile-drawer CSS); selection is the primary colour.
- **Don't** reuse `.card-gradient` (the `#87ddde → #6366f1` border-image) or the `#6b46ff → #00d4ff` gradients in `app/home/page.module.css`; they belong to the retired home page.
- **Don't** add new `--legacy-*` variables or copy their literal greys; they exist only to map old dark-only admin/organization screens onto the light theme.
- **Don't** put Prompt in the signed-in app or Anuphan on the public landing.
- **Don't** use Lavender Placeholder or seed status colours as small text on light panels.
- **Don't** stack a border and a shadow on the same card, or add glows/halos to panels; the only glows are the primary action and the selected sider tile.
- **Don't** bring back the charcoal greys (`#191C20`, `#21262B`, `#2A3038`, `#3A434F`) or Tailwind's neutral greys as dark surfaces; dark surfaces are the Night tokens.
- **Don't** add gradient text beyond its three public-site placements.
- **Don't** add new `Tag color="blue"` / `"green"` / `"gold"` / `"orange"`; status tags use `success` / `warning` / `error`, type tags use the type mark.
- **Don't** use weight 700 or 300 in the app; Anuphan loads 400, 500 and 600 only, so 700 is browser-faked bold.
- **Don't** set body text below 12px; 11px and 10px are for counters and badges.

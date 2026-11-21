---
name: SurePay
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4943'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7a73'
  outline-variant: '#bdc9c1'
  surface-tint: '#006c4e'
  primary: '#005d42'
  on-primary: '#ffffff'
  primary-container: '#047857'
  on-primary-container: '#9ffdd3'
  inverse-primary: '#7bd8b1'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#495167'
  on-tertiary: '#ffffff'
  tertiary-container: '#616980'
  on-tertiary-container: '#e4e9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f5cc'
  primary-fixed-dim: '#7bd8b1'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  currency-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for a high-integrity, mobile-first fintech and escrow service tailored for Cameroon's peer-to-peer and commerce landscape. The brand conveys unyielding financial security, transparency, and communal confidence, turning informal commerce into guaranteed settlements.

### Visual Style
The design system combines **Corporate/Modern FinTech** discipline with **Tactile Trust cues**:
- Pristine, daylight surfaces layered over a crisp slate-neutral foundation.
- Tangible status states: funds are visibly "in transit", "safely locked in escrow", or "cleared".
- Native touch ergonomics: sticky actions pinned to safe interaction zones, thumb-friendly tap targets, and frictionless transaction steppers.
- High-integrity micro-cues: subtle emerald ambient glows on verified accounts, clear security shields, and contextual payment network identifiers (MTN MoMo and Orange Money).

## Colors

The palette establishes an immediate psychological perception of wealth conservation, official authenticity, and disciplined tracking.

### Core Roles
- **Primary (`#047857` Emerald):** Represents guaranteed escrow protection, successful releases, primary CTAs, and verified milestones. Deep emerald variants (`#065F46`) serve as active press states; lighter tints (`#ECFDF5`) serve as affirmative status backgrounds.
- **Secondary (`#D97706` Amber/Gold):** Denotes locked escrow funds, countdown timers, verification holds, dispute arbitration, and pending approvals. Soft amber containers (`#FEF3C7`) are paired with deep amber typography to signal active custody without causing alarm.
- **Tertiary (`#0F172A` Deep Slate):** Anchors high-hierarchy typographic elements, modal backdrops, and navigation bars to provide weight and legibility under direct sunlight.
- **Neutral (`#64748B` Slate Gray):** Controls secondary metadata, placeholder tokens, and segmented bar tracks.

### System & Rail Micro-Accents
- **MTN Mobile Money Accent:** `#EAB308` (restricted strictly to telecom provider badges and channel selectors).
- **Orange Money Accent:** `#F97316` (restricted strictly to telecom provider badges and channel selectors).
- **Surface Canvas:** `#F8FAFC` base application background.
- **Surface Card:** `#FFFFFF` elevated container background.
- **Border / Divider:** `#E2E8F0` structural line color.

## Typography

The typographic scale uses **Plus Jakarta Sans** across all roles to achieve a modern, approachable, and geometric posture. Open apertures and clean geometry ensure legible rendering on budget and mid-tier smartphone screens common across Central Africa.

### Currency Formatting Rules
- All Cameroonian Franc balance strings must display the currency denominator as `FCFA` following the amount with a non-breaking space (e.g., `250 000 FCFA`).
- Use `currency-display` with tabular numbers (`tnum`) enabled to prevent layout jitter during live counter animations and balance updates.
- In summary cards, the `FCFA` symbol may be rendered at 70% font size of the associated numeric string to prioritize numeric clarity.

## Layout & Spacing

The layout is optimized for single-thumb mobile interaction within portrait viewports (360px to 428px wide) while adapting gracefully up to tablet displays for merchant desktop dashboards.

### Grid & Breakpoints
- **Mobile (< 640px):** 4-column fluid layout with `1rem` outer canvas margin and `1rem` column gutters. All transactional flows (Inspection, Deposit, Release) are locked to a single full-width column card sequence.
- **Tablet / Desktop (≥ 640px):** 12-column layout with max-width constrained to `540px` for user transactions and `960px` for multi-party arbitration and escrow audit tables. Outer margins scale to `2rem`.

### Touch Geometry & Sticky Zones
- Primary actions (e.g., "Confirm Release of Funds", "Initiate Escrow") reside in a fixed bottom anchor container with safe-area bottom insets (`env(safe-area-inset-bottom) + 0.75rem`).
- The minimum touch target size for interactive items (steppers, copy-to-clipboard icons, disclosure toggles) is 48x48px.

## Elevation & Depth

Visual hierarchy uses clean tonal layering paired with soft ambient shadows to avoid muddy contrasts on high-glare outdoor screens.

### Elevation Hierarchy
- **Level 0 (Base Canvas):** `#F8FAFC`. Completely flat; houses non-clickable category labels and system status bars.
- **Level 1 (Cards & Data Tiles):** Background `#FFFFFF` with a crisp 1px border (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Active Escrow & Focused Summary Cards):** Background `#FFFFFF` with an emerald-tinted soft drop shadow: `0 8px 24px -4px rgba(4, 120, 87, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Sticky Action Bars & Modals):** Background `#FFFFFF` with deep ambient lift: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.
- **Level 4 (Escrow Locked Shield):** Dynamic pulsing aura on active locked states using a dual ring of `0 0 0 4px rgba(217, 119, 6, 0.15)` around warning security badges, transitioning to `0 0 0 4px rgba(4, 120, 87, 0.15)` once inspection terms are approved.

## Shapes

The design system employs a consistent **Rounded (Level 2)** shape standard:
- Default components (Inputs, standard buttons, notification cards) use `0.5rem` (8px) radius.
- Larger container surfaces (Escrow milestone overview cards, transaction detail panels) use `rounded-lg` (`1rem` / 16px).
- Modals, action sheets, and bottom checkout drawers use `rounded-xl` (`1.5rem` / 24px) on their top edges.
- Status chips, step tracker pills, and telecom badges use full circular pills (`rounded-full` / 9999px) to contrast against rectangular cards.

## Components

### Buttons
- **Primary (Release / Confirm):** Deep Emerald (`#047857`) background, text `#FFFFFF`, height 52px, full width on mobile. Subtle inset border highlight `inset 0 1px 0 rgba(255, 255, 255, 0.2)`. Tap animation scales down to 0.98 for tactical feedback.
- **Caution / Dispute:** Secondary Amber (`#D97706`) background, text `#FFFFFF`. Used for "Raise Dispute" or "Extend Inspection Period".
- **Secondary Outline:** Background `#FFFFFF`, 1.5px border `#E2E8F0`, text `#0F172A`.
- **Destructive:** Background `#FEE2E2`, border `#FECACA`, text `#B91C1C`.

### Escrow Status Chips
- **Funds Locked:** Background `#FEF3C7`, text `#92400E`, with an amber padlock icon prefix.
- **Inspection In Progress:** Background `#EFF6FF`, text `#1E40AF`, with a dynamic clock timer badge.
- **Discharged / Completed:** Background `#ECFDF5`, text `#065F46`, with an emerald checkmark badge.
- **In Dispute:** Background `#FEF2F2`, text `#991B1B`, with an alert shield prefix.

### Inputs & Payment Method Selectors
- **Currency Entry:** Oversized amount input fields with right-aligned static `FCFA` suffix. Focused state shows a 2px ring in `#047857`.
- **Telecom Selection Cards:** Dual card selectors for **MTN MoMo** and **Orange Money**. In unselected states, cards feature a 1px `#E2E8F0` border. When active, cards display a 2px `#047857` outline with a right-hand emerald check badge and a branded micro-indicator dot.
- **Phone Number Field:** Includes a permanent `+237` national country code pill locked inside the left gutter.

### Checkboxes & Radio Controls
- Emerald-filled (`#047857`) with crisp white checkmark vectors upon selection. Unselected state has a 2px border in `#CBD5E1` over white.

### Escrow Milestone Stepper Card
- A vertical stack showing: *1. Agreement Created*, *2. Deposit Locked*, *3. Goods Dispatched*, *4. Inspection Complete*, *5. Funds Released*.
- Completed steps display an emerald circle with a white checkmark. The active step pulses with an amber or emerald concentric ring. Future steps display a 2px slate dashed outline with a muted numeral.

### Verification Badge
- High-trust profile badge: small shield icon filled with `#047857`, featuring a crisp white center tick mark and text reading "KYC Verified - CNI".
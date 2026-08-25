---
name: Lumina Dark
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#bcc9c6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#879391'
  outline-variant: '#3d4947'
  surface-tint: '#6bd8cb'
  primary: '#6bd8cb'
  on-primary: '#003732'
  primary-container: '#29a195'
  on-primary-container: '#00302b'
  inverse-primary: '#006a61'
  secondary: '#ffc640'
  on-secondary: '#402d00'
  secondary-container: '#e3aa00'
  on-secondary-container: '#5a4100'
  tertiary: '#ffb59a'
  on-tertiary: '#591c02'
  tertiary-container: '#d27956'
  on-tertiary-container: '#4f1700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-slate: '#1e1e1e'
  surface-raised: '#2a2a2a'
  text-primary: '#f8fafc'
  text-secondary: '#94a3b8'
  border-subtle: '#334155'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 52.8px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38.4px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28.8px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 31.2px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28.8px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 25.6px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 19.6px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16.8px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  container-max: 1280px
---

## Brand & Style

The design system evolves into a high-performance, **Premium Dark Mode** experience designed for elite professionals. It shifts from the welcoming warmth of the original light mode to a state of **commanding focus and sophisticated technicality**. 

The visual direction combines **Minimalism** with refined **Glassmorphism**. By using deep charcoal and slate foundations, the interface minimizes ocular strain and maximizes focus on critical career data. The "Human-Centric Tech" narrative is maintained through soft-glowing accents and translucent layers that feel like a high-end command center. The emotional response is one of calm authority, precision, and exclusivity.

## Colors

The color palette is anchored by deep, ink-like tones to provide a stable, high-contrast environment.

- **Background & Surface:** The base background is `#121212` (Deep Charcoal). UI surfaces utilize `#1e1e1e` (Slate) to create subtle perceived depth without relying on heavy shadows.
- **Primary Teal:** The signature Teal (#0d9488) is the primary engine for interactivity. In dark mode, it acts as a luminous beacon for navigation and success states.
- **Secondary Amber:** Used sparingly for "Insights" and "Warnings." It provides a high-energy contrast against the slate backgrounds.
- **Typography:** Primary content uses a soft white (`#f8fafc`) to prevent the "vibrating text" effect of pure white on black. Secondary metadata uses a muted slate-grey (`#94a3b8`) to establish hierarchy.

## Typography

Typography maintains a dual-font strategy optimized for dark-mode legibility.

- **Geist (Headlines):** Used for structural elements and headers. Its geometric construction ensures that even at large sizes, letters remain crisp against dark backgrounds.
- **Inter (Body):** Selected for its exceptional readability in low-light environments. Increased line-heights are employed to prevent "text-crowding" which can occur when reading light text on dark backgrounds.
- **Letter Spacing:** Headlines utilize wide tracking (`0.02em`) to enhance the premium, airy feel of the brand.

## Layout & Spacing

The layout utilizes a **Fluid Grid** model with a generous 8px spatial rhythm.

- **Desktop (12-column):** A max-width of 1280px with wide 48px margins creates a "contained" feel that mimics high-end editorial layouts.
- **Mobile (4-column):** Margins contract to 16px to maximize real estate while maintaining a clear safety gutter.
- **Rhythm:** `stack-lg` is the standard for vertical section separation, ensuring the dark UI feels spacious and un-cluttered.

## Elevation & Depth

In this dark aesthetic, hierarchy is defined by **Tonal Layering** and **Backdrop Blurs** rather than traditional shadows.

- **Level 0:** Base background (`#121212`).
- **Level 1:** Primary containers (`#1e1e1e`) with a subtle `1px` border of `#334155`.
- **Level 2 (Modals):** Glassmorphic surfaces using `rgba(30, 30, 30, 0.8)` with a `16px` backdrop blur. 
- **Shadows:** Use extremely low-opacity, wide-spread shadows (`rgba(0, 0, 0, 0.4)`) only on the highest floating elements (modals/popovers) to provide a soft lift.

## Shapes

The shape language is sophisticated and approachable, utilizing consistent rounded corners to soften the "technical" dark mode.

- **Base Radius (16px):** Applied to cards, large containers, and input fields.
- **Interactive Radius (12px):** Applied to buttons to create a sharper, more precise focus point within larger containers.
- **Full Radius (Pill):** Reserved strictly for status badges, tags, and progress bar caps to distinguish them as non-structural elements.

## Components

- **Buttons:** Primary buttons use a solid Teal (`#0d9488`) with white text. They should have a subtle outer glow on hover to simulate a "light source" in the dark environment.
- **Input Fields:** Styled with the Slate background (`#1e1e1e`) and a subtle `#334155` border. On focus, the border transitions to Teal with a soft 4px glow.
- **Cards:** Defined by a 16px radius. In dark mode, cards should use a 1px border instead of heavy shadows to define their perimeter clearly.
- **Chips:** For skill or category tags, use a semi-transparent Teal tint (`rgba(13, 148, 136, 0.15)`) with Teal text for a "neon-glass" effect.
- **Progress Bars:** Use a deep slate track with a Teal-to-Emerald gradient for the fill, suggesting growth and energy.
- **The Coach Overlay:** This floating element should be the most prominent glassmorphic piece, using the Secondary Amber for highlights to signal its "AI/Insight" nature.
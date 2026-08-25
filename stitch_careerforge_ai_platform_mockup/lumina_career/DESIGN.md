---
name: Lumina Career
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3d4947'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#924628'
  on-tertiary: '#ffffff'
  tertiary-container: '#b05e3d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#773215'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is built to evoke a sense of **reassuring sophistication**. It targets professionals seeking career advancement through an experience that feels less like a cold utility and more like a high-end concierge service.

The visual direction blends **Modern Corporate** reliability with **Glassmorphism**. It utilizes a "Human-Centric Tech" aesthetic—incorporating soft, tactile surfaces and translucent layers to reduce cognitive load and provide a calm, supportive environment for the high-stress task of job hunting. The interface relies on generous whitespace, high-contrast typography for readability, and a sophisticated interplay between warm neutrals and deep slate tones.

## Colors

The palette is anchored by a warm, inviting background (`#FDFCFB`) to differentiate from standard cold-white SaaS interfaces. 

- **Primary Teal:** Used for "Success" states, primary calls to action, and positive progress indicators. It represents growth and achievement.
- **Secondary Amber:** Reserved for high-value tips, warnings, or "In Progress" statuses to provide a warm point of focus without inducing anxiety.
- **Slate & Charcoal:** These provide the structural depth. Dark accents are used for navigation and high-level containment to give the UI a "grounded" and authoritative feel.
- **Typography:** Text adheres to strict contrast ratios, using deep navy-slates instead of pure black to maintain the "humanized" warmth of the platform.

## Typography

This design system utilizes a dual-font approach to balance technical precision with accessibility. 

- **Headings:** Geist is used for its geometric clarity and modern, "developer-grade" precision. Large headlines should utilize generous tracking (`0.02em`) to enhance the high-end feel.
- **Body & UI:** Inter provides maximum legibility for dense information like CV content and job descriptions. 
- **Hierarchy:** Use `label-sm` in all-caps for section headers or small metadata to create a clear architectural grid.

## Layout & Spacing

The layout follows a **Fluid Grid** model with strict adherence to an 8px baseline. 

- **Desktop:** 12-column grid with a 1280px max-width container. Margins are expansive (48px) to reinforce the premium, "un-cluttered" brand promise.
- **Mobile:** 4-column grid with 16px margins.
- **Spacing Rhythm:** Use `stack-lg` (32px) to separate logical sections and `stack-md` (16px) for internal card padding. The "generous" use of space is a core functional requirement to ensure the user feels "supported" rather than overwhelmed by data.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Glassmorphism** and **Ambient Shadows**.

- **Level 0 (Background):** Solid `#FDFCFB`.
- **Level 1 (Cards/Surface):** White `#FFFFFF` with a very soft, 1px border (`#E2E8F0`). Shadow is highly diffused: `0 4px 20px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Modals/Overlays):** Utilizes background blur (12px) with a semi-transparent white fill (80% opacity). This creates the "glass" effect, allowing the background colors to peek through while maintaining focus.
- **Interactive States:** On hover, cards should slightly lift—transitioning the shadow to a slightly deeper, more concentrated offset.

## Shapes

The shape language is consistently **Rounded** to appear approachable and friendly.

- **Base Radius:** 1rem (16px) for all primary cards, input fields, and containers.
- **Button Radius:** 0.75rem (12px) to provide a slightly distinct, more "clickable" appearance than the containers they sit within.
- **Chips/Badges:** Full-pill (999px) for status indicators and category tags.

## Components

- **Buttons:** Primary buttons use the Teal accent with white text. Secondary buttons use a Slate-400 outline. Transitions should be soft (200ms ease-out).
- **Cards:** Defined by the 16px radius and Level 1 elevation. Feature "empathetic micro-copy" in the footer of cards (e.g., "Your resume is looking strong").
- **Input Fields:** Large touch targets (48px height) with the 16px radius. Focus states use a 2px Teal border and a subtle Teal glow.
- **Chips:** For skill tags, use a light Teal background (`#F0FDFA`) with Teal text (`#0D9488`) and a pill shape.
- **Progress Bars:** Use a thick (8px) rounded track. The progress indicator should be a gradient from the Primary Teal to a slightly lighter variant to show movement and energy.
- **Special Component - "The Coach Overlay":** A persistent, glassmorphic floating action button or panel that provides AI-driven advice, styled with the Amber secondary color to denote "Insights."
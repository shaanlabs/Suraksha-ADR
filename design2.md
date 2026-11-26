---
version: alpha
name: Colorlib Hub
description: A bright, editorial marketplace for browsing many website demos with strong hierarchy, light surfaces, and crisp pill-shaped controls.
colors:
  primary: "#12141A"
  secondary: "#2C62D6"
  tertiary: "#E4E8EF"
  neutral: "#FFFFFF"
  surface: "#FFFFFF"
  on-surface: "#12141A"
  muted: "#6A7282"
  border: "#E5E7EB"
  accent: "#2C62D6"
  success: "#198754"
  error: "#D92D20"
typography:
  headline-display:
    fontFamily: "Source Serif Pro"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Source Serif Pro"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.19
    letterSpacing: "-0.005em"
  headline-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.19
    letterSpacing: "0em"
  headline-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.21
    letterSpacing: "0em"
  body-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "0em"
  label-lg:
    fontFamily: "Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0em"
  label-md:
    fontFamily: "Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0em"
  label-sm:
    fontFamily: "Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0em"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "12px"
  md: "22px"
  lg: "28px"
  xl: "96px"
  gutter: "16px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
    height: "34px"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "14px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
---

# Colorlib Hub

## Overview
Colorlib Hub feels clean, dense, and highly browsable, with a strong editorial header followed by a large catalog of content cards. The tone is professional but friendly: serif headlines add a premium, curated feel while the rest of the interface stays practical and lightweight. It is designed for scanning, comparing, and filtering lots of options quickly, so clarity and restraint matter more than ornament.

## Colors
- **Primary (#12141A):** A deep ink used for main headlines, active pills, and primary button fills. It anchors the interface and provides the strongest contrast against the white background.
- **Secondary / Accent (#2C62D6):** A vivid blue used for links, selected emphasis, and interactive highlights. It gives the system its clearest brand color without overwhelming the content.
- **Tertiary (#E4E8EF):** A soft cool border tone for outlined controls and subtle separators. It keeps chips and secondary buttons visible while staying airy.
- **Surface (#FFFFFF):** The dominant canvas color for the page, cards, inputs, and pills. The design relies on white space rather than tinted panels.
- **On-surface (#12141A):** The default readable text color on white and light surfaces. This is the body and label workhorse throughout the product.
- **Muted (#6A7282):** A softer neutral for metadata, counts, and supporting copy. It helps secondary information recede without becoming faint.
- **Border (#E5E7EB):** A very light line color used for card edges and input outlines. It creates structure without introducing visible heaviness.
- **Success (#198754):** A positive green used sparingly for availability or “free” style badges and CTA variants. It adds variety in the card actions while remaining calm.
- **Error (#D92D20):** Reserved for destructive or invalid states. It should remain rare because the screen itself is mostly informational.

## Typography
The system uses a serif/sans combination: **Source Serif Pro** for the largest editorial headlines and a system sans stack for all interface text. The main hero headline is bold, compact, and highly differentiated, giving the page a premium magazine-like opening. Supporting headings shift to system sans for utility sections and card titles, while body copy and labels stay compact and highly legible.

Headings use a tighter line-height and slightly negative tracking at the top level to create a refined, display-oriented feel. Body text is neutral and readable, with no noticeable uppercase treatment. Small labels and pills are typically medium-bold, short, and utility-first, often rendered in a system or Arial-like face to keep controls crisp and familiar.

## Layout
The page is centered and content-led, with a wide single-column hero and a multi-column results grid below. Spacing is generous at the top but becomes denser as the page transitions into filters and cards, which supports scanning a large library without feeling cluttered. The rhythm leans on the provided 12px, 22px, 28px, and 96px spacing steps, with cards separated by clean gutters rather than heavy dividers.

Hero content uses a comfortable max-width and centered alignment. Filter chips wrap naturally across rows, so the layout should tolerate variable label lengths without breaking. Cards use a consistent internal padding of 16px and sit in a fluid responsive grid with even gaps; section padding should stay substantial to preserve the airy marketplace feel.

## Elevation & Depth
The interface is intentionally flat. Hierarchy comes from contrast, spacing, border lines, and typographic scale rather than from shadows or layered depth. Cards and inputs rely on thin borders and white-on-white separation, which keeps the browsing surface calm and fast to parse.

Use the faint border color for structure, not shadow. Active elements are distinguished by fill color and text contrast, while inactive chips remain outlined and light. If depth is needed, prefer slightly stronger borders or tonal fills over drop shadows.

## Shapes
The overall shape language is soft and highly rounded. Pills, buttons, and search fields use full rounding, while cards remain only mildly rounded with the 8px radius. This creates a contrast between friendly controls and practical content containers.

The shape system feels approachable rather than playful. Controls should look tactile and touch-friendly, but the cards and page structure should remain restrained and grid-aligned.

## Components
Buttons follow three clear patterns. `button-primary` is a filled dark pill with white text, used for the strongest actions and active states. `button-secondary` is an outlined or white-filled pill with a light border and dark text, used for alternate actions and filters. `button-link` is minimal and underlined for low-emphasis navigation or inline actions.

Buttons are compact: around 34px tall with about 8px vertical and 14px horizontal padding. They should feel dense but not cramped, with bold labels and no shadow. Hover states can shift primary actions toward the blue accent (`button-primary-hover`) and subtly tint secondary actions without changing their overall geometry.

Cards are white panels with a 1px border, 8px rounding, and 16px internal padding. They should hold image previews, titles, metadata, and stacked action rows without visual clutter. Keep card content aligned and readable; avoid decorative depth or heavy framing.

Inputs should be full-width, pill-shaped, and lightly bordered. The search field is visually prominent but still minimal, with comfortable horizontal padding and muted placeholder text. Use a clear focus state based on border or ring color rather than shadow.

Chips are the key navigation atom. They are small rounded pills with outlined or filled active states, short labels, and compact counts. Active chips should use the dark primary fill with white text; inactive chips should stay white with a pale border and dark text. Keep chip spacing consistent so wrapped rows remain easy to scan.

Badges, counts, and metadata should remain visually quiet. Use muted text for counts and category labels, and reserve the accent blue for links and selected highlights. Any success-style tags, such as “Free theme,” should use the green success color sparingly and consistently.

## Do's and Don'ts
- Do keep the hero typography editorial and prominent, with Source Serif Pro reserved for the largest headings.
- Don't introduce heavy shadows or glassmorphism; the system is deliberately flat and border-driven.
- Do use full-pill shapes for buttons, chips, and the search field to preserve the recognizable browsing language.
- Don't turn cards into oversized rounded containers; keep card radius modest at 8px.
- Do preserve high contrast for primary actions and titles using the primary ink color.
- Don't overuse the blue accent; it should highlight interaction, not dominate the page.
- Do keep spacing generous around the hero and efficient within the results grid.
- Don't crowd chip rows or card metadata; the interface should stay easy to scan at a glance.
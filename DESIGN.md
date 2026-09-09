---
name: CalcPath
description: A quiet calculus workbench for reading, practice, and mathematical exploration.
colors:
  cp-blue: "#2457d6"
  cp-ink: "#172c46"
  cp-muted: "#586a80"
  cp-line: "#d9e1ec"
  cp-paper: "#fff"
  cp-wash: "#f5f7fb"
  cp-success: "#17674e"
  cp-warn: "#855212"
typography:
  headline:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "32px"
    fontWeight: 620
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, Helvetica, sans-serif"
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.4
rounded:
  tag: "4px"
  control: "7px"
  reader: "12px"
  panel: "13px"
  workbench: "14px"
spacing:
  inline: "12px"
  control-x: "16px"
  section-gap: "24px"
  panel-inset: "26px"
  desktop-gutter: "36px"
components:
  button-primary:
    backgroundColor: "{colors.cp-blue}"
    textColor: "{colors.cp-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-light:
    backgroundColor: "{colors.cp-paper}"
    textColor: "{colors.cp-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.cp-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  answer-input:
    backgroundColor: "{colors.cp-paper}"
    textColor: "{colors.cp-ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  panel:
    backgroundColor: "{colors.cp-paper}"
    textColor: "{colors.cp-ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
  mode-navigation:
    backgroundColor: "{colors.cp-paper}"
    textColor: "{colors.cp-muted}"
    height: "51px"
  source-badge:
    backgroundColor: "#edf0f5"
    textColor: "#53647c"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
---

# Design System: CalcPath

## Overview

**Creative North Star: "The Calculus Workbench"**

CalcPath is a quiet working environment with white study surfaces, a cool wash, navy text, and cobalt actions. Fine rules organize the material while working mathematical diagrams provide expression. The interface is compact enough to show useful course context and spacious enough to read and solve a question.

This document captures the implemented system, rather than an approved visual comp. Its authority is the current application source, especially `app/calcpath.css`, with product context in `PRODUCT.md`. Surface composition remains in `.impeccable/surfaces/app-workspace-tsx.md`. Clear mathematical notation, keyboard access, and supportive feedback are durable requirements.

**Key Characteristics:**
- Quiet paper surfaces and fine ruled separation.
- Cobalt actions with navy reading text.
- Geist interface typography paired with KaTeX mathematics.
- Mathematical instruments that respond to student input.
- Compact navigation and generous focused practice.

## Colors

The palette uses a single action accent over cool neutral surfaces, with semantic feedback colors.

### Primary
- **Cobalt action** (`cp-blue`): primary actions, active navigation, selected options, numeric control output, and active terms in the series instrument.

### Neutral
- **Navy ink** (`cp-ink`): headings, primary text, and key numeric values.
- **Slate annotation** (`cp-muted`): descriptions, metadata, captions, and secondary controls.
- **Fine rule** (`cp-line`): surface boundaries and row separators.
- **Working paper** (`cp-paper`): study panels, the reader, and plots.
- **Cool wash** (`cp-wash`): the page surrounding working surfaces.

Success green marks completed reading and correct answers; warning amber marks pending material, evaluative difficulty, and hints. These are semantic roles, not competing brand accents. Explorer diagrams additionally use teal curves, blue direction vectors, and amber integration slices, each explained in a caption. Preserve those distinct mathematical meanings.

**The Action Color Rule.** Use cobalt for actionable or selected interface elements; keep extended reading copy in ink and slate.

## Typography

**Body and interface font:** Geist, with Arial, Helvetica, and sans-serif fallbacks. **Mathematics:** the installed KaTeX stylesheet and renderer. Geist Mono is loaded by the layout but is not an established visual role on the documented screens.

The interface uses restrained, slightly tightened headings and small descriptive metadata. It has no separate display face or oversized marketing type. The frontmatter records the recurring headline, section title, body, and button-label roles. Subheadings use (16px, weight 600, line-height 1.45); introductory copy uses (15px, line-height 1.7). Panel prose typically uses (14px, line-height 1.8), while metadata spans (11–13px). Paragraphs are limited to (72ch).

Page headings reduce to (28px) on the narrowest breakpoint. Practice formulas typically use (20px), reducing to (18px) on small screens, with horizontal overflow for mathematics. Counts, timers, and instrument outputs use tabular numerals. Uppercase is reserved for existing small metadata badges, not a required pre-heading eyebrow.

## Layout

The shared shell aligns the identity bar, horizontal mode navigation, and page content to a centered container of (1200px), expanding to (1320px) from (1450px). Desktop gutters are (36px); they reduce to (24px), (20px), then (16px) as the viewport narrows. The identity bar and navigation have separate rows and a fine boundary beneath the header.

The study desk joins lesson, instrument, and practice in one bordered work surface. The course register and source library use open rows with rules. Focused practice is centered within (820px); the reader uses a main area plus a (280px) aside. Explorer plots sit beside controls. These are existing surface arrangements, not a requirement that every future page copy the study desk.

At (1000px), the workbench uses two columns with practice below and the reader aside moves below the document. At (700px), explorers stack, register rows reorganize, and navigation scrolls horizontally when needed. At (480px), the workbench becomes one column, library rows become blocks, and progress labels sit above their bars. PDF frames step from (630px) through (500px) to (440px) tall. Preserve readable overflow inside formulas rather than forcing the whole viewport wider.

## Elevation & Depth

The custom work surfaces are flat: white and softly tinted fills, thin borders, and ruled divisions establish hierarchy without card shadows. Today’s practice has a pale blue fill; learning asides and explorer controls are largely unboxed. Transient library controls may retain their component-library treatment; that does not establish a shadow vocabulary for the main workspace.

State transitions use (160ms) for color, background, and border changes. No entrance animation is established. Reduced-motion preference disables transitions and animations. Keyboard focus uses a visible blue outline (3px) with an offset (3px), rather than elevation.

**The Ruled Surface Rule.** Separate related working areas with a border or tone before adding another elevated container.

## Shapes

Controls have modest rounded corners; badges are squarer, while the reader, panels, and workbench have slightly softer outer corners. The normative recurring radii are in the frontmatter. Row registers remain open and rectangular. Circular geometry belongs to status dots, plotted points, and mathematical diagrams. Icons are small inline SVG marks; the identity uses a simple outlined geometric symbol.

## Components

### Buttons

Compact and direct. Primary buttons use cobalt and white; light buttons use paper, navy text, and a blue-grey border; ghost buttons use transparent backgrounds and slate text. Standard controls have a minimum height of (42px); small controls use (36px) with padding (7px 11px) and type (12px). Primary hover deepens the blue; light and ghost hover introduce a pale blue wash. Disabled buttons use opacity (.45) and a disallowed cursor. Keep focus visible and action labels concrete.

### Inputs / Fields

Answer fields are white, outlined, and generously padded, with a maximum width of (410px). They inherit the surrounding type, show a cobalt caret, and retain visible focus. Disabled fields use a quiet grey fill. Small reader page inputs are compact; narrow-screen answer inputs use (16px) text. Choice rows have a blue border and pale blue fill when selected. Labels and feedback must remain explicit.

### Navigation

Horizontal text links use muted ink at rest, cobalt on hover, and a cobalt bottom rule for the active view. The active item also carries `aria-current`. Mobile retains the same conventional navigation with horizontal overflow when necessary. The skip link becomes visible on keyboard focus.

### Cards / Containers

Panels use paper, a single fine border, and the panel radius and inset in the frontmatter. Nested reading guidance can drop its surrounding border and background. Course and library entries use ruled rows; avoid converting those established lists into a repeated card grid. Practice questions reserve generous vertical separation for the formula, answer, hints, solution, and source citation.

### Chips / Tags

Small rectangular badges identify difficulty, source, and coverage. They are labels, not decorative status collections. Source badges use neutral tones; foundation tags use pale blue; evaluative and warning badges use pale amber. Meaning is written in the label rather than conveyed by color alone.

### Reader and Mathematical Instruments

The PDF reader groups the deck selector, page controls, and bookmark action in a ruled toolbar, with source actions and reading progress below. A chapter title is the first heading; the removed CHAPTER eyebrow is not part of the pattern.

The convergence instrument pairs a formula, plotted terms, slider, and live sum. Explorer plots use stable coordinate grids, explicit captions, labeled sliders, and calculated outputs. Their visual expression comes from the mathematics and direct manipulation. SVG descriptions and keyboard-operable controls remain part of the component contract.

## Do's and Don'ts

### Do:
- **Do** align navigation and working content to the shared container.
- **Do** use ruled rows for established course and source registers.
- **Do** keep mathematical notation readable and permit local formula overflow.
- **Do** pair status colors with explicit text and maintain visible keyboard focus.
- **Do** honor reduced-motion preferences and keep routine state changes brief.

### Don't:
- **Don't** use primary action color for long reading passages.
- **Don't** add shadows to every working surface.
- **Don't** turn loaded but unused font roles or generic dark-theme tokens into an approved CalcPath theme.
- **Don't** restore the removed study-station pre-heading labels or reader CHAPTER eyebrow as canonical components.
- **Don't** treat synthesized sidecar tonal ramps as production palette tokens.

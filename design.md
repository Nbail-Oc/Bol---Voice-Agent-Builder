# Bol Design System — Design Language & Token Specification (`design.md`)

> **Single Source of Truth** extracted directly from the production Bol landing page ([`app/tech-landing.js`](./app/tech-landing.js) and [`app/globals.css`](./app/globals.css)). All subsequent views (Chat, Dashboard, Agents, Settings, Voice Console) must strictly adhere to these design tokens and patterns to preserve the identical visual vibe.

---

## 1. Visual Atmosphere & Design Philosophy

The Bol landing page embodies an **Industrial Dark-Tech Developer Platform** aesthetic. It channels high-density mission-critical systems, hardware consoles, and developer observability tooling rather than consumer software.

### Core Tenets
1. **Zero-Radius Brutalism**: All primary structural elements—cards, surfaces, panels, primary buttons, input boxes, and code containers—use **`0px` border-radius**. Rounded corners are banned on structural containers.
2. **High-Contrast Monochromatic Canvas**: The foundation is absolute pitch black (`#000000`) paired with deep carbon panels (`#0a0a0a`), framed by hairline translucent white borders (`rgba(255, 255, 255, 0.145)`).
3. **Intentional Pill Exceptions**: Full capsule rounding (`border-radius: 100px`) is strictly reserved for small telemetry badges, status indicators, and chip pills (`.v-chip`).
4. **Dual-Font Typographic Discipline**:
   - **`Inter`** for human language: headlines, display statements, section titles, and primary button labels.
   - **`Geist Mono`** for all data, code, metrics, table rows, timestamps, unit labels, kickers, and telemetry.
5. **Singular Vibrant Accent**: An electric cyan/blue (`#52a8ff`) is used with laser focus for active states, live audio indicators, focus rows, and key metric units. No neon gradients or purple glows.

---

## 2. Color Palette & Token Reference

| Token Name | Hex / RGBA Value | Functional Role |
|---|---|---|
| **Canvas Background** | `#000000` | Full-page background canvas (`.dt-root`) |
| **Card / Surface Background** | `#0a0a0a` | Container surfaces, bento cards, table containers (`.dt-card`) |
| **Sidebar / Section Header Surface** | `#060606` | Inner table sidebars, table header row backgrounds (`th`) |
| **Code / Diff Background** | `#050505` | Nested diff viewers, code blocks (`.dt-diff-container`) |
| **Chip Background** | `#1f1f1f` | Status badge background (`.v-chip`) |
| **Subtle Row Background** | `#111111` | Metric list rows, regression items (`.dt-regression-row`) |
| **Rail Background** | `#1a1a1a` | Bar chart tracks and empty meters (`.dt-bar-rail`) |
| **Primary Button Fill** | `#FFFFFF` | Solid white brutalist button background (`.btn-square`) |
| **Primary Button Hover** | `#ededed` | Subtle off-white hover state for primary buttons |
| **Primary Button Text** | `#121212` | High-contrast near-black typography inside white buttons |
| **Primary Accent (Cyan Blue)** | `#52a8ff` | Focus rows, active spans, metric unit text, live wave shader |
| **Primary Accent Glow** | `rgba(82, 168, 255, 0.4)` | Subtle box-shadow glow on active progress meters |
| **Selected Row Tint** | `rgba(82, 168, 255, 0.08)` | Active background tint on selected table and event rows |
| **Success / Pass Green** | `#62c073` | Pass dots, positive delta badges, added diff rows |
| **Success Tint** | `rgba(98, 192, 115, 0.08)` | Background tint for added diff code lines |
| **Warning / Neutral Gray** | `#999999` | Neutral delta text, warning dots, secondary labels |
| **Fail / Alert Light** | `#ededed` | Failure status chips |
| **Primary Border (Structural)** | `rgba(255, 255, 255, 0.145)` | Universal 1px ring border on cards, tables, metrics, dividers |
| **Subtle Border (Dividers)** | `rgba(255, 255, 255, 0.06)` | Table row dividers, code borders, secondary separators |
| **Chip Border** | `rgba(255, 255, 255, 0.08)` | Thin outer border on telemetry chips |
| **Interactive Hover Border** | `rgba(255, 255, 255, 0.35)` | Border illumination on hovered secondary buttons |
| **Text: High Emphasis** | `#FFFFFF` | Headlines, titles, active numbers, brand logo |
| **Text: Body / Content** | `#ededed` | Standard readable content, table cell text, diff text |
| **Text: Subtext** | `#e7e7e7` | Hero explanatory paragraph text |
| **Text: Muted / Secondary** | `#999999` | Kickers, overlines, units, durations, table headers, descriptions |
| **Text: Tertiary / Disabled** | `#666666` | Footer copyright, subtle metadata, line numbers (`#444444`) |

---

## 3. Typographic Architecture & Scale

```
Inter (Headlines, Brand, Buttons, Titles)
Geist Mono (Telemetry, Code, Tables, Metrics, Numbers, Chips, Kickers)
```

### Typographic Scale Hierarchy

| Semantic Level | Font Family | Size | Weight | Tracking / Letter-Spacing | Line Height | Color |
|---|---|---|---|---|---|---|
| **Fluid Hero Headline** | `Inter` | `clamp(32px, 5vw, 60px)` | `500` (Medium) | `-2px` | `1.05` | `#FFFFFF` |
| **Large Metric Number** | `Geist Mono` | `56px` | `500` (Medium) | `-3.36px` | `1.0` | `#FFFFFF` |
| **Section Heading (H2)** | `Inter` | `32px` | `500` (Medium) | `-1.2px` | `1.2` | `#FFFFFF` |
| **Bento Card Title (H3)** | `Inter` | `20px` | `500` (Medium) | `-0.6px` | `1.25` | `#FFFFFF` |
| **Brand Title** | `Inter` | `20px` | `500` (Medium) | `-0.5px` | `1.0` | `#FFFFFF` |
| **Metric Unit Text** | `Geist Mono` | `18px` | `600` (SemiBold) | Normal | `1.0` | `#52a8ff` |
| **Nav Item Link** | `Inter` | `16px` | `400` (Regular) | Normal | `1.0` | `#FFFFFF` |
| **Hero Subtext (P)** | `Inter` | `16px` | `400` (Regular) | Normal | `1.6` | `#e7e7e7` |
| **Bento Card Description** | `Inter` | `14px` | `400` (Regular) | Normal | `1.55` | `#999999` |
| **Secondary Button Link** | `Geist Mono` | `14px` | `400` (Regular) | Normal | `1.0` | `#999999` |
| **Primary Button Text** | `Inter` | `14px` (`20px` on CTA) | `500` (Medium) | Normal | `1.0` | `#121212` |
| **Active Nav Badge** | `Geist Mono` | `13px` | `400` (Regular) | Normal | `1.0` | `#52a8ff` |
| **Metric Card Description**| `Inter` | `13px` | `400` (Regular) | Normal | `1.5` | `#999999` |
| **Table Body Text** | `Geist Mono` | `13px` | `400` (Regular) | Normal | `1.4` | `#ededed` |
| **Code / Span Identifier** | `Geist Mono` | `12.5px` | `400` (Regular) | Normal | `1.0` | `#FFFFFF` |
| **Chip Text (`.v-chip`)** | `Geist Mono` | `12px` | `400` (Regular) | `+0.04em` | `1.0` | `#999999` |
| **Table Header (`th`)** | `Geist Mono` | `11px` | `500` (Medium) | `+0.06em` | `1.0` | `#999999` |
| **Technical Kicker** | `Geist Mono` | `11px` | `400` (Regular) | `+0.08em` | `1.0` | `#999999` |
| **Code Diff Line** | `Geist Mono` | `11px` | `400` (Regular) | Normal | `1.8` | Variable |
| **Footer Fine Print** | `Geist Mono` | `11px` | `400` (Regular) | Normal | `1.0` | `#666666` |

---

## 4. Border Radius & Structural Geometry

Bol follows an explicit **dual-geometry policy**:

```
CONTAINERS & BUTTONS   ──>  0px (Razor-sharp square brutalism)
TELEMETRY & BADGES     ──>  100px (Capsule pill)
STATUS INDICATOR DOTS  ──>  50% (Circular point)
TIMELINE PROGRESS BARS ──>  2px (Micro-radius)
```

- **Cards (`.dt-card`)**: `border-radius: 0px`
- **Primary Buttons (`.btn-square`)**: `border-radius: 0px !important`
- **Secondary Buttons (`.dt-sub-link`)**: `border-radius: 0px`
- **Input Fields & Textareas**: `border-radius: 0px`
- **Status Chips (`.v-chip`)**: `border-radius: 100px !important`
- **Indicator Dots (`.v-chip-dot`, `.dt-span-indicator-dot`)**: `border-radius: 50%` (`6px × 6px`)
- **Horizontal Progress Sliders (`.timeline-progress-bar`)**: `border-radius: 2px` (`height: 6px`)

---

## 5. Component Behavior & Interaction Specs

### 5.1 Primary Button (`.btn-square`)
- **Appearance**: Solid white (`#FFFFFF`) with dark charcoal text (`#121212`), no border, `0px` border radius.
- **Icon**: Embedded 45-degree arrow icon (`M7 17L17 7M17 7H7M17 7V17`), `width: 12px`, `height: 12px`, `stroke-width: 2.5`.
- **Standard Sizing**: `padding: 8px 12px; font-size: 14px; gap: 8px;`
- **Large CTA Sizing (`.dt-cta-large`)**: `padding: 14px 28px !important; font-size: 20px !important;`
- **Hover State**: `background: #ededed !important; transition: background 0.15s ease, opacity 0.15s ease;`
- **Active State**: Instant tactile depress (`transform: scale(0.99)`).

### 5.2 Secondary / Telemetry Action (`.dt-sub-link`)
- **Appearance**: Transparent background, bordered by `1px solid rgba(255, 255, 255, 0.145)`.
- **Typography**: `Geist Mono`, `14px`, text color `#999999`.
- **Padding**: `12px 18px`.
- **Hover State**: Border lights up to `rgba(255, 255, 255, 0.35)` and text shifts to `#FFFFFF`.

### 5.3 Status Chip Pill (`.v-chip`)
- **Appearance**: Pill container with `background: #1f1f1f; border-radius: 100px !important; border: 1px solid rgba(255, 255, 255, 0.08); padding: 4px 10px;`.
- **Typography**: `Geist Mono`, `12px`, uppercase, tracking `+0.04em`, color `#999999`.
- **Indicator Dot**: `6px × 6px` circle (`border-radius: 50%`):
  - `.pass` → `#62c073` (Emerald Green)
  - `.blue` → `#52a8ff` (Electric Cyan)
  - `.warn` → `#999999` (Neutral Gray)
  - `.fail` → `#ededed` (Off White)

### 5.4 Bento Grid Cards (`.dt-bento-card`)
- **Layout**: 3-column equal grid (`gap: 20px`).
- **Internal Spacing**: `padding: 28px; display: flex; flex-direction: column;`.
- **Card Top**: Flex row with kicker on left (`11px Geist Mono #999999`) and badge on right.
- **Card Content**:
  - Title: `20px Inter, weight 500, #FFFFFF`.
  - Subtitle: `14px Inter, line-height 1.55, #999999`.
  - Sub-elements (Regression lists, bar stacks, diff blocks) pinned to bottom (`margin-top: auto;`).

### 5.5 Event Stream & Split Telemetry Table
- **Layout**: 2-column split grid: Left sidebar fixed at `240px`, right table taking remaining space (`1fr`).
- **Sidebar**: Darker surface `#060606` with right border `1px solid rgba(255, 255, 255, 0.145)`.
- **Selected State (`.selected`, `.dt-tr-focus`)**:
  - Background: `rgba(82, 168, 255, 0.08)`.
  - Left border highlight: `border-left: 2px solid #52a8ff`.
- **Timeline Progress Bar**:
  - Track: `height: 6px; background: transparent;`.
  - Bar: Focused bar is `#52a8ff` with `box-shadow: 0 0 10px rgba(82, 168, 255, 0.6)`. Unfocused bar is `rgba(255, 255, 255, 0.18)`.

### 5.6 Connected Metrics Grid (`.dt-metrics-card`)
- **Layout**: 4-column connected grid where each cell is divided by a right border: `border-right: 1px solid rgba(255, 255, 255, 0.145)`.
- **Cell Padding**: `36px 28px`.
- **Metric Stack**:
  1. Kicker: `11px Geist Mono #999999`, tracking `+0.08em`, uppercase.
  2. Large Number Row: `56px Geist Mono #FFFFFF`, tracking `-3.36px` + Unit text (`18px Geist Mono #52a8ff`).
  3. Description: `13px Inter #999999`, line-height `1.5`.

---

## 6. Layout, Spacing & Container Hierarchy

### Standard Widths & Containers
- **Master Section Max-Width**: `max-width: 1320px; width: 100%; margin: 0 auto;`
- **Headline Max-Width**: `max-width: 752px;`
- **Subtext Max-Width**: `max-width: 620px;`
- **Footer Description Max-Width**: `max-width: 440px;`

### Section Spacing System
- **Hero Section**:
  - Desktop: `min-height: 100svh; padding: 140px 56px 80px;`
  - Tablet (`<= 1024px`): `padding: 120px 28px 60px;`
  - Mobile (`<= 720px`): `padding: 100px 20px 50px;`
- **Standard Content Section (`.dt-section`)**:
  - Desktop: `padding: 60px 56px 80px;`
  - Tablet (`<= 1024px`): `padding: 40px 28px 60px;`
  - Mobile (`<= 720px`): `padding: 30px 20px 50px;`
- **Header Positioning**:
  - Desktop: Absolute top `38px`, horizontal padding `56px`.
  - Tablet: Absolute top `24px`, horizontal padding `28px`.
  - Mobile: Absolute top `20px`, horizontal padding `20px`.
- **Header Nav Gap**: `32px` between nav items.

### Responsive Breakpoints
1. **Desktop (`> 1024px`)**:
   - 3-column Bento grid.
   - 4-column continuous metrics strip.
   - 240px sidebar + table split view.
   - Horizontal nav menu active.
2. **Tablet (`721px - 1024px`)**:
   - Header links collapse to hamburger icon.
   - Bento grid collapses to 1 column (`grid-template-columns: 1fr`).
   - Metrics grid collapses to 2×2 grid (`grid-template-columns: repeat(2, 1fr)`).
3. **Mobile (`<= 720px`)**:
   - Split table collapses to vertical stack (sidebar on top, table below).
   - Metrics grid collapses to single column (`1fr`) with stacked horizontal dividers.
   - Hero CTA wrap stacks vertically (`flex-direction: column; width: 100%;`).

---

## 7. Motion, Shaders & Background Rules

### WebGL Dot Matrix Shader (`predictive-arc-03`)
- **Technology**: Real-time WebGL fragment shader with 2D Canvas fallback.
- **Wave Mathematics**: Two-harmonic scrolling sine wave:
  $$y_{\text{curve}} = \sin(nx \cdot 2.8 + t \cdot 0.8) \cdot 0.22 + \sin(nx \cdot 5.6 - t \cdot 0.5) \cdot 0.11$$
- **Pointer Interaction**: Bends toward mouse position in real-time using exponential decay:
  $$\text{pull} = e^{-|nx - \text{mouse}_x| \cdot 3.5} \cdot (\text{mouse}_y - y_{\text{base}}) \cdot 0.55$$
- **Dot Swell**: Base dot radius $1.25\text{px}$, swelling up to $7.0\text{px}$ near the curve apex.
- **Color Transition**: Dark navy grid dots (`#1e2433`) $\rightarrow$ Electric blue (`#52a8ff`) $\rightarrow$ Pure luminous white core (`#f5faff`) with an $8\text{Hz}$ traveling shimmer wave.
- **Scrim Vignette (`.dt-hero-scrim-arc`)**:
  ```css
  background: radial-gradient(circle at 50% 45%, transparent 25%, rgba(0, 0, 0, 0.45) 75%, #000000 100%),
              linear-gradient(to bottom, transparent 65%, #000000 100%);
  ```

---

## 8. Anti-Patterns — What is Explicitly Banned

To maintain the landing page's signature vibe, the following patterns are **strictly prohibited** across all other views:
- ❌ **No Rounded Buttons**: Never use `rounded-md`, `rounded-lg`, or `rounded-full` on buttons. Buttons are always `0px`.
- ❌ **No Pastel / Warm Colors**: No cream, beige, warm grays (`#f7f6f2`), or purple tints. Stick to pure black `#000000` and carbon `#0a0a0a`.
- ❌ **No Neon AI Purple Gradients**: No purple glow cards or iridescent multi-color gradient buttons.
- ❌ **No Default Emojis**: Status and indicators must use monospace text, Lucide stroke icons, or status dots (`.v-chip-dot`).
- ❌ **No Random Font Sizes**: Stick to the defined typography table (e.g. `56px` for metrics, `32px` for H2s, `20px` for titles, `14px` for body/subs, `11px` for kickers).
- ❌ **No Heavy Soft Shadows**: No fuzzy, high-blur box-shadows. Elevation is expressed through `1px solid rgba(255, 255, 255, 0.145)` ring borders.

---

## 9. Developer Cheat Sheet — Reusable CSS & HTML Patterns

### 1. Section Header Pattern
```html
<div class="dt-section-top">
  <div class="dt-section-title-group">
    <span class="v-chip">
      <span class="v-chip-dot blue"></span>
      <span>SYSTEM TELEMETRY</span>
    </span>
    <h2 class="dt-section-h2">Your Section Title</h2>
  </div>
  <div class="dt-header-chips">
    <span class="v-chip">
      <span class="v-chip-dot pass"></span>
      <span>ONLINE</span>
    </span>
  </div>
</div>
```

### 2. Standard Card Pattern
```html
<div class="dt-card" style="padding: 28px;">
  <span class="dt-bento-card-kicker">CONFIGURATION</span>
  <h3 class="dt-bento-card-title">Panel Heading</h3>
  <p class="dt-bento-card-sub">Panel description text in muted gray.</p>
  <!-- Content here -->
</div>
```

### 3. Primary Button Pattern
```html
<button class="btn-square dt-cta-large">
  <span>Execute Pipeline</span>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
</button>
```

### 4. Secondary Action Pattern
```html
<a href="#details" class="dt-sub-link">
  <span>View Raw Telemetry</span>
</a>
```

### 5. Metric Cell Pattern
```html
<div class="dt-metrics-cell">
  <span class="dt-metrics-kicker">TRANSCRIPTION LATENCY</span>
  <div class="dt-metrics-num-row">
    <span class="dt-metric-large-number">84</span>
    <span class="dt-metric-unit-text">MS</span>
  </div>
  <p class="dt-metrics-desc">Sub-second speech-to-text decoding delay.</p>
</div>
```


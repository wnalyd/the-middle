# The Middle — Design & Code Cleanup Spec

## Overview

Clean up The Middle (a bridge-track finder for radio DJs) for Netlify deployment as a portfolio demo. This covers a visual redesign, code hygiene, and the API architecture change needed for static hosting.

## Design

### Direction

Record-store brutalist. Full monospace, high contrast, dense. Amber CRT monochrome palette — like an old phosphor monitor.

### Color Palette

All on background `#1a1200` (warm near-black):

| Token | Value | Ratio | Use |
|-------|-------|-------|-----|
| `--color-primary` | `#ffb000` | 8.5:1 AAA | Titles, bar fills, CTA button, header rule |
| `--color-secondary` | `#cc8d00` | 5.6:1 AA | Meta text, descriptions, labels, tags, scale labels |
| `--color-bg` | `#1a1200` | — | Page background |
| `--color-bg-raised` | `#211800` | — | Confirmed song inputs, subtle elevation |
| `--color-border` | `#5c4000` | — | Card borders, input borders, buttons |
| `--color-border-subtle` | `#3d2a00` | — | Internal dividers (description separator, results header) |
| `--color-bar-off` | `#2a1e00` | — | Empty bar segments |

No text color below 4.5:1 contrast ratio (WCAG AA minimum). The previous `#a07000` is eliminated from text use.

### Typography

- **Font**: System monospace stack — `'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace`
- **Titles**: 15-16px, weight 700, uppercase, tight letter-spacing
- **Meta/body**: 11-12px, `--color-secondary`
- **Labels**: 9-10px, uppercase, wider letter-spacing
- No `system-ui` or sans-serif anywhere

### Result Cards

- Uniform `1px solid var(--color-border)` on all sides
- Subtle offset shadow: `3px 3px 0 rgba(255,176,0,0.06)`
- No visual distinction for #1 result — rank number alone differentiates
- No colored left-border accent

### Score Bars

- **Layout**: Vertical stack, one row per dimension
- **Bars**: Five gapped segments (4px gap), 6px tall
- **Filled segments**: `--color-primary`
- **Empty segments**: `--color-bar-off`
- **Scale labels**: Flanking the bar on the same row. Left label = low end, right label = high end
- **No numeric values displayed** — segments communicate the scale visually
- **Accessibility**: `role="meter"` with `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on each bar container
- **Scale endpoints**:
  - Energy: still → sparkling
  - Mood: dour → elated
  - Tempo: slow → fast
  - Genre shift: close → wild
- **Texture**: Row of bordered tags below the bars (unchanged pattern, new colors)

### Confirmed Song State

- Background shifts to `--color-bg-raised` (#211800)
- "locked" indicator next to the Song A / Song C label
- "change" button in `--color-secondary` with border

### System Prompt Update

Change the Energy scale high-end label from "hi-nrg" to "sparkling" in the system prompt's scoring dimensions section. The numeric 1-5 scale and anchor examples remain unchanged.

## Code Changes

### 1. Netlify Function for API Proxying

Replace the Vite dev server proxy with a Netlify Function that proxies both the Anthropic API and Last.fm API.

**`netlify/functions/api.js`** (or similar):
- Accepts POST requests for Anthropic (`/api/anthropic/v1/messages`)
- Accepts GET requests for Last.fm (`/api/lastfm?method=...&track=...`)
- Reads `ANTHROPIC_API_KEY` and `LASTFM_API_KEY` from environment variables
- Forwards requests, attaches auth headers server-side, returns responses
- Basic error handling (non-200 upstream → return error to client)

**`netlify.toml`**:
- Redirect rules mapping `/api/anthropic/*` and `/api/lastfm` to the function
- Build command: `npm run build`
- Publish directory: `dist`

**`vite.config.js`**:
- Remove the proxy configuration and hardcoded API key entirely
- Keep the dev proxy pointing to localhost Netlify Functions (via `netlify dev`) or remove entirely if developing with `netlify dev`

**Client code (`App.jsx`)**:
- Remove the hardcoded `LASTFM_API_KEY` constant
- Update `searchTracks`, `getTrackInfo`, `getSimilarTracks` to call `/api/lastfm?method=...` instead of hitting Last.fm directly
- Anthropic call already goes to `/api/anthropic/v1/messages` — no change needed there

### 2. Move Inline Styles to CSS

Extract all inline `style={{}}` props from `App.jsx` components into class-based CSS in `App.css`. The mockup CSS is the reference for class naming and structure.

### 3. Remove Dead Code

- **`App.css`**: Delete all existing content (hero, counter, ticks, #center, #next-steps, #spacer — all Vite template leftovers). Replace with the new styles.
- **`index.css`**: Replace the full light/dark variable system with the amber palette variables. Remove the `prefers-color-scheme: dark` media query — this is a single-theme app.
- **`src/assets/`**: Delete `react.svg`, `vite.svg`, `hero.png` — unused.

### 4. Clean Up Markup

- Remove any leftover template markup references
- The `public/icons.svg` spritesheet (Bluesky, Discord, GitHub, X icons) may be unused — verify and remove if so
- `public/favicon.svg` stays (it's the app's bolt icon)

## Out of Scope

- Component decomposition — single `App.jsx` is fine for a portfolio demo
- Light mode / theme switching
- Mobile-specific layout changes (existing responsive behavior is adequate)
- New features or functionality changes
- TypeScript migration

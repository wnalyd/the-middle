# The Middle — Design & Code Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up The Middle for Netlify deployment — amber CRT redesign, CSS extraction, API proxy via Netlify Functions, dead code removal.

**Architecture:** Single-file React app stays as-is. Inline styles move to CSS classes. Vite dev proxy replaced by Netlify Functions for both Anthropic and Last.fm APIs. Amber monochrome palette replaces the old light/dark theme.

**Tech Stack:** React 19, Vite 8, Netlify Functions, Last.fm API, Anthropic API

**Spec:** `docs/superpowers/specs/2026-03-28-design-cleanup-spec.md`

---

### Task 1: Delete Dead Assets and Template Code

**Files:**
- Delete: `src/assets/react.svg`
- Delete: `src/assets/vite.svg`
- Delete: `src/assets/hero.png`
- Delete: `public/icons.svg`

- [ ] **Step 1: Delete unused files**

```bash
rm src/assets/react.svg src/assets/vite.svg src/assets/hero.png public/icons.svg
```

- [ ] **Step 2: Verify no imports reference deleted files**

```bash
grep -r "react\.svg\|vite\.svg\|hero\.png\|icons\.svg" src/
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add -u
git commit -m "chore: remove unused Vite template assets and icons spritesheet"
```

---

### Task 2: Replace index.css with Amber Palette

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css` with the amber theme**

```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-primary: #ffb000;
  --color-secondary: #cc8d00;
  --color-bg: #1a1200;
  --color-bg-raised: #211800;
  --color-border: #5c4000;
  --color-border-subtle: #3d2a00;
  --color-bar-off: #2a1e00;

  --font-mono: 'SF Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
}

body {
  margin: 0;
  padding: 0;
  background: var(--color-bg);
  color: var(--color-primary);
  font-family: var(--font-mono);
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 2: Verify the app still loads**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: replace light/dark theme with amber CRT palette"
```

---

### Task 3: Rewrite App.css with New Component Styles

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Replace `src/App.css` entirely**

Delete all existing content and write:

```css
/* ── Layout ── */
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* ── Header ── */
.header {
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 14px;
  margin-bottom: 28px;
}

.header h1 {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  margin: 0;
}

.header-sub {
  font-size: 10px;
  color: var(--color-secondary);
  letter-spacing: 0.1em;
  margin-top: 3px;
  text-transform: uppercase;
}

/* ── Input Row ── */
.input-row {
  display: grid;
  grid-template-columns: 1fr 32px 1fr;
  margin-bottom: 16px;
}

.input-box {
  border: 1px solid var(--color-border);
  padding: 16px;
}

.input-box-left {
  border-right: none;
}

.input-box-right {
  border-left: none;
}

.input-bridge {
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-raised);
  font-size: 14px;
  color: var(--color-secondary);
}

.input-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
  margin-bottom: 10px;
}

.lock-indicator {
  font-size: 9px;
  color: var(--color-secondary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-left: 6px;
}

/* ── Song Search ── */
.search-input {
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  width: 100%;
  padding: 6px 0;
  outline: none;
  letter-spacing: 0.02em;
}

.search-input::placeholder {
  color: var(--color-secondary);
}

.search-loading {
  font-size: 11px;
  color: var(--color-secondary);
  margin-top: 6px;
}

.search-dropdown {
  position: absolute;
  z-index: 100;
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin-top: 4px;
  box-shadow: 3px 3px 0 rgba(255, 176, 0, 0.06);
}

.search-result {
  padding: 9px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-subtle);
}

.search-result:last-child {
  border-bottom: none;
}

.search-result:hover {
  background: var(--color-bg-raised);
}

.search-result-name {
  font-size: 13px;
  color: var(--color-primary);
}

.search-result-artist {
  font-size: 11px;
  color: var(--color-secondary);
  margin-top: 2px;
}

/* ── Confirmed Song ── */
.confirmed {
  background: var(--color-bg-raised);
}

.confirmed-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-primary);
  line-height: 1.3;
}

.confirmed-meta {
  font-size: 11px;
  color: var(--color-secondary);
  margin-top: 4px;
}

.confirmed-tags {
  font-size: 9px;
  color: var(--color-secondary);
  margin-top: 6px;
  letter-spacing: 0.06em;
}

.change-btn {
  font-size: 9px;
  color: var(--color-secondary);
  background: none;
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  margin-top: 10px;
  cursor: pointer;
  font-family: var(--font-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.change-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* ── Find Button ── */
.find-btn {
  width: 100%;
  padding: 12px;
  background: var(--color-primary);
  color: var(--color-bg);
  border: none;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  margin-bottom: 8px;
}

.find-btn:hover {
  background: #ffc233;
}

.find-btn:disabled {
  background: var(--color-border-subtle);
  color: var(--color-border);
  cursor: default;
}

.flow-label {
  font-size: 9px;
  color: var(--color-secondary);
  letter-spacing: 0.12em;
  text-align: center;
  margin-bottom: 32px;
  text-transform: uppercase;
}

/* ── Results Header ── */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.results-count {
  font-size: 10px;
  color: var(--color-secondary);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.results-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  font-size: 9px;
  color: var(--color-secondary);
  background: none;
  border: 1px solid var(--color-border);
  padding: 4px 10px;
  cursor: pointer;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.action-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* ── Result Card ── */
.result-card {
  border: 1px solid var(--color-border);
  box-shadow: 3px 3px 0 rgba(255, 176, 0, 0.06);
  margin-bottom: 14px;
}

.result-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.result-rank {
  font-size: 10px;
  color: var(--color-secondary);
  letter-spacing: 0.12em;
  margin-bottom: 6px;
}

.result-title {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.25;
}

.result-meta {
  font-size: 11px;
  color: var(--color-secondary);
  margin-top: 4px;
}

/* ── Score Bars ── */
.scores {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-row {
  display: flex;
  align-items: center;
}

.scale-label {
  font-size: 9px;
  color: var(--color-secondary);
  width: 56px;
  letter-spacing: 0.06em;
}

.scale-label-l {
  text-align: right;
  padding-right: 10px;
}

.scale-label-r {
  padding-left: 10px;
}

.bar-segs {
  display: flex;
  gap: 4px;
  flex: 1;
}

.seg {
  height: 6px;
  flex: 1;
}

.seg-on {
  background: var(--color-primary);
}

.seg-off {
  background: var(--color-bar-off);
}

/* ── Texture Tags ── */
.texture-tags {
  padding: 0 16px 14px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.texture-tag {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--color-secondary);
  letter-spacing: 0.08em;
  border: 1px solid var(--color-border);
  padding: 2px 7px;
}

/* ── Description ── */
.result-desc {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-subtle);
  font-size: 12px;
  color: var(--color-secondary);
  line-height: 1.55;
}

/* ── Loading State ── */
.loading-container {
  padding: 32px 0;
  text-align: center;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-subtle);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-steps {
  list-style: none;
  padding: 0;
}

.loading-step {
  font-size: 12px;
  padding: 3px 0;
}

.loading-step-done {
  color: var(--color-primary);
}

.loading-step-active {
  color: var(--color-primary);
  font-weight: 700;
}

.loading-step-pending {
  color: var(--color-border);
}

/* ── Error State ── */
.error-container {
  padding: 20px 18px;
  text-align: center;
  border: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.error-message {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.error-retry {
  font-size: 11px;
  color: var(--color-secondary);
  background: none;
  border: 1px solid var(--color-border);
  padding: 5px 12px;
  cursor: pointer;
  font-family: var(--font-mono);
  margin-top: 8px;
}

.error-retry:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: succeeds (CSS is valid, just not consumed by JSX yet).

- [ ] **Step 3: Commit**

```bash
git add src/App.css
git commit -m "feat: rewrite App.css with amber brutalist component styles"
```

---

### Task 4: Rewrite App.jsx — Remove Inline Styles, Apply CSS Classes

**Files:**
- Modify: `src/App.jsx`

This is the largest task. It rewrites every component in App.jsx to use CSS classes instead of inline styles, updates the markup structure to match the mockup, and updates the system prompt. No logic changes — only presentation.

- [ ] **Step 1: Update the system prompt**

In the `SYSTEM_PROMPT` constant, find the line:

```
- 5: "Blitzkrieg Bop" by The Ramones. Full throttle from the first beat, no restraint.
```

And change the Energy scale high-end label that appears in the output format section. Search for `"hi-nrg"` — it does not appear literally in the system prompt, so no change needed there. The label change is UI-only; the system prompt uses full descriptions, not short labels.

Actually — verify: search the system prompt for any short label references. The system prompt uses descriptive anchors, not the short UI labels. No system prompt change needed for the label rename.

- [ ] **Step 2: Remove the `LASTFM_API_KEY` and `LASTFM_BASE` constants**

Delete these two lines at the top of App.jsx:

```javascript
const LASTFM_API_KEY = "REDACTED";
const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/";
```

- [ ] **Step 3: Rewrite the Last.fm API functions to use the proxy**

Replace the three functions (`searchTracks`, `getTrackInfo`, `getSimilarTracks`) with:

```javascript
async function searchTracks(query) {
  if (!query || query.length < 2) return [];
  const url = `/api/lastfm?method=track.search&track=${encodeURIComponent(query)}&format=json&limit=5`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.results?.trackmatches?.track || [];
  } catch { return []; }
}

async function getTrackInfo(artist, title) {
  const url = `/api/lastfm?method=track.getInfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.track || null;
  } catch { return null; }
}

async function getSimilarTracks(artist, title) {
  const url = `/api/lastfm?method=track.getSimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json&limit=30`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.similartracks?.track || [];
  } catch { return []; }
}
```

- [ ] **Step 4: Rewrite the `Pips` component as `SegmentedBar`**

Replace the `Pips` component with:

```jsx
function SegmentedBar({ value, max = 5, label, low, high }) {
  return (
    <div className="score-row">
      <span className="scale-label scale-label-l">{low}</span>
      <div
        className="bar-segs"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={1}
        aria-valuemax={max}
      >
        {Array.from({ length: max }).map((_, i) => (
          <div key={i} className={`seg ${i < value ? "seg-on" : "seg-off"}`} />
        ))}
      </div>
      <span className="scale-label scale-label-r">{high}</span>
    </div>
  );
}
```

- [ ] **Step 5: Delete the `ScoreItem` component**

Remove the entire `ScoreItem` function — it's replaced by `SegmentedBar`.

- [ ] **Step 6: Rewrite the `SongSearch` component markup**

Replace all inline `style={{}}` props with CSS classes. The full rewrite:

```jsx
function SongSearch({ label, onConfirm, confirmed, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery || confirmed) { setResults([]); setOpen(false); return; }
    setLoading(true);
    searchTracks(debouncedQuery).then(r => {
      setResults(r);
      setOpen(r.length > 0);
      setLoading(false);
    });
  }, [debouncedQuery, confirmed]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSelect(track) {
    setOpen(false);
    setQuery(`${track.artist} — ${track.name}`);
    const info = await getTrackInfo(track.artist, track.name);
    onConfirm({
      title: track.name,
      artist: track.artist,
      album: info?.album?.title || null,
      year: info?.wiki?.published ? info.wiki.published.split(" ")[2]?.replace(",", "") : null,
      tags: info?.toptags?.tag?.map(t => t.name) || [],
    });
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear();
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <div className="input-label">
        {label}
        {confirmed && <span className="lock-indicator">locked</span>}
      </div>

      {confirmed ? (
        <div>
          <div className="confirmed-title">{confirmed.title}</div>
          <div className="confirmed-meta">
            {confirmed.artist}{confirmed.album ? ` · ${confirmed.album}` : ""}
          </div>
          {confirmed.tags.length > 0 && (
            <div className="confirmed-tags">
              {confirmed.tags.slice(0, 4).join(" · ")}
            </div>
          )}
          <button onClick={handleClear} className="change-btn">change</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Artist — Title"
            className="search-input"
          />
          {loading && <div className="search-loading">searching...</div>}
          {open && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((track, i) => (
                <div key={i} onClick={() => handleSelect(track)} className="search-result">
                  <div className="search-result-name">{track.name}</div>
                  <div className="search-result-artist">{track.artist}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Rewrite the `ResultCard` component markup**

```jsx
function ResultCard({ result, rank }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-rank">{String(rank).padStart(2, "0")}</div>
        <div className="result-title">{result.title}</div>
        <div className="result-meta">
          {result.artist}{result.album ? ` · ${result.album}` : ""}
          {result.year ? ` · ${result.year}` : ""}
        </div>
      </div>

      <div className="scores">
        <SegmentedBar value={result.energy} label="Energy" low="still" high="sparkling" />
        <SegmentedBar value={result.mood} label="Mood" low="dour" high="elated" />
        <SegmentedBar value={result.tempo} label="Tempo" low="slow" high="fast" />
        <SegmentedBar value={result.genre_shift} label="Genre shift" low="close" high="wild" />
      </div>

      {result.texture?.length > 0 && (
        <div className="texture-tags">
          {result.texture.map((tag, i) => (
            <span key={i} className="texture-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="result-desc">{result.description}</div>
    </div>
  );
}
```

- [ ] **Step 8: Rewrite the `LoadingState` component markup**

```jsx
function LoadingState({ step }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <ul className="loading-steps">
        {LOADING_STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <li key={i} className={`loading-step loading-step-${state}`}>
              {state === "done" ? "✓  " : state === "active" ? "→  " : "·  "}{s}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 9: Rewrite the `TheMiddle` (main) component render**

Replace the return JSX of the `TheMiddle` component with:

```jsx
return (
  <div className="page">
    <div className="header">
      <h1>The Middle</h1>
      <div className="header-sub">Bridge Track Finder</div>
    </div>

    <div className="input-row">
      <div className={`input-box input-box-left${songA ? " confirmed" : ""}`}>
        <SongSearch label="Song A" confirmed={songA} onConfirm={setSongA} onClear={() => { setSongA(null); handleTryAgain(); }} />
      </div>
      <div className="input-bridge">?</div>
      <div className={`input-box input-box-right${songC ? " confirmed" : ""}`}>
        <SongSearch label="Song C" confirmed={songC} onConfirm={setSongC} onClear={() => { setSongC(null); handleTryAgain(); }} />
      </div>
    </div>

    <button
      disabled={!bothConfirmed || status === "loading"}
      onClick={handleFind}
      className="find-btn"
    >
      {status === "loading" ? "Finding..." : "Find the Middle"}
    </button>
    <div className="flow-label">A plays · B bridges · C plays</div>

    {status === "loading" && <LoadingState step={loadingStep} />}

    {status === "error" && (
      <div className="error-container">
        <div className="error-message">{errorMsg}</div>
        <button onClick={handleTryAgain} className="error-retry">Try again</button>
      </div>
    )}

    {status === "results" && (
      <>
        <div className="results-header">
          <span className="results-count">
            {results.length} suggestion{results.length !== 1 ? "s" : ""}
          </span>
          <div className="results-actions">
            <button onClick={handleTryAgain} className="action-btn">try again</button>
            <button onClick={handleReset} className="action-btn">new search</button>
          </div>
        </div>
        {results.map((r, i) => (
          <ResultCard key={i} result={r} rank={r.rank || i + 1} />
        ))}
      </>
    )}
  </div>
);
```

- [ ] **Step 10: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 11: Commit**

```bash
git add src/App.jsx
git commit -m "feat: rewrite App.jsx — CSS classes, amber theme, segmented bars, proxy API calls"
```

---

### Task 5: Create Netlify Function for API Proxying

**Files:**
- Create: `netlify/functions/api.js`
- Create: `netlify.toml`
- Modify: `vite.config.js`

- [ ] **Step 1: Create `netlify/functions/api.js`**

```javascript
export default async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Last.fm proxy
  if (path === "/api/lastfm") {
    const params = new URLSearchParams(url.search);
    params.set("api_key", process.env.LASTFM_API_KEY);
    const lfUrl = `https://ws.audioscrobbler.com/2.0/?${params.toString()}`;

    try {
      const res = await fetch(lfUrl);
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Last.fm request failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Anthropic proxy
  if (path.startsWith("/api/anthropic/")) {
    const anthropicPath = path.replace(/^\/api\/anthropic/, "");
    const anthropicUrl = `https://api.anthropic.com${anthropicPath}`;

    try {
      const body = await req.text();
      const res = await fetch(anthropicUrl, {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: req.method !== "GET" ? body : undefined,
      });

      const responseBody = await res.text();
      return new Response(responseBody, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Anthropic request failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Not found", { status: 404 });
};

export const config = {
  path: ["/api/lastfm", "/api/anthropic/*"],
};
```

- [ ] **Step 2: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

- [ ] **Step 3: Rewrite `vite.config.js`**

Remove all proxy config and the hardcoded API key:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/api.js netlify.toml vite.config.js
git commit -m "feat: add Netlify Function for Anthropic + Last.fm API proxying, remove hardcoded keys"
```

---

### Task 6: Final Cleanup and Verification

**Files:**
- Delete: `src/.DS_Store`
- Modify: `.gitignore`

- [ ] **Step 1: Remove .DS_Store from src**

```bash
rm -f src/.DS_Store
```

- [ ] **Step 2: Verify .DS_Store is in .gitignore**

Check that `.DS_Store` is listed in `.gitignore` (it is — confirmed in earlier read).

- [ ] **Step 3: Remove `main.jsx` import of unused index.css**

Verify `main.jsx` imports `./index.css` — it does and should continue to. No change needed.

- [ ] **Step 4: Full build and lint check**

```bash
npm run build && npm run lint
```

Expected: both pass.

- [ ] **Step 5: Verify no secrets remain in source**

```bash
grep -r "sk-ant-api03\|REDACTED" src/ vite.config.js netlify/ public/ index.html
```

Expected: no matches.

- [ ] **Step 6: Commit any remaining changes**

```bash
git add -u
git status
```

If there are staged changes:

```bash
git commit -m "chore: final cleanup — remove .DS_Store, verify no secrets in source"
```

import { useState, useEffect, useRef } from "react";
import './App.css';

const SYSTEM_PROMPT = `You are a music knowledge assistant for a radio DJ tool called The Middle. Your job is to identify a bridge track — Song B — that fits musically between two songs: Song A (which plays first) and Song C (which plays after).

You are not a search engine. You are a music expert. You reason carefully about musical relationships. You do not guess. You do not invent songs. Every track you suggest must be a real, released recording by a real artist. If you are not certain a track exists, do not suggest it.

Your goal is a transition the listener accepts without being jarred. Even when the genre shift is significant, the bridge should make the listener think "huh, that works" — not "what just happened." The bridge earns the transition. It does not just sit between two numbers on a scale.

The audience for this tool is a radio DJ playing music for people who are musical omnivores — listeners who know and love music across genres, eras, and styles. The goal is not comfort. The goal is interest. A surprising bridge that works is better than a predictable bridge that merely fits. Do not default to the obvious choice.

YOUR KNOWLEDGE STANDARD

You know a track well enough to assess it if you can answer yes to all three of these:
- You know who recorded it and when
- You can describe its feel, tempo, and emotional register with confidence
- You have reliable detailed knowledge of it — not just that it exists

If any of these are uncertain, say so. Do not estimate. Do not infer from an artist's general style. A track you are uncertain about is not a candidate and must not appear in results.

SCORING DIMENSIONS

Score each track across the following dimensions on a scale of 1 to 5.

Energy — the drive, momentum, and physical intensity of the track.
- 1: "Weightless" by Marconi Union. No pulse, no drive, near-zero momentum.
- 2.5: "Amarillo by Morning" by George Strait. Gentle forward movement, no urgency.
- 3.5: "Everybody Wants to Rule the World" by Tears for Fears. Moderate drive, propulsive but not aggressive.
- 5: "Blitzkrieg Bop" by The Ramones. Full throttle from the first beat, no restraint.

Mood — the emotional register of the track. When lyrics and music pull in different directions, the emotional content of the lyrics determines whether the score sits below or above 3. Music governs all other scoring.
- 1: First movement of Górecki's Symphony No. 3. Pure grief, no anger, no pulse.
- 1-2 zone: "Hurt" by Johnny Cash. Sad, heavy, resigned. Angry and sad tracks both belong here — Nine Inch Nails belongs here alongside Cash.
- 3: "Blue Monday" by New Order, or "Building Steam with a Grain of Salt" by DJ Shadow. Neither sad nor happy.
- Just below 3: "Bloodbuzz Ohio" by The National. Melancholy lyrics over uptempo beat — lyric content pulls it below 3.
- Just above 3: "Fade Into You" by Mazzy Star. Wistful but not sad — lyric content lifts it above 3.
- 4.5: "Walking on a Dream" by Empire of the Sun. Ebullient, expansive.
- 5: "Walking on Sunshine" by Katrina and the Waves. Pure joy, no ambiguity.

Tempo — use BPM as the primary signal when known. Fall back to tags "slow" or "fast" when BPM is unavailable.
- 1: 60 BPM or under
- 2: around 90 BPM
- 3: around 120 BPM
- 4: around 150 BPM
- 5: 180 BPM or over

Texture — do not score this dimension. Output 1 to 3 short lowercase descriptive tags that capture the sonic character of the track. Examples: "sparse, acoustic, intimate" or "distorted, driving, raw" or "dense, layered, orchestral."

Genre shift — how far the suggested bridge track sits from the genre of Song A and Song C combined. This is not a quality score. A 5 is not bad.
- 1: Same genre, same era, nearly identical sonic territory. Playing a Thelonious Monk track after a Thelonious Monk track.
- 5: No shared genre DNA whatsoever. Playing black metal after Thelonious Monk.

BRIDGE LOGIC

You are given Song A and Song C. Your job is not to find a song that averages their scores. Your job is to find a song that makes the journey from A to C feel intentional.

Think directionally. Song B should feel like it belongs after A and before C. The transition has a direction. If A is dour and C is energetic, the bridge should lean toward energy, not sit passively in the middle.

Move, don't split the difference. A good bridge shares something specific with A and something specific with C. Name what those connections are.

One dimension can do the heavy lifting. A track can be a significant genre departure and still work if the Energy, Mood, and Tempo trajectory is right. A high genre shift score does not require justification beyond the other dimensions making sense.

Tempo is the tiebreaker, not the goal. If no other dimension provides a clear bridge candidate, prefer a track whose tempo sits between A and C. This is a last resort. An interesting bridge is always preferable to an equidistant one.

CANDIDATE EVALUATION

You will be given a list of candidate tracks. For each candidate, apply your knowledge standard first. If you do not know the track well enough, discard it silently.

Keep only the five strongest candidates. If fewer than five candidates pass your knowledge standard and bridge logic assessment, return only the ones that do. Do not pad results with weak matches. Do not invent tracks to reach five.

OUTPUT FORMAT

Return a single JSON object. No prose before or after it. No markdown code fences. Just raw JSON.

{
  "song_a_known": true,
  "song_c_known": true,
  "results": [
    {
      "rank": 1,
      "title": "Track Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "year": 1993,
      "energy": 3,
      "mood": 3,
      "tempo": 3,
      "genre_shift": 2,
      "texture": ["tag1", "tag2"],
      "description": "One or two sentences explaining why this works as a bridge."
    }
  ],
  "no_results_reason": null
}

Field rules:
- song_a_known and song_c_known: set to false if you do not know the track well enough. If either is false, return empty results and set no_results_reason to a plain English explanation.
- rank: 1 is the strongest bridge candidate.
- year: original release year. If uncertain, omit entirely rather than guess.
- energy, mood, tempo, genre_shift: integers 1 to 5.
- texture: array of 1 to 3 short lowercase strings.
- description: one or two sentences maximum. Say which dimensions are doing the work. Do not write a review.
- no_results_reason: null if results were found. Plain English if not.`;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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

function SongSearch({ label, onConfirm, confirmed, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery || confirmed) {
      setResults([]);
      setOpen(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    searchTracks(debouncedQuery).then(r => {
      if (mounted) {
        setResults(r);
        setOpen(r.length > 0);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
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

const LOADING_STEPS = [
  "Looking up tracks in Last.fm",
  "Characterizing Song A and Song C",
  "Finding bridge candidates",
  "Reticulating splines",
  "Ranking results",
];

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

export default function TheMiddle() {
  const [songA, setSongA] = useState(null);
  const [songC, setSongC] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | results | error
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const bothConfirmed = songA && songC;

  async function handleFind() {
    if (!bothConfirmed) return;
    setStatus("loading");
    setLoadingStep(0);
    setResults([]);
    setErrorMsg("");

    try {
      setLoadingStep(1);
      const [similarA, similarC] = await Promise.all([
        getSimilarTracks(songA.artist, songA.title),
        getSimilarTracks(songC.artist, songC.title),
      ]);

      setLoadingStep(2);

      const candidateSet = new Map();
      [...similarA, ...similarC].forEach(t => {
        const key = `${t.artist.name}|||${t.name}`.toLowerCase();
        if (!candidateSet.has(key)) candidateSet.set(key, { artist: t.artist.name, title: t.name });
      });

      const candidates = Array.from(candidateSet.values()).slice(0, 50);

      setLoadingStep(3);

      const userMessage = `Song A: "${songA.title}" by ${songA.artist}${songA.year ? ` (${songA.year})` : ""}
Last.fm tags for A: ${songA.tags.slice(0, 6).join(", ") || "none"}

Song C: "${songC.title}" by ${songC.artist}${songC.year ? ` (${songC.year})` : ""}
Last.fm tags for C: ${songC.tags.slice(0, 6).join(", ") || "none"}

Candidate tracks from Last.fm similar tracks for A and C:
${candidates.map((c, i) => `${i + 1}. "${c.title}" by ${c.artist}`).join("\n")}

Please identify the best bridge tracks from these candidates (or suggest alternatives you know confidently if none of these work). Return your response as raw JSON only.`;

      setLoadingStep(4);

      const response = await fetch("/api/anthropic/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 16000,
          thinking: { type: "adaptive" },
          output_config: { effort: "low" },
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();

      if (data.stop_reason === "refusal") {
        setStatus("error");
        setErrorMsg("Claude declined this request. Try a different pair of songs.");
        return;
      }
      if (data.stop_reason === "max_tokens") {
        setStatus("error");
        setErrorMsg("The response was cut off before it finished. Try again.");
        return;
      }
      const text = data.content?.map(b => b.text || "").join("") || "";

      let parsed;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        setStatus("error");
        setErrorMsg("Something went wrong parsing the response. Try again.");
        return;
      }

      if (!parsed.song_a_known || !parsed.song_c_known) {
        setStatus("error");
        setErrorMsg(parsed.no_results_reason || "Claude doesn't know one of these tracks well enough to find a bridge. Try a different song.");
        return;
      }

      if (!parsed.results || parsed.results.length === 0) {
        setStatus("error");
        setErrorMsg(parsed.no_results_reason || "No confident bridge found between these two tracks. Try again or change one of the songs.");
        return;
      }

      setResults(parsed.results);
      setStatus("results");

    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  }

  function handleTryAgain() {
    setStatus("idle");
    setResults([]);
    setErrorMsg("");
    setLoadingStep(0);
  }

  function handleReset() {
    setSongA(null);
    setSongC(null);
    handleTryAgain();
  }

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
}

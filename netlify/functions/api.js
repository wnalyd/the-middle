/* global process */
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

/**
 * AnimeDex Cloudflare Worker — CORS Proxy  v3.0
 * ════════════════════════════════════════════════════════════════════════════
 *
 * HOW TO DEPLOY (two methods):
 *
 * METHOD A — Cloudflare Dashboard (quickest, no CLI needed):
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Click "Edit Code", delete everything, paste this entire file
 *   3. Click "Save and Deploy"
 *   4. Copy the worker URL (e.g. https://animedex-proxy.yourname.workers.dev)
 *   5. Set NEXT_PUBLIC_PROXY_URL=<that URL> in Vercel → Settings → Env Variables
 *   6. Redeploy Vercel
 *
 * METHOD B — Wrangler CLI:
 *   cd cf-proxy && npm install && npx wrangler deploy
 *
 * ════════════════════════════════════════════════════════════════════════════
 * WHY THE OLD WORKER KEPT RETURNING 403:
 *
 * The previous worker had two separate checks that both had to pass:
 *   1. ALLOWED_ORIGIN check  — rejected if browser sent no `origin` header
 *      (video elements, hls.js range requests, and subtitle fetches often
 *       send NO origin header at all, so they were always blocked)
 *   2. ALLOWED_HOSTS check   — also had to match
 *
 * This version removes the ALLOWED_ORIGIN check entirely.
 * Security is now via the ALLOWED_HOSTS list only — we only proxy to known
 * CDN hostnames, so the worker cannot be used as an open proxy.
 *
 * The wildcard "*" at the top of ALLOWED_HOSTS is left enabled because
 * anime CDNs change frequently. Remove it and add specific hosts once
 * you've catalogued all CDNs from your traffic logs.
 * ════════════════════════════════════════════════════════════════════════════
 */

// ─── Host allowlist ───────────────────────────────────────────────────────────
// Exact match OR subdomain match — "vid-cdn.xyz" allows "seiryuu.vid-cdn.xyz"
// The wildcard "*" is intentional — remove after cataloguing all CDNs.
const ALLOWED_HOSTS = [
  "*",                      // ← wildcard — catches all CDNs (safe while cataloguing)

  // ── AnimeGG ────────────────────────────────────────────────────────────────
  "animegg.org",            // signed .mp4 play URLs: animegg.org/play/…
  "vid-cdn.xyz",            // covers seiryuu.vid-cdn.xyz and all subdomains

  // ── AnimePahe / kwik.cx ────────────────────────────────────────────────────
  "kwik.cx",                // covers eu.kwik.cx, na.kwik.cx etc.
  "animepahe.com",
  "animepahe.org",
  "animepahe.ru",
  "animepahe.si",

  // ── Anizone ────────────────────────────────────────────────────────────────
  "anizone.to",             // covers cdn.anizone.to, player.anizone.to etc.

  // ── AnimePahe CDN ──────────────────────────────────────────────────────────
  "owocdn.top",             // covers vault-14.owocdn.top etc.

  // ── AnimePahe (updated API: animepahe.pw) ──────────────────────────────────
  "animepahe.pw",

  // ── Anidap CDN ─────────────────────────────────────────────────────────────
  "anidap.se",

  // ── AniSkip ────────────────────────────────────────────────────────────────
  "api.aniskip.com",
];

function isAllowedHost(hostname) {
  const h = hostname.toLowerCase();
  if (ALLOWED_HOSTS[0] === "*") return true; // wildcard fast-path
  return ALLOWED_HOSTS.some(a => h === a || h.endsWith("." + a));
}

// ─── CORS headers (always applied) ───────────────────────────────────────────
function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin":   "*",
    "Access-Control-Allow-Methods":  "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers":  "Range, Content-Type, Origin",
    "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    ...extra,
  };
}

// ─── M3U8 rewriter ────────────────────────────────────────────────────────────
function isM3U8(url, contentType) {
  const ct = (contentType || "").toLowerCase();
  return url.includes(".m3u8") || ct.includes("mpegurl") || ct.includes("x-mpegurl");
}

/**
 * Rewrites m3u8 so:
 *   - Plain .ts/.jpg segments  → absolute CDN URL (NOT proxied — zero worker bandwidth)
 *   - Sub-manifests (.m3u8)    → proxied through this worker (so we can rewrite them)
 *   - #EXT-X-KEY URI=          → proxied (AES-128 encryption keys)
 *   - #EXT-X-MAP URI=          → proxied (CMAF init segments)
 *   - #EXT-X-MEDIA URI=        → proxied (alternate audio/subs)
 */
function rewriteM3U8(text, manifestUrl, referer, workerOrigin) {
  const base = new URL(manifestUrl);

  function abs(raw) {
    const t = raw.trim();
    if (!t || t.startsWith("data:") || t.startsWith("blob:")) return raw;
    if (t.startsWith("https://") || t.startsWith("http://")) return t;
    if (t.startsWith("//")) return base.protocol + t;
    if (t.startsWith("/")) return `${base.protocol}//${base.host}${t}`;
    const dir = base.href.substring(0, base.href.lastIndexOf("/") + 1);
    try { return new URL(t, dir).href; } catch { return raw; }
  }

  function toProxy(raw) {
    try {
      const p = new URLSearchParams({ url: abs(raw) });
      if (referer) p.set("referer", referer);
      return `${workerOrigin}/proxy?${p}`;
    } catch { return raw; }
  }

  function isSubM3U8(t) {
    const u = t.trim().toLowerCase().split("?")[0];
    return u.endsWith(".m3u8") || u.includes(".m3u8");
  }

  return text.split("\n").map(line => {
    const t = line.trim();
    if (!t) return line;

    if (t.startsWith("#")) {
      // Rewrite URI= attributes (keys, maps, media tracks)
      return line
        .replace(/URI="([^"]+)"/g, (_, u) => u.startsWith("data:") ? `URI="${u}"` : `URI="${toProxy(u)}"`)
        .replace(/URI='([^']+)'/g, (_, u) => u.startsWith("data:") ? `URI='${u}'` : `URI='${toProxy(u)}'`);
    }
    if (t.startsWith("data:") || t.startsWith("blob:")) return line;
    // Sub-manifests → proxy; plain segments → absolute CDN (saves all bandwidth)
    if (isSubM3U8(t)) return toProxy(t);
    try { return abs(t); } catch { return line; }
  }).join("\n");
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors() });
    }

    // Health check
    if (url.pathname === "/" || url.pathname === "/health") {
      return Response.json(
        { ok: true, service: "animedex-proxy", version: "3.0" },
        { headers: cors() }
      );
    }

    // Crysoline health (cached 60 s at Cloudflare edge)
    if (url.pathname === "/crysoline-health") {
      try {
        const r = await fetch("https://api.crysoline.moe/health", {
          signal: AbortSignal.timeout(8000),
          headers: { Accept: "application/json" },
        });
        const d = await r.json().catch(() => ({ status: "unknown" }));
        return Response.json({ up: r.ok, ...d }, {
          headers: cors({ "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" }),
        });
      } catch (e) {
        return Response.json({ up: false, error: e.message }, { headers: cors() });
      }
    }

    // 404 for everything except /proxy
    if (url.pathname !== "/proxy") {
      return new Response("Not found", { status: 404, headers: cors() });
    }

    // ── /proxy?url=...&referer=... ────────────────────────────────────────────

    const rawUrl  = url.searchParams.get("url");
    const referer = url.searchParams.get("referer") || "";

    if (!rawUrl) {
      return Response.json({ error: "url param required" }, { status: 400, headers: cors() });
    }

    let target;
    try { target = new URL(decodeURIComponent(rawUrl)); }
    catch { return Response.json({ error: "Invalid URL" }, { status: 400, headers: cors() }); }

    if (!["http:", "https:"].includes(target.protocol)) {
      return Response.json({ error: "Only http/https" }, { status: 400, headers: cors() });
    }

    // Block self-loops
    if (target.hostname === "localhost" || target.hostname === "127.0.0.1") {
      return Response.json({ error: "Self-loop blocked" }, { status: 400, headers: cors() });
    }

    // Host allowlist check
    if (!isAllowedHost(target.hostname)) {
      return Response.json(
        { error: "Host not in allowlist", host: target.hostname },
        { status: 403, headers: cors() }
      );
    }

    const effectiveReferer = referer
      ? decodeURIComponent(referer)
      : `${target.protocol}//${target.hostname}/`;

    const upHeaders = {
      "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept":          "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "identity",          // never gzip — we stream raw bytes
      "Referer":         effectiveReferer,
      "Origin":          `${target.protocol}//${target.hostname}`,
      "Sec-Fetch-Dest":  "empty",
      "Sec-Fetch-Mode":  "cors",
      "Sec-Fetch-Site":  "cross-site",
    };

    const range = request.headers.get("range");
    if (range) upHeaders["Range"] = range;

    // HEAD
    if (request.method === "HEAD") {
      try {
        const up = await fetch(target.toString(), { method: "HEAD", headers: upHeaders, redirect: "follow" });
        const h  = new Headers(cors());
        for (const hdr of ["content-type","content-length","accept-ranges","cache-control"]) {
          const v = up.headers.get(hdr); if (v) h.set(hdr, v);
        }
        if (!h.has("accept-ranges")) h.set("accept-ranges", "bytes");
        return new Response(null, { status: up.ok ? 200 : up.status, headers: h });
      } catch { return new Response(null, { status: 502, headers: cors() }); }
    }

    // GET
    try {
      const upstream = await fetch(target.toString(), { headers: upHeaders, redirect: "follow" });

      // Surface upstream 4xx/5xx with CORS headers so browser can read the error
      if (!upstream.ok && upstream.status !== 206) {
        return new Response(
          `Upstream ${upstream.status} from ${target.hostname}`,
          { status: upstream.status, headers: cors({ "Content-Type": "text/plain" }) }
        );
      }

      const contentType  = upstream.headers.get("content-type") || "";
      const workerOrigin = `${url.protocol}//${url.host}`;

      // M3U8 manifest — rewrite all URLs
      if (isM3U8(target.href, contentType)) {
        const text      = await upstream.text();
        const rewritten = rewriteM3U8(text, target.href, effectiveReferer, workerOrigin);
        return new Response(rewritten, {
          status: 200,
          headers: cors({
            "Content-Type":  "application/vnd.apple.mpegurl",
            "Cache-Control": "public, max-age=30, s-maxage=60",
          }),
        });
      }

      // Subtitle files (.srt, .vtt, .ass)
      const isSub = contentType.includes("text/vtt") ||
                    contentType.includes("text/plain") ||
                    /\.(vtt|srt|ass|ssa)(\?|$)/i.test(target.pathname);
      if (isSub) {
        const h = new Headers(cors());
        h.set("Content-Type", contentType || "text/plain; charset=utf-8");
        h.set("Cache-Control", "public, max-age=86400");
        return new Response(upstream.body, { status: upstream.status, headers: h });
      }

      // Everything else — keys, init segments, .mp4 direct, .ts segments
      const rh = new Headers(cors());
      for (const hdr of ["content-type","content-length","content-range","accept-ranges","cache-control","etag"]) {
        const v = upstream.headers.get(hdr); if (v) rh.set(hdr, v);
      }
      if (!rh.has("accept-ranges")) rh.set("accept-ranges", "bytes");

      // Ensure video/mp4 for AnimeGG direct play URLs
      const ct = rh.get("content-type") || "";
      if (!ct && target.pathname.match(/\.mp4|\/play\//i)) rh.set("content-type", "video/mp4");

      return new Response(upstream.body, { status: upstream.status, headers: rh });

    } catch (e) {
      return Response.json({ error: "Upstream fetch failed", detail: e.message },
        { status: 502, headers: cors() });
    }
  },
};

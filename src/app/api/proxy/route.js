/**
 * GET /api/proxy?url=<encoded>&referer=<encoded>
 *
 * Dual-mode CORS proxy for HLS streams, m3u8 manifests, subtitles.
 *
 * MODE A — CF Worker (production, NEXT_PUBLIC_PROXY_URL set):
 *   For non-m3u8: 307 redirect to CF Worker (zero Vercel bandwidth for video).
 *   For m3u8: fetch + rewrite HERE (server-side) to avoid CORS on manifest.
 *
 * MODE B — Local fallback (dev or CF Worker not set):
 *   Full server-side proxy with m3u8 rewriting.
 *
 * WHY NOT PURE REDIRECT FOR M3U8:
 *   hls.js fetches the m3u8 from the browser. If it redirects to CF Worker,
 *   the CF Worker must be deployed. By handling m3u8 server-side always,
 *   streams work even if the CF Worker isn't deployed yet.
 *
 * ANIZONE / ANIMEPAHE CDN FIX:
 *   seiryuu.vid-cdn.xyz and owocdn.top require the correct Referer header.
 *   The proxy sets Referer to the source site (anizone.to, animepahe.pw)
 *   when the referer param matches those domains.
 */

import { NextResponse } from "next/server";

const CF_PROXY = process.env.NEXT_PUBLIC_PROXY_URL || "";

function isM3U8(url, contentType) {
  return (
    url.includes(".m3u8") ||
    (contentType || "").toLowerCase().includes("mpegurl") ||
    (contentType || "").toLowerCase().includes("x-mpegurl")
  );
}

function isSub(url, contentType) {
  const ct = (contentType || "").toLowerCase();
  return ct.includes("text/vtt") || ct.includes("text/plain") ||
    /\.(vtt|srt|ass|ssa)(\?|$)/i.test(url);
}

/**
 * Full m3u8 rewriter: proxies all manifest-level URLs, leaves segments as
 * absolute CDN URLs (browser fetches them directly — no proxy bandwidth).
 */
function rewriteM3U8(text, manifestUrl, referer, origin) {
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
      return `${origin}/api/proxy?${p.toString()}`;
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
      return line
        .replace(/URI="([^"]+)"/g, (_, u) => u.startsWith("data:") ? `URI="${u}"` : `URI="${toProxy(u)}"`)
        .replace(/URI='([^']+)'/g, (_, u) => u.startsWith("data:") ? `URI='${u}'` : `URI='${toProxy(u)}'`);
    }
    if (t.startsWith("data:") || t.startsWith("blob:")) return line;
    // Sub-manifests → proxy; plain .ts segments → absolute CDN (direct browser fetch)
    if (isSubM3U8(t)) return toProxy(t);
    try { return abs(t); } catch { return line; }
  }).join("\n");
}

/**
 * Build upstream request headers.
 * Adds correct Referer/Origin for CDNs that hotlink-protect (anizone, animepahe).
 */
function buildUpstreamHeaders(targetUrl, effectiveReferer, rangeHeader) {
  const headers = {
    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept":          "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "identity",
    "Referer":         effectiveReferer,
    "Origin":          `${targetUrl.protocol}//${targetUrl.hostname}`,
    "Sec-Fetch-Dest":  "empty",
    "Sec-Fetch-Mode":  "cors",
    "Sec-Fetch-Site":  "cross-site",
  };
  if (rangeHeader) headers["Range"] = rangeHeader;
  return headers;
}

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request) {
  const reqUrl  = new URL(request.url);
  const rawUrl  = reqUrl.searchParams.get("url");
  const referer = reqUrl.searchParams.get("referer") || "";

  if (!rawUrl) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  let targetUrl;
  try { targetUrl = new URL(decodeURIComponent(rawUrl)); }
  catch { return NextResponse.json({ error: "Invalid URL" }, { status: 400 }); }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: "Only http/https allowed" }, { status: 400 });
  }

  const effectiveReferer = referer
    ? decodeURIComponent(referer)
    : `${targetUrl.protocol}//${targetUrl.hostname}/`;

  const rangeHeader = request.headers.get("range");

  // ── For non-m3u8 in production: redirect to CF Worker (saves Vercel bandwidth) ──
  if (CF_PROXY) {
    // Peek at URL to decide: if it LOOKS like an m3u8, handle server-side
    const looksLikeM3U8 = targetUrl.href.includes(".m3u8");
    if (!looksLikeM3U8) {
      const cfUrl = new URL(`${CF_PROXY}/proxy`);
      cfUrl.searchParams.set("url", rawUrl);
      if (referer) cfUrl.searchParams.set("referer", referer);
      return NextResponse.redirect(cfUrl.toString(), 307);
    }
  }

  // ── Server-side proxy (m3u8 always; everything in dev) ───────────────────
  const upstreamHeaders = buildUpstreamHeaders(targetUrl, effectiveReferer, rangeHeader);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      headers: upstreamHeaders,
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      console.error(`[proxy] upstream ${upstream.status} for ${targetUrl.hostname}`);
      return new NextResponse(
        `Upstream ${upstream.status}`,
        { status: upstream.status, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const contentType  = upstream.headers.get("content-type") || "";
    const serverOrigin = `${reqUrl.protocol}//${reqUrl.host}`;

    // ── M3U8: rewrite all internal URLs ─────────────────────────────────────
    if (isM3U8(targetUrl.href, contentType)) {
      const text      = await upstream.text();
      const rewritten = rewriteM3U8(text, targetUrl.href, effectiveReferer, serverOrigin);
      const h = new Headers();
      h.set("Access-Control-Allow-Origin",  "*");
      h.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      h.set("Access-Control-Allow-Headers", "Range, Content-Type");
      h.set("Content-Type",  "application/vnd.apple.mpegurl");
      h.set("Cache-Control", "public, max-age=30");
      return new NextResponse(rewritten, { status: 200, headers: h });
    }

    // ── Subtitles (SRT/VTT/ASS): stream with CORS ───────────────────────────
    if (isSub(targetUrl.href, contentType)) {
      const h = new Headers();
      h.set("Access-Control-Allow-Origin",  "*");
      h.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      h.set("Content-Type", contentType || "text/plain; charset=utf-8");
      h.set("Cache-Control", "public, max-age=86400");
      return new NextResponse(upstream.body, { status: upstream.status, headers: h });
    }

    // ── Everything else: stream with CORS ───────────────────────────────────
    const h = new Headers();
    h.set("Access-Control-Allow-Origin",   "*");
    h.set("Access-Control-Allow-Methods",  "GET, HEAD, OPTIONS");
    h.set("Access-Control-Allow-Headers",  "Range, Content-Type");
    h.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

    for (const hdr of ["content-type","content-length","content-range","accept-ranges","cache-control","etag"]) {
      const v = upstream.headers.get(hdr);
      if (v) h.set(hdr, v);
    }
    if (!h.has("accept-ranges")) h.set("accept-ranges", "bytes");

    return new NextResponse(upstream.body, { status: upstream.status, headers: h });

  } catch (e) {
    console.error("[proxy] fetch failed:", e.message);
    return NextResponse.json({ error: "Upstream fetch failed", detail: e.message }, { status: 502 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":   "*",
      "Access-Control-Allow-Methods":  "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers":  "Range, Content-Type",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    },
  });
}

export async function HEAD(request) {
  const reqUrl  = new URL(request.url);
  const rawUrl  = reqUrl.searchParams.get("url");
  const referer = reqUrl.searchParams.get("referer") || "";
  if (!rawUrl) return new NextResponse(null, { status: 400 });

  if (CF_PROXY) {
    const cfUrl = new URL(`${CF_PROXY}/proxy`);
    cfUrl.searchParams.set("url", rawUrl);
    if (referer) cfUrl.searchParams.set("referer", referer);
    return NextResponse.redirect(cfUrl.toString(), 307);
  }

  let targetUrl;
  try { targetUrl = new URL(decodeURIComponent(rawUrl)); }
  catch { return new NextResponse(null, { status: 400 }); }

  const effectiveReferer = referer
    ? decodeURIComponent(referer)
    : `${targetUrl.protocol}//${targetUrl.hostname}/`;

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer":    effectiveReferer,
        "Origin":     `${targetUrl.protocol}//${targetUrl.hostname}`,
      },
      redirect: "follow",
    });
    const h = new Headers();
    h.set("Access-Control-Allow-Origin",   "*");
    h.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
    for (const hdr of ["content-type","content-length","accept-ranges","cache-control"]) {
      const v = upstream.headers.get(hdr);
      if (v) h.set(hdr, v);
    }
    if (!h.has("accept-ranges")) h.set("accept-ranges", "bytes");
    return new NextResponse(null, { status: upstream.ok ? 200 : upstream.status, headers: h });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}

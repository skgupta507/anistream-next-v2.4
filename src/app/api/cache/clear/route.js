/**
 * POST /api/cache/clear
 * Clears Redis (Upstash) and/or Turso SQLite source mapping cache.
 *
 * Body JSON:
 *   { "target": "all" | "redis" | "turso" }   — full clear
 *   { "anilistId": 12345 }                     — purge one anime only
 *
 * Optionally protect with env var CACHE_CLEAR_SECRET:
 *   Set in Vercel dashboard, then pass header: x-clear-secret: <value>
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  // Optional secret guard
  const secret   = request.headers.get("x-clear-secret") || "";
  const expected = process.env.CACHE_CLEAR_SECRET || "";
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body = {};
  try { body = await request.json(); } catch {}

  const target    = body.target    || "all";
  const anilistId = body.anilistId || null;
  const results   = {};

  // Lazy-import cache so this route doesn't fail if DB isn't configured
  let cacheModule;
  try { cacheModule = await import("@/lib/cache"); } catch (e) {
    return NextResponse.json({ error: `Cache module load failed: ${e.message}` }, { status: 500 });
  }

  const { setCachedAsync, deleteSourceMapping, redis, db } = cacheModule;

  // ── Single anime purge ─────────────────────────────────────────────────────
  if (anilistId) {
    // Turso: remove all source mappings for this anime
    if (db) {
      try {
        await deleteSourceMapping(anilistId, null);
        results.turso = `Deleted source mappings for anilistId=${anilistId}`;
      } catch (e) { results.turso_error = e.message; }
    }

    // Redis: expire all cached keys related to this anime
    if (redis) {
      try {
        const sources = ["animegg", "anizone", "animepahe", "anidap", "animekai"];
        await Promise.allSettled([
          ...sources.map(sid => setCachedAsync(`cryo_map1:${anilistId}:${sid}`, null, 1)),
          setCachedAsync(`cryo_map:${anilistId}:en`,  null, 1),
          setCachedAsync(`cryo_map:${anilistId}:all`, null, 1),
          setCachedAsync(`info:${anilistId}`,         null, 1),
        ]);
        results.redis = `Expired Redis cache for anilistId=${anilistId}`;
      } catch (e) { results.redis_error = e.message; }
    }

    return NextResponse.json({ ok: true, mode: "single", anilistId, results });
  }

  // ── Full clear ─────────────────────────────────────────────────────────────
  if ((target === "turso" || target === "all") && db) {
    try {
      await db.execute("DELETE FROM anime_source_map");
      results.turso = "Cleared: all rows deleted from anime_source_map";
    } catch (e) { results.turso_error = e.message; }
  } else if (target !== "redis") {
    results.turso = "Turso not configured or not targeted";
  }

  if ((target === "redis" || target === "all") && redis) {
    try {
      await redis.flushdb();
      results.redis = "Cleared: Redis FLUSHDB executed (all keys removed)";
    } catch (e) { results.redis_error = e.message; }
  } else if (target !== "turso") {
    results.redis = "Redis not configured or not targeted";
  }

  return NextResponse.json({ ok: true, mode: "full", target, results });
}

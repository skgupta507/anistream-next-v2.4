/**
 * crysoline.js — Crysoline API v1 client
 *
 * ⚠️  CRITICAL: All endpoints use /api/v1/ prefix, NOT /api/
 *     Correct: https://api.crysoline.moe/api/v1/anime/animegg/episodes/{id}
 *     Wrong:   https://api.crysoline.moe/api/anime/animegg/episodes/{id}
 *
 * Mapper endpoint: /api/v1/mapper/map
 * Source search:   /api/v1/anime/{source}/search?q=
 * Source episodes: /api/v1/anime/{source}/episodes/{id}
 * Source sources:  /api/v1/anime/{source}/sources?id=&episodeId=
 * Source servers:  /api/v1/anime/{source}/servers?id=&episodeId=
 *                  (only anicore, anidap, animex have /servers)
 *
 * Timeout strategy (fail fast → auto-switch to embedded player):
 *   Mapper/search/probe: 8s, 0 retries
 *   Episodes/sources:   20s, 1 retry
 */

import axios from "axios";

const BASE = "https://api.crysoline.moe";

export const STALE_MAPPING = Symbol("STALE_MAPPING");

function makeClient(timeout = 20000) {
  const key = process.env.CRYSOLINE_API_KEY || "";
  if (!key) console.warn("[crysoline] CRYSOLINE_API_KEY not set");
  return axios.create({
    baseURL: BASE,
    timeout,
    headers: { "x-api-key": key, Accept: "application/json" },
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function cryGet(path, params = {}, timeoutMs = 20000, retries = 1, signal404 = false) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data } = await makeClient(timeoutMs).get(path, { params });
      return data;
    } catch (e) {
      const status    = e.response?.status;
      const isTimeout = e.code === "ECONNABORTED" || e.message?.includes("timeout");
      const msg       = e.response?.data?.message || e.response?.data || e.message;

      if (status === 404) {
        if (signal404) return STALE_MAPPING;
        return null;
      }

      if (status === 429) {
        if (attempt < retries) {
          const wait = Math.pow(2, attempt) * 1000;
          console.log(`[crysoline] 429 — waiting ${wait}ms`);
          await sleep(wait);
          continue;
        }
        return null;
      }

      if (isTimeout && attempt < retries) {
        console.log(`[crysoline] timeout on ${path} — retrying`);
        await sleep(1000);
        continue;
      }

      if (isTimeout) {
        console.log(`[crysoline] timeout on ${path} — giving up`);
      } else {
        console.log(`[crysoline] ${path} → ${status || e.code}: ${
          typeof msg === "string" ? msg.slice(0, 80) : JSON.stringify(msg).slice(0, 80)
        }`);
      }
      return null;
    }
  }
  return null;
}

// ── Sources list ───────────────────────────────────────────────────────────────
// hasServers reflects the actual /api/v1/anime/{source}/servers endpoints in the API docs
export const CRYSOLINE_SOURCES = [
  { id: "animegg",         name: "AnimeGG",       site: "animegg.org",             langs: ["en","ja"],      hasServers: false, isDefault: true  },
  { id: "animepahe",       name: "AnimePahe",     site: "animepahe.si",            langs: ["en","ja"],      hasServers: false },
  { id: "animeheaven",     name: "AnimeHeaven",   site: "animeheaven.me",          langs: ["en","ja"],      hasServers: false },
  { id: "animekai",        name: "AnimeKai",      site: "anikai.to",               langs: ["en","ja"],      hasServers: false },
  { id: "animeyy",         name: "AnimeYY",       site: "animeyy.com",             langs: ["en","ja"],      hasServers: false },
  { id: "anizone",         name: "Anizone",       site: "anizone.to",              langs: ["en","ja"],      hasServers: false },
  { id: "animenexus",      name: "AnimeNexus",    site: "anime.nexus",             langs: ["en","ja"],      hasServers: false },
  { id: "animeonsen",      name: "AnimeOnsen",    site: "animeonsen.xyz",          langs: ["en","ja"],      hasServers: false },
  { id: "animeparadise",   name: "AnimeParadise", site: "animeparadise.moe",       langs: ["en","ja"],      hasServers: false },
  { id: "animex",          name: "Animex",        site: "animex.one",              langs: ["en","ja","id"], hasServers: true  },
  { id: "onetwothreeanime",name: "123Anime",      site: "123animes.org",           langs: ["en","ja"],      hasServers: false },
  { id: "uniquestream",    name: "UniqueStream",  site: "anime.uniquestream.net",  langs: ["en","ja"],      hasServers: false },
  { id: "kickassanime",    name: "KickAssAnime",  site: "kickass-anime.ro",        langs: ["en","ja"],      hasServers: false },
  { id: "anicore",         name: "Anicore",       site: "anikage.cc",              langs: ["en","ja","id"], hasServers: true  },
  { id: "anidap",          name: "Anidap",        site: "anidap.se",               langs: ["en","ja","id"], hasServers: true  },
];

export const DEFAULT_SOURCE_ID = "animegg";
export const EN_SOURCE_IDS     = CRYSOLINE_SOURCES.map(s => s.id);
export const ALL_SOURCE_IDS    = CRYSOLINE_SOURCES.map(s => s.id);
export const FALLBACK_SOURCE_IDS = ["animepahe", "kickassanime", "animekai", "animeheaven"];

// ── Title helpers ──────────────────────────────────────────────────────────────

function titleToSlug(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-$/, "");
}

function candidateSlugs(titles = []) {
  const seen = new Set();
  return titles.filter(Boolean).map(t => titleToSlug(t)).filter(s => s && !seen.has(s) && seen.add(s));
}

// ── Search fallback ────────────────────────────────────────────────────────────

async function searchOnSource(sourceId, titles) {
  for (const title of titles.filter(Boolean).slice(0, 2)) {
    // ✅ Correct path: /api/v1/anime/{source}/search
    const data = await cryGet(`/api/v1/anime/${sourceId}/search`, { q: title }, 8000, 0, false);
    if (!data) continue;

    const results = Array.isArray(data) ? data
      : Array.isArray(data.results) ? data.results
      : Array.isArray(data.data)    ? data.data
      : null;
    if (!results?.length) continue;

    const query = titleToSlug(title);
    for (const item of results) {
      const itemId    = item.id || item.animeId || item.slug || null;
      const itemTitle = item.title || item.name  || item.slug || "";
      if (!itemId) continue;
      const itemSlug = titleToSlug(itemTitle);
      if (itemSlug === query || itemSlug.startsWith(query.slice(0, 15)) || query.startsWith(itemSlug.slice(0, 15))) {
        console.log(`[crysoline] search found ${sourceId}:"${itemTitle}" → ${itemId}`);
        return String(itemId);
      }
    }
  }
  return null;
}

// ── AnimeGG slug probe ─────────────────────────────────────────────────────────

async function probeAnimeGGByTitle(titles) {
  const slugs = candidateSlugs(titles).slice(0, 3);
  if (slugs.length) console.log(`[crysoline] animegg probe trying: ${slugs.join(", ")}`);

  for (const slug of slugs) {
    // ✅ Correct path: /api/v1/anime/animegg/episodes/{id}
    const data = await cryGet(`/api/v1/anime/animegg/episodes/${encodeURIComponent(slug)}`, {}, 8000, 0, false);
    if (!data || data === STALE_MAPPING) continue;

    const eps = Array.isArray(data) ? data
      : Array.isArray(data.episodes) ? data.episodes
      : Array.isArray(data.data)     ? data.data
      : null;
    if (eps?.length > 0) {
      console.log(`[crysoline] animegg probe found: "${slug}" (${eps.length} eps)`);
      return slug;
    }
  }
  return null;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

export async function mapAnilistToSource(anilistId, sourceId, titles = []) {
  // Step 1: Crysoline mapper — ✅ correct path: /api/v1/mapper/map
  const data = await cryGet(
    "/api/v1/mapper/map",
    { id: String(anilistId), provider: sourceId },
    8000, 0, false
  );

  if (data && data !== STALE_MAPPING && data.found) {
    const id =
      (typeof data.idMap  === "string" ? data.idMap          : null) ||
      (typeof data.idMap  === "number" ? String(data.idMap)  : null) ||
      (typeof data.id     === "string" ? data.id             : null) ||
      (typeof data.result === "string" ? data.result         : null);
    if (id && id !== "null" && id !== "undefined" && id.trim()) {
      return id.trim();
    }
  }

  if (titles.length === 0) return null;

  // Step 2: Search API
  console.log(`[crysoline] mapper missed ${sourceId}:${anilistId} — trying search`);
  const searchId = await searchOnSource(sourceId, titles);
  if (searchId) return searchId;

  // Step 3: Slug probe (AnimeGG only)
  if (sourceId === "animegg") {
    console.log(`[crysoline] search missed animegg:${anilistId} — trying slug probe`);
    const probeId = await probeAnimeGGByTitle(titles);
    if (probeId) return probeId;
  }

  return null;
}

export async function mapAnilistSequential(anilistId, sourceIds, titles = [], delayMs = 350) {
  const map = new Map();
  for (const sourceId of sourceIds) {
    const mappedId = await mapAnilistToSource(anilistId, sourceId, titles);
    if (mappedId) {
      map.set(sourceId, mappedId);
      console.log(`[crysoline] mapped ${sourceId} → ${mappedId}`);
    }
    await sleep(delayMs);
  }
  return map;
}

export async function mapAnilistToEnSources(anilistId, titles = []) {
  return mapAnilistSequential(anilistId, EN_SOURCE_IDS, titles, 350);
}

export async function mapAnilistToAllSources(anilistId, titles = []) {
  return mapAnilistSequential(anilistId, ALL_SOURCE_IDS, titles, 350);
}

// ── Episode / stream calls — all use /api/v1/ prefix ─────────────────────────

export async function getEpisodesFromSource(sourceId, mappedId) {
  if (!sourceId || !mappedId) return [];

  // ✅ Correct path: /api/v1/anime/{source}/episodes/{id}
  const data = await cryGet(
    `/api/v1/anime/${sourceId}/episodes/${encodeURIComponent(mappedId)}`,
    {}, 20000, 1, true  // signal404=true: cached slug is stale
  );

  if (data === STALE_MAPPING) return STALE_MAPPING;
  if (!data) return [];

  let raw = [];
  if (Array.isArray(data))               raw = data;
  else if (Array.isArray(data.episodes)) raw = data.episodes;
  else if (Array.isArray(data.data))     raw = data.data;
  else return [];

  return raw.map((ep, idx) => ({
    id:       ep.id || ep.episodeId || String(ep.number ?? idx + 1),
    number:   ep.number ?? ep.episode ?? idx + 1,
    title:    ep.title || ep.name || `Episode ${ep.number ?? idx + 1}`,
    image:    ep.image || ep.thumbnail || null,
    metadata: ep.metadata || {},
  }));
}

export async function getServersFromSource(sourceId, mappedId, episodeId) {
  const src = CRYSOLINE_SOURCES.find(s => s.id === sourceId);
  if (!src?.hasServers) return [];
  if (!mappedId || !episodeId) return [];

  // ✅ Correct path: /api/v1/anime/{source}/servers
  const data = await cryGet(
    `/api/v1/anime/${sourceId}/servers`,
    { id: mappedId, episodeId },
    20000, 1
  );
  if (!data) return [];
  return data.servers || (Array.isArray(data) ? data : []);
}

export async function getSourcesFromSource(sourceId, mappedId, episodeId, subType = "", server = "") {
  if (!mappedId || !episodeId) return { sources: [], subtitles: [], headers: {} };

  const params = { id: mappedId, episodeId };
  if (subType) params.subType = subType;
  if (server)  params.server  = server;

  // ✅ Correct path: /api/v1/anime/{source}/sources
  const data = await cryGet(`/api/v1/anime/${sourceId}/sources`, params, 20000, 1);
  if (!data) return { sources: [], subtitles: [], headers: {} };

  return {
    sources: (data.sources || []).map(s => ({
      url:     s.url || "",
      quality: s.quality || "auto",
      isHLS:   !!(s.isM3U8 || s.url?.includes(".m3u8")),
    })).filter(s => s.url),
    subtitles: (data.subtitles || data.tracks || []).map(t => ({
      url:   t.url || t.file || "",
      label: t.lang || t.label || "Unknown",
    })).filter(t => t.url),
    headers: data.headers || {},
  };
}

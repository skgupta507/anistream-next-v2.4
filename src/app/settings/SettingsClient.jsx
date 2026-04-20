"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./settings.module.css";

// ── Helpers ─────────────────────────────────────────────────────────────────

function ls(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
function lsRemove(key)   { try { localStorage.removeItem(key); } catch {} }

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon, title, subtitle, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionIcon}>{icon}</span>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
        </div>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
}

// ── Row ──────────────────────────────────────────────────────────────────────
function Row({ label, desc, children }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        <span className={styles.rowName}>{label}</span>
        {desc && <span className={styles.rowDesc}>{desc}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch" aria-checked={checked}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
function Select({ value, options, onChange }) {
  return (
    <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Slider ───────────────────────────────────────────────────────────────────
function Slider({ value, min, max, step = 1, onChange, format = v => v }) {
  return (
    <div className={styles.sliderRow}>
      <input type="range" className={styles.slider}
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} />
      <span className={styles.sliderVal}>{format(value)}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SettingsClient() {
  const [mounted, setMounted] = useState(false);

  // ── Player ──────────────────────────────────────────────────────────────
  const [autoplay,    setAutoplay]    = useState(true);
  const [autoNext,    setAutoNext]    = useState(true);
  const [volume,      setVolume]      = useState(100);
  const [muted,       setMuted]       = useState(false);
  const [subEnabled,  setSubEnabled]  = useState(true);
  const [subFontSize, setSubFontSize] = useState(100);
  const [subColor,    setSubColor]    = useState("#ffffff");
  const [subBgOp,     setSubBgOp]     = useState(70);
  const [subBgColor,  setSubBgColor]  = useState("#000000");
  const [subPos,      setSubPos]      = useState("bottom");
  const [skipOp,      setSkipOp]      = useState(true);
  const [skipEd,      setSkipEd]      = useState(true);

  // ── Streaming ───────────────────────────────────────────────────────────
  const [prefSource,  setPrefSource]  = useState("animegg");
  const [prefSubType, setPrefSubType] = useState("sub");
  const [defaultQual, setDefaultQual] = useState("auto");

  // ── UI ──────────────────────────────────────────────────────────────────
  const [showSpoilers, setShowSpoilers] = useState(true);
  const [epFormat,     setEpFormat]     = useState("grid");

  // ── Cache ───────────────────────────────────────────────────────────────
  const [cacheStatus,  setCacheStatus]  = useState(null);
  const [clearing,     setClearing]     = useState(false);
  const [histCount,    setHistCount]    = useState(0);

  // ── Load from localStorage on mount ─────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    setAutoplay(   ls("player_autoplay",   true));
    setAutoNext(   ls("player_autonext",   true));
    setVolume(     Math.round((ls("player_volume", 1)) * 100));
    setMuted(      ls("player_muted",      false) === "1" || ls("player_muted", false) === true);
    setSubEnabled( ls("player_subs",       true));

    const ss = ls("sub_style", {});
    if (ss.fontSize)   setSubFontSize(ss.fontSize);
    if (ss.color)      setSubColor(ss.color);
    if (ss.bgOpacity !== undefined) setSubBgOp(ss.bgOpacity);
    if (ss.bgColor)    setSubBgColor(ss.bgColor);
    if (ss.position)   setSubPos(ss.position);

    setSkipOp(   ls("skip_op", true));
    setSkipEd(   ls("skip_ed", true));

    const pref = ls("player_source_pref", {});
    if (pref.sourceId) setPrefSource(pref.sourceId);
    if (pref.subType)  setPrefSubType(pref.subType);
    setDefaultQual(    ls("player_default_quality", "auto"));
    setShowSpoilers(   ls("show_spoilers",  true));
    setEpFormat(       ls("ep_format",      "grid"));

    // Count watch history entries
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("cw_") || k?.startsWith("wp_") || k?.startsWith("progress_")) count++;
    }
    setHistCount(count);
  }, []);

  // ── Save helpers ─────────────────────────────────────────────────────────
  const save = useCallback((key, val, setter) => {
    setter(val);
    lsSet(key, val);
  }, []);

  const saveSubStyle = useCallback((patch) => {
    const current = ls("sub_style", { fontSize:100, color:"#ffffff", bgOpacity:70, bgColor:"#000000", position:"bottom" });
    lsSet("sub_style", { ...current, ...patch });
  }, []);

  const saveSourcePref = useCallback((patch) => {
    const current = ls("player_source_pref", {});
    lsSet("player_source_pref", { ...current, ...patch });
  }, []);

  // ── Cache clear ──────────────────────────────────────────────────────────
  async function clearServerCache(target) {
    setClearing(true); setCacheStatus(null);
    try {
      const r = await fetch("/api/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const d = await r.json();
      setCacheStatus({ ok: d.ok, results: d.results });
    } catch (e) {
      setCacheStatus({ ok: false, error: e.message });
    } finally { setClearing(false); }
  }

  function clearWatchHistory() {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("cw_") || k?.startsWith("wp_") || k?.startsWith("progress_")) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    setHistCount(0);
    setCacheStatus({ ok: true, results: { local: `Cleared ${toRemove.length} watch history entries` } });
  }

  function clearAllLocalStorage() {
    localStorage.clear();
    setCacheStatus({ ok: true, results: { local: "All local data cleared. Reload the page." } });
    setHistCount(0);
  }

  if (!mounted) return null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <span>Settings</span>
          </div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.titleSub}>Your preferences are saved locally in this browser.</p>
        </div>
      </div>

      <div className={styles.body}>

        {/* ── Player ── */}
        <Section icon="▶" title="Player" subtitle="Playback behaviour and defaults">
          <Row label="Autoplay" desc="Start playing immediately when an episode loads">
            <Toggle checked={autoplay} onChange={v => save("player_autoplay", v, setAutoplay)} />
          </Row>
          <Row label="Auto-next episode" desc="Automatically advance to the next episode when the current one ends">
            <Toggle checked={autoNext} onChange={v => save("player_autonext", v, setAutoNext)} />
          </Row>
          <Row label="Default volume" desc={`${volume}%`}>
            <Slider value={volume} min={0} max={100} onChange={v => {
              setVolume(v);
              lsSet("player_volume", v / 100);
            }} format={v => `${v}%`} />
          </Row>
          <Row label="Start muted">
            <Toggle checked={muted} onChange={v => { setMuted(v); localStorage.setItem("player_muted", v ? "1" : "0"); }} />
          </Row>
        </Section>

        {/* ── Streaming ── */}
        <Section icon="⛓" title="Streaming" subtitle="Source and audio preferences">
          <Row label="Preferred source" desc="Which source to try first when loading an episode">
            <Select value={prefSource}
              options={[
                { value: "animegg",  label: "AnimeGG (default)" },
                { value: "anizone",  label: "Anizone" },
                { value: "animepahe",label: "AnimePahe" },
              ]}
              onChange={v => { setPrefSource(v); saveSourcePref({ sourceId: v }); }}
            />
          </Row>
          <Row label="Audio language" desc="Preferred audio type">
            <Select value={prefSubType}
              options={[
                { value: "sub", label: "Subbed (Japanese audio)" },
                { value: "dub", label: "Dubbed (English audio)" },
              ]}
              onChange={v => { setPrefSubType(v); saveSourcePref({ subType: v }); }}
            />
          </Row>
          <Row label="Default quality" desc="Quality level when a stream first loads">
            <Select value={defaultQual}
              options={[
                { value: "auto",  label: "Auto (recommended)" },
                { value: "1080",  label: "1080p" },
                { value: "720",   label: "720p" },
                { value: "480",   label: "480p" },
                { value: "360",   label: "360p" },
              ]}
              onChange={v => { setDefaultQual(v); lsSet("player_default_quality", v); }}
            />
          </Row>
        </Section>

        {/* ── Subtitles ── */}
        <Section icon="📜" title="Subtitles" subtitle="Appearance and language settings">
          <Row label="Show subtitles by default">
            <Toggle checked={subEnabled} onChange={v => save("player_subs", v, setSubEnabled)} />
          </Row>
          <Row label="Position">
            <Select value={subPos}
              options={[{ value:"bottom", label:"Bottom" },{ value:"top", label:"Top" }]}
              onChange={v => { setSubPos(v); saveSubStyle({ position: v }); }}
            />
          </Row>
          <Row label="Font size" desc={`${subFontSize}% of base`}>
            <Slider value={subFontSize} min={60} max={200} step={10} onChange={v => {
              setSubFontSize(v); saveSubStyle({ fontSize: v });
            }} format={v => `${v}%`} />
          </Row>
          <Row label="Text colour">
            <input type="color" className={styles.colorPicker} value={subColor}
              onChange={e => { setSubColor(e.target.value); saveSubStyle({ color: e.target.value }); }} />
          </Row>
          <Row label="Background opacity" desc={`${subBgOp}%`}>
            <Slider value={subBgOp} min={0} max={100} onChange={v => {
              setSubBgOp(v); saveSubStyle({ bgOpacity: v });
            }} format={v => `${v}%`} />
          </Row>
          <Row label="Background colour">
            <input type="color" className={styles.colorPicker} value={subBgColor}
              onChange={e => { setSubBgColor(e.target.value); saveSubStyle({ bgColor: e.target.value }); }} />
          </Row>
        </Section>

        {/* ── Skip times ── */}
        <Section icon="⏩" title="Skip Times" subtitle="Auto-skip opening and ending sequences (powered by AniSkip)">
          <Row label="Show skip opening button" desc="Displays a Skip OP button during the opening theme">
            <Toggle checked={skipOp} onChange={v => save("skip_op", v, setSkipOp)} />
          </Row>
          <Row label="Show skip ending button" desc="Displays a Skip ED button during the ending theme">
            <Toggle checked={skipEd} onChange={v => save("skip_ed", v, setSkipEd)} />
          </Row>
        </Section>

        {/* ── Display ── */}
        <Section icon="👁" title="Display" subtitle="Interface preferences">
          <Row label="Show synopsis spoilers" desc="Blur the synopsis on anime pages until hovered">
            <Toggle checked={showSpoilers} onChange={v => save("show_spoilers", v, setShowSpoilers)} />
          </Row>
          <Row label="Episode list format">
            <Select value={epFormat}
              options={[{ value:"grid", label:"Grid" },{ value:"list", label:"List" }]}
              onChange={v => save("ep_format", v, setEpFormat)}
            />
          </Row>
        </Section>

        {/* ── Data & Cache ── */}
        <Section icon="🗃" title="Data &amp; Cache" subtitle="Clear watch history, source mappings, and stream caches">

          <Row label="Watch history" desc={`${histCount} saved position${histCount !== 1 ? "s" : ""} in this browser`}>
            <button className={styles.btnDanger} onClick={clearWatchHistory}
              disabled={histCount === 0}>
              Clear history
            </button>
          </Row>

          <Row label="Stream source cache (Redis)" desc="Clears cached stream URLs, episode lists, and source mappings. Use when a source returns wrong episodes or no stream.">
            <button className={styles.btnDanger} onClick={() => clearServerCache("redis")} disabled={clearing}>
              {clearing ? "Clearing…" : "Clear Redis"}
            </button>
          </Row>

          <Row label="Source mapping cache (Turso)" desc="Clears the permanent database of AniList ID → source ID mappings. Forces re-mapping on next visit.">
            <button className={styles.btnDanger} onClick={() => clearServerCache("turso")} disabled={clearing}>
              {clearing ? "Clearing…" : "Clear Turso"}
            </button>
          </Row>

          <Row label="Clear all caches" desc="Clears both Redis and Turso. Streams will re-map from scratch.">
            <button className={styles.btnDanger} onClick={() => clearServerCache("all")} disabled={clearing}>
              {clearing ? "Clearing…" : "Clear all server cache"}
            </button>
          </Row>

          <Row label="All local data" desc="Clears all localStorage data: history, preferences, settings. Cannot be undone.">
            <button className={`${styles.btnDanger} ${styles.btnDangerFull}`} onClick={clearAllLocalStorage}>
              Reset all local data
            </button>
          </Row>

          {cacheStatus && (
            <div className={`${styles.cacheResult} ${cacheStatus.ok ? styles.cacheOk : styles.cacheErr}`}>
              <span className={styles.cacheResultIcon}>{cacheStatus.ok ? "✓" : "✕"}</span>
              <div>
                {cacheStatus.error && <p>{cacheStatus.error}</p>}
                {cacheStatus.results && Object.entries(cacheStatus.results).map(([k, v]) => (
                  <p key={k}><strong>{k}:</strong> {String(v)}</p>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ── About ── */}
        <Section icon="⚗" title="About AnimeDex">
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Version</span>
            <span className={styles.aboutVal}>v2.6</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Stream API</span>
            <span className={styles.aboutVal}>Crysoline v1</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>Metadata</span>
            <span className={styles.aboutVal}>AniList GraphQL</span>
          </div>
          <div className={styles.aboutLinks}>
            <Link href="/about"   className={styles.aboutLink}>About</Link>
            <Link href="/privacy" className={styles.aboutLink}>Privacy</Link>
            <Link href="/terms"   className={styles.aboutLink}>Terms</Link>
            <Link href="/dmca"    className={styles.aboutLink}>DMCA</Link>
          </div>
        </Section>

      </div>
    </div>
  );
}

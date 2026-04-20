"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./features.module.css";

// ── Scene data ───────────────────────────────────────────────────────────────

const SCENES = [
  {
    id: "intro",
    eyebrow: null,
    headline: ["The Abyss", "Awaits."],
    body: "Stream anime. No subscriptions. No soul required.",
    accent: "crimson",
    visual: "skull",
  },
  {
    id: "sources",
    eyebrow: "Multi-Source Engine",
    headline: ["Two portals.", "One gateway."],
    body: "AnimeGG and Anizone — two independent CDNs race to deliver your stream. If one falls, the other rises without a single click.",
    accent: "purple",
    visual: "sources",
  },
  {
    id: "player",
    eyebrow: "Obsidian Player",
    headline: ["Built for", "the ritual."],
    body: "HLS adaptive streaming. Theatre mode. Screenshot. Keyboard shortcuts. AniSkip integration. Picture-in-Picture. Every detail forged in darkness.",
    accent: "crimson",
    visual: "player",
  },
  {
    id: "subdub",
    eyebrow: "Sub & Dub",
    headline: ["Choose your", "tongue."],
    body: "Japanese audio with subtitles or English dub where voices have been reforged. Your preference persists across every episode.",
    accent: "gold",
    visual: "subdub",
  },
  {
    id: "anilist",
    eyebrow: "AniList Sync",
    headline: ["Your conquests,", "bound."],
    body: "Connect your AniList account. Your watch list, ratings, and progress follow you through every session. Log episodes with one touch.",
    accent: "purple",
    visual: "anilist",
  },
  {
    id: "schedule",
    eyebrow: "Airing Schedule",
    headline: ["Know when", "souls are released."],
    body: "A weekly calendar of every series currently airing. Never miss a new episode from purgatory.",
    accent: "crimson",
    visual: "schedule",
  },
  {
    id: "free",
    eyebrow: "Always Free",
    headline: ["No price.", "No ads.", "No mercy."],
    body: "AnimeDex is open-source and free forever. Your soul was the only currency we ever wanted.",
    accent: "gold",
    visual: "free",
  },
  {
    id: "cta",
    eyebrow: null,
    headline: ["Enter.", ""],
    body: null,
    accent: "crimson",
    visual: "cta",
  },
];

// ── SVG Visuals ───────────────────────────────────────────────────────────────

function SkullVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 220" fill="none">
      <defs>
        <radialGradient id="skullGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c0394d" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#c0394d" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="90" rx="80" ry="100" fill="url(#skullGlow)" className={styles.glowPulse}/>
      <path d="M52 20 C48 54 58 78 66 92 C58 78 46 52 52 20Z" fill="currentColor" opacity="0.8" className={styles.floatSlow}/>
      <path d="M148 20 C152 54 142 78 134 92 C142 78 154 52 148 20Z" fill="currentColor" opacity="0.8" className={styles.floatSlow}/>
      <ellipse cx="100" cy="98" rx="62" ry="58" fill="currentColor" opacity="0.9"/>
      <path d="M60 122 C58 144 64 158 72 162 L74 162 C68 156 62 144 62 130Z" fill="currentColor" opacity="0.5"/>
      <path d="M140 122 C142 144 136 158 128 162 L126 162 C132 156 138 144 138 130Z" fill="currentColor" opacity="0.5"/>
      <path d="M72 148 Q100 162 128 148 L126 164 Q100 172 74 164Z" fill="currentColor" opacity="0.7"/>
      <rect x="82" y="160" width="8" height="14" rx="2" fill="#07060b" opacity="0.9"/>
      <rect x="95" y="160" width="8" height="17" rx="2" fill="#07060b" opacity="0.9"/>
      <rect x="108" y="160" width="8" height="14" rx="2" fill="#07060b" opacity="0.9"/>
      <path d="M92 108 L100 96 L108 108 L106 118 L94 118Z" fill="#07060b" opacity="0.9"/>
      <ellipse cx="80" cy="94" rx="18" ry="17" fill="#07060b" opacity="0.9"/>
      <ellipse cx="80" cy="94" rx="10" ry="9.5" fill="rgba(192,57,77,0.85)"/>
      <ellipse cx="80" cy="94" rx="4" ry="8" fill="#07060b"/>
      <ellipse cx="120" cy="94" rx="18" ry="17" fill="#07060b" opacity="0.9"/>
      <ellipse cx="120" cy="94" rx="10" ry="9.5" fill="rgba(192,57,77,0.85)"/>
      <ellipse cx="120" cy="94" rx="4" ry="8" fill="#07060b"/>
    </svg>
  );
}

function SourcesVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 200" fill="none">
      <circle cx="60"  cy="80"  r="32" stroke="#c0394d" strokeWidth="1.5" strokeDasharray="4 3" className={styles.rotateSlow} fill="rgba(192,57,77,0.06)"/>
      <circle cx="140" cy="80"  r="32" stroke="#9b59b6" strokeWidth="1.5" strokeDasharray="4 3" className={styles.rotateReverse} fill="rgba(155,89,182,0.06)"/>
      <circle cx="60"  cy="80"  r="18" fill="rgba(192,57,77,0.15)" stroke="#c0394d" strokeWidth="1"/>
      <circle cx="140" cy="80"  r="18" fill="rgba(155,89,182,0.15)" stroke="#9b59b6" strokeWidth="1"/>
      <text x="60" y="84" textAnchor="middle" fill="#c0394d" fontSize="9" fontFamily="Cinzel,serif" fontWeight="700">AnimeGG</text>
      <text x="140" y="84" textAnchor="middle" fill="#9b59b6" fontSize="9" fontFamily="Cinzel,serif" fontWeight="700">Anizone</text>
      <path d="M92 80 L108 80" stroke="#c9a96e" strokeWidth="1.5" strokeDasharray="3 2"/>
      <circle cx="100" cy="80" r="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="1"/>
      <circle cx="100" cy="150" r="24" fill="rgba(201,169,110,0.08)" stroke="#c9a96e" strokeWidth="1.5"/>
      <text x="100" y="154" textAnchor="middle" fill="#c9a96e" fontSize="8" fontFamily="Cinzel,serif" fontWeight="700">STREAM</text>
      <path d="M78 104 Q78 150 78 150 L76 150" stroke="rgba(192,57,77,0.4)" strokeWidth="1" className={styles.dashFlow}/>
      <path d="M122 104 Q122 150 122 150 L124 150" stroke="rgba(155,89,182,0.4)" strokeWidth="1" className={styles.dashFlow}/>
    </svg>
  );
}

function PlayerVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 180" fill="none">
      <rect x="20" y="30" width="160" height="100" rx="6" fill="rgba(13,11,20,0.9)" stroke="rgba(192,57,77,0.3)" strokeWidth="1"/>
      <rect x="28" y="38" width="144" height="72" rx="3" fill="rgba(7,6,11,0.8)"/>
      <polygon points="88,62 88,88 112,75" fill="#c0394d" opacity="0.9" className={styles.floatFast}/>
      <rect x="20" y="130" width="160" height="22" rx="0" fill="rgba(13,11,20,0.95)" stroke="rgba(192,57,77,0.15)" strokeWidth="1"/>
      <rect x="28" y="136" width="100" height="3" rx="1.5" fill="rgba(255,255,255,0.08)"/>
      <rect x="28" y="136" width="42" height="3" rx="1.5" fill="#c0394d"/>
      <circle cx="70" cy="137.5" r="3.5" fill="#c0394d"/>
      {[148,158,168,178].map((x,i) => (
        <rect key={i} x={x-3} y="135" width="6" height="5" rx="1" fill="rgba(255,255,255,0.15)"/>
      ))}
    </svg>
  );
}

function SubDubVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 160" fill="none">
      <rect x="20" y="30" width="160" height="60" rx="6" fill="rgba(13,11,20,0.8)" stroke="rgba(192,57,77,0.2)" strokeWidth="1"/>
      {[50,70,90].map((y,i)=>(
        <rect key={i} x="32" y={y} width={[80,110,60][i]} height="6" rx="3" fill="rgba(255,255,255,0.06)"/>
      ))}
      <rect x="32" y="50" width="80" height="6" rx="3" fill="rgba(255,255,255,0.18)"/>
      <text x="32" y="115" fill="#c0394d" fontSize="10" fontFamily="Cinzel,serif" fontWeight="700">SUB</text>
      <text x="32" y="130" fill="rgba(192,57,77,0.4)" fontSize="9" fontFamily="Inter,sans-serif">Japanese · English</text>
      <text x="120" y="115" fill="#9b59b6" fontSize="10" fontFamily="Cinzel,serif" fontWeight="700">DUB</text>
      <text x="120" y="130" fill="rgba(155,89,182,0.4)" fontSize="9" fontFamily="Inter,sans-serif">English</text>
      <line x1="104" y1="105" x2="104" y2="135" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
    </svg>
  );
}

function AniListVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 180" fill="none">
      <circle cx="100" cy="80" r="50" fill="rgba(155,89,182,0.07)" stroke="rgba(155,89,182,0.25)" strokeWidth="1.5" className={styles.glowPulse}/>
      <text x="100" y="71" textAnchor="middle" fill="#9b59b6" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">AniList</text>
      <text x="100" y="85" textAnchor="middle" fill="rgba(155,89,182,0.6)" fontSize="9" fontFamily="Inter,sans-serif">Connected</text>
      {[["Watching","32","#c0394d"],["Completed","148","#c9a96e"],["Planning","68","#9b59b6"]].map(([label,val,color],i) => (
        <g key={i} transform={`translate(${20 + i*60},130)`}>
          <rect width="52" height="32" rx="4" fill="rgba(13,11,20,0.8)" stroke={`${color}40`} strokeWidth="1"/>
          <text x="26" y="14" textAnchor="middle" fill={color} fontSize="13" fontFamily="Cinzel,serif" fontWeight="700">{val}</text>
          <text x="26" y="25" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="Inter,sans-serif">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function ScheduleVisual() {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const active = [1,3,4];
  return (
    <svg className={styles.visual} viewBox="0 0 200 160" fill="none">
      {days.map((d,i) => (
        <g key={d} transform={`translate(${14 + i*26},30)`}>
          <rect width="22" height="90" rx="3"
            fill={active.includes(i) ? "rgba(192,57,77,0.12)" : "rgba(13,11,20,0.6)"}
            stroke={active.includes(i) ? "rgba(192,57,77,0.35)" : "rgba(255,255,255,0.05)"}
            strokeWidth="1"/>
          {active.includes(i) && (
            <rect x="3" y={[20,40,55][active.indexOf(i)]} width="16" height="14" rx="2" fill="rgba(192,57,77,0.4)"/>
          )}
          <text x="11" y="102" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="Inter,sans-serif">{d}</text>
        </g>
      ))}
    </svg>
  );
}

function FreeVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 180" fill="none">
      <defs>
        <radialGradient id="freeGlow" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#c9a96e" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="85" r="70" fill="url(#freeGlow)" className={styles.glowPulse}/>
      <text x="100" y="78" textAnchor="middle" fill="#c9a96e" fontSize="32" fontFamily="Cinzel,serif" fontWeight="900" className={styles.floatSlow}>∞</text>
      <text x="100" y="100" textAnchor="middle" fill="rgba(201,169,110,0.5)" fontSize="10" fontFamily="Cinzel,serif">FOREVER FREE</text>
      {[130,145,160].map((y,i)=>(
        <rect key={i} x="55" y={y} width={[90,70,80][i]} height="4" rx="2" fill="rgba(201,169,110,0.08)"/>
      ))}
    </svg>
  );
}

function CtaVisual() {
  return (
    <svg className={styles.visual} viewBox="0 0 200 200" fill="none">
      <defs>
        <radialGradient id="ctaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c0394d" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#c0394d" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#ctaGlow)" className={styles.glowPulse}/>
      <circle cx="100" cy="100" r="50" stroke="rgba(192,57,77,0.3)" strokeWidth="1" strokeDasharray="6 4" className={styles.rotateSlow}/>
      <circle cx="100" cy="100" r="30" stroke="rgba(192,57,77,0.5)" strokeWidth="1.5" strokeDasharray="4 3" className={styles.rotateReverse}/>
      <polygon points="88,86 88,114 116,100" fill="#c0394d" opacity="0.9" className={styles.glowPulse}/>
    </svg>
  );
}

const VISUALS = { skull:SkullVisual, sources:SourcesVisual, player:PlayerVisual, subdub:SubDubVisual, anilist:AniListVisual, schedule:ScheduleVisual, free:FreeVisual, cta:CtaVisual };

// ── Main component ───────────────────────────────────────────────────────────

export default function FeaturesClient() {
  const [active, setActive]   = useState(0);
  const [fading, setFading]   = useState(false);
  const intervalRef           = useRef(null);
  const scene                 = SCENES[active];
  const Visual                = VISUALS[scene.visual];

  const goTo = (idx) => {
    if (idx === active) return;
    setFading(true);
    setTimeout(() => { setActive(idx); setFading(false); }, 320);
  };

  const advance = () => goTo((active + 1) % SCENES.length);

  useEffect(() => {
    intervalRef.current = setInterval(advance, 5000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const resetTimer = (idx) => {
    clearInterval(intervalRef.current);
    goTo(idx);
    intervalRef.current = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % SCENES.length;
        return next;
      });
    }, 5000);
  };

  const accentVar = scene.accent === "purple" ? "var(--purple)"
                  : scene.accent === "gold"   ? "var(--gold)"
                  : "var(--accent)";

  return (
    <div className={styles.page}>

      {/* Ambient background */}
      <div className={styles.ambientBg} aria-hidden="true">
        <div className={styles.orb1} style={{ background: `radial-gradient(circle, ${accentVar}22 0%, transparent 70%)` }} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} key={`${active}-prog`} />
      </div>

      {/* Main scene */}
      <div className={`${styles.scene} ${fading ? styles.fadeOut : styles.fadeIn}`}>

        {/* Left: text */}
        <div className={styles.textSide}>
          {scene.eyebrow && (
            <div className={styles.eyebrow} style={{ color: accentVar }}>
              <span className={styles.eyebrowLine} style={{ background: accentVar }} />
              {scene.eyebrow}
            </div>
          )}

          <h1 className={styles.headline}>
            {scene.headline.map((line, i) => (
              <span key={i} className={styles.headlineLine} style={i === 0 ? { color: accentVar } : {}}>
                {line}
              </span>
            ))}
          </h1>

          {scene.body && <p className={styles.body}>{scene.body}</p>}

          {scene.id === "cta" && (
            <div className={styles.ctaBtns}>
              <Link href="/" className={styles.ctaBtnPrimary}>Enter the Abyss</Link>
              <Link href="/browse?category=top-airing" className={styles.ctaBtnSecondary}>Browse Anime</Link>
            </div>
          )}

          {/* Scene counter */}
          <div className={styles.sceneCounter}>
            <span className={styles.sceneNum}>{String(active + 1).padStart(2,"0")}</span>
            <span className={styles.sceneSep}>/</span>
            <span className={styles.sceneTotal}>{String(SCENES.length).padStart(2,"0")}</span>
          </div>
        </div>

        {/* Right: visual */}
        <div className={styles.visualSide} style={{ color: accentVar }}>
          <div className={styles.visualWrap}>
            <Visual />
          </div>
        </div>
      </div>

      {/* Dot navigation */}
      <nav className={styles.dots}>
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.dot} ${i === active ? styles.dotActive : ""}`}
            onClick={() => resetTimer(i)}
            aria-label={s.eyebrow || s.id}
            style={i === active ? { background: accentVar } : {}}
          />
        ))}
      </nav>

      {/* Prev / Next */}
      <div className={styles.navBtns}>
        <button className={styles.navBtn} onClick={() => resetTimer((active - 1 + SCENES.length) % SCENES.length)}>←</button>
        <button className={styles.navBtn} onClick={() => resetTimer((active + 1) % SCENES.length)}>→</button>
      </div>

      {/* Back link */}
      <Link href="/" className={styles.backLink}>← Back to AnimeDex</Link>
    </div>
  );
}

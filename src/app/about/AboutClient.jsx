"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./about.module.css";

const STATS = [
  { value: "12,000+", label: "Souls catalogued" },
  { value: "2",       label: "Active sources" },
  { value: "HD",      label: "Stream quality" },
  { value: "∞",       label: "Free forever" },
];

const FEATURES = [
  {
    icon: "▶",
    title: "HD Streaming",
    desc: "1080p where available. HLS adaptive streaming via hls.js — quality scales to your connection automatically.",
  },
  {
    icon: "⛓",
    title: "Multi-Source Fallback",
    desc: "AnimeGG is the primary source. Anizone waits in the shadows. If one falls, the other rises automatically.",
  },
  {
    icon: "👁",
    title: "No Account Required",
    desc: "Walk into the abyss unannounced. Connect AniList optionally to bind your progress across realms.",
  },
  {
    icon: "📜",
    title: "Sub & Dub",
    desc: "Original Japanese audio with subtitles, or English dub where the voices have been reforged.",
  },
  {
    icon: "🗓",
    title: "Airing Schedule",
    desc: "A weekly calendar of souls currently being released from purgatory into the mortal realm.",
  },
  {
    icon: "🔗",
    title: "AniList Sync",
    desc: "Bind your AniList account. Your conquests, ratings, and progress follow you through every session.",
  },
];

const STACK = [
  { name: "Next.js 15",      role: "Framework"   },
  { name: "React 19",        role: "UI Layer"     },
  { name: "Framer Motion",   role: "Animation"    },
  { name: "AniList GraphQL", role: "Metadata"     },
  { name: "Crysoline API",   role: "Stream source" },
  { name: "hls.js",          role: "HLS playback" },
  { name: "Upstash Redis",   role: "Edge cache"   },
  { name: "Turso SQLite",    role: "Persistence"  },
  { name: "Cloudflare",      role: "CDN proxy"    },
  { name: "Vercel",          role: "Hosting"      },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.16,1,0.3,1] } }),
};

export default function AboutClient() {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.pentagram} />
        </div>

        <motion.div className={styles.heroInner}
          initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div className={styles.badge} variants={fadeUp}>
            ⚗ Open Source · Free Forever
          </motion.div>
          <motion.h1 className={styles.heroTitle} variants={fadeUp}>
            Summoned from<br />
            <span className={styles.accent}>the Abyss.</span>
          </motion.h1>
          <motion.p className={styles.heroSub} variants={fadeUp}>
            AnimeDex is a free, open-source anime streaming aggregator.
            We don't host video — we conjure streams from publicly accessible sources
            and deliver them through a clean, crimson-veined player.
          </motion.p>
          <motion.div className={styles.stats} variants={fadeUp}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What dwells within</h2>
            <p className={styles.sectionSub}>No subscriptions. No ads. No mercy.</p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className={styles.featureCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16,1,0.3,1] }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The ritual</h2>
          </div>
          <div className={styles.steps}>
            {[
              { n: "I",   title: "Seek the soul",      desc: "Search or browse over 12,000 anime titles. All metadata and artwork are drawn from AniList's sacred GraphQL API." },
              { n: "II",  title: "Choose your episode", desc: "Episode lists are fetched from Crysoline's streaming API in real time. Sub and dub options appear when the source carries them." },
              { n: "III", title: "The stream begins",   desc: "HLS streams play directly in your browser. If the primary source fails, the fallback source is invoked automatically." },
            ].map((step, i) => (
              <motion.div key={step.n} className={styles.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}>
                <div className={styles.stepNum}>{step.n}</div>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The grimoire</h2>
            <p className={styles.sectionSub}>Technologies that fuel the engine.</p>
          </div>
          <div className={styles.stackGrid}>
            {STACK.map((t, i) => (
              <motion.div key={t.name} className={styles.stackChip}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}>
                <span className={styles.stackName}>{t.name}</span>
                <span className={styles.stackRole}>{t.role}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.disclaimer}>
            <div className={styles.disclaimerIcon}>⚠</div>
            <div>
              <h3 className={styles.disclaimerTitle}>Important notice</h3>
              <p className={styles.disclaimerText}>
                AnimeDex is an aggregator and does not host, store, or distribute any
                video files. All streams originate from publicly accessible third-party
                providers. If you are a rights holder and believe content should be removed,
                contact us at{" "}
                <a href="mailto:contact@animedex.pp.ua" className={styles.disclaimerLink}>
                  contact@animedex.pp.ua
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Your soul was already ours.</h2>
          <p className={styles.ctaSub}>The abyss is patient. Return when ready.</p>
          <div className={styles.ctaBtns}>
            <Link href="/" className={styles.btnPrimary}>Enter the Abyss</Link>
            <Link href="/browse?category=top-airing" className={styles.btnSecondary}>What's Airing</Link>
          </div>
        </div>
      </section>

    </div>
  );
}

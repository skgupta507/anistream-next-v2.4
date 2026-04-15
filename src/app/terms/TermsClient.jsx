"use client";
import Link from "next/link";
import styles from "./terms.module.css";

const LAST_UPDATED = "January 1, 2025";

const SECTIONS = [
  {
    id: "acceptance", title: "1. Acceptance",
    content: "By accessing animedex.pp.ua (the \"Service\"), you agree to these Terms. If you disagree, do not use the Service. These terms apply to all visitors.",
  },
  {
    id: "service", title: "2. What AnimeDex is",
    content: "AnimeDex is an aggregator that indexes and proxies publicly accessible anime streams. We do not produce, upload, host, or store video files. The Service provides:",
    items: [
      "A search and discovery interface for anime titles using AniList's public GraphQL API.",
      "A video player loading HLS streams from Crysoline's streaming API.",
      "Optional AniList account integration for watch-list synchronization.",
      "Locally-stored watch history (on your device only).",
    ],
  },
  {
    id: "use", title: "3. Permitted use",
    content: "You may use the Service for personal, non-commercial anime viewing. You may not:",
    items: [
      "Scrape, crawl, or systematically download content from the Service.",
      "Attempt to circumvent or disable security features.",
      "Use the Service to distribute malware, spam, or harmful content.",
      "Impersonate another user or entity.",
      "Use automated tools to place excessive load on the Service.",
      "Extract streaming URLs at scale for redistribution.",
    ],
  },
  {
    id: "ip", title: "4. Intellectual property",
    content: "AnimeDex claims no ownership of any anime content accessible through the Service. All anime titles, artwork, and related IP belong to their respective rights holders. AnimeDex's own code is MIT-licensed. The AnimeDex name, demon skull logo, and site design are ours.",
  },
  {
    id: "dmca", title: "5. DMCA & content removal",
    content: "We respect copyright. If you are a rights holder and believe content accessible through the Service infringes your copyright, send a notice to contact@animedex.pp.ua including:",
    items: [
      "Identification of the copyrighted work you claim is infringed.",
      "Identification of the infringing material and its location on the Service.",
      "Your contact information (name, address, phone, email).",
      "A statement of good-faith belief that the use is not authorised.",
      "A statement, under penalty of perjury, that the information is accurate and you are authorised to act.",
    ],
    footer: "We process valid DMCA notices promptly.",
  },
  {
    id: "third-party", title: "6. Third-party services",
    content: "The Service integrates with AniList, Crysoline, AnimeGG, Anizone, and Cloudflare. We are not responsible for the content, availability, or privacy practices of these services. Your use is governed by their respective terms.",
  },
  {
    id: "disclaimers", title: "7. Disclaimers",
    items: [
      "The Service is provided \"AS IS\" without warranties of any kind.",
      "We do not warrant uninterrupted access or stream availability at any given time.",
      "Stream availability depends entirely on third-party sources outside our control.",
      "We are not liable for indirect, incidental, or consequential damages.",
      "Our total liability for any claim is zero — the Service is free.",
    ],
  },
  {
    id: "anilist", title: "8. AniList account",
    content: "Connecting AniList is optional. If you do:",
    items: [
      "You grant AnimeDex permission to read and write to your AniList media list on your behalf.",
      "Your access token is stored as a secure httpOnly cookie on your device.",
      "You can revoke access at any time from anilist.co/settings/apps.",
      "We do not store your AniList credentials on our servers.",
    ],
  },
  {
    id: "changes", title: "9. Changes",
    content: "We may update these terms. Continued use after changes constitutes acceptance. We encourage periodic review.",
  },
  {
    id: "contact", title: "10. Contact",
    content: "Questions about these terms? Speak your query into the void:",
    contact: "contact@animedex.pp.ua",
  },
];

export default function TermsClient() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <span>Terms of Service</span>
          </div>
          <h1 className={styles.heroTitle}>Terms of Service</h1>
          <p className={styles.heroMeta}>Last updated: {LAST_UPDATED}</p>
          <p className={styles.heroSub}>
            The pact you seal when you enter the abyss. Plain language, fair terms.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.toc}>
          <div className={styles.tocInner}>
            <p className={styles.tocLabel}>Sections</p>
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className={styles.tocLink}>{s.title}</a>
            ))}
          </div>
        </aside>

        <main className={styles.content}>
          <div className={styles.tldr}>
            <span className={styles.tldrBadge}>TL;DR</span>
            <span>Don't scrape us, don't abuse streams, respect copyright holders. Everything else is permitted.</span>
          </div>

          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className={styles.section}>
              <h2 className={styles.secTitle}>{s.title}</h2>
              {s.content && <p className={styles.para}>{s.content}</p>}
              {s.items && (
                <ul className={styles.list}>
                  {s.items.map((item, i) => <li key={i} className={styles.listItem}>{item}</li>)}
                </ul>
              )}
              {s.footer && <p className={styles.para} style={{marginTop:"12px"}}>{s.footer}</p>}
              {s.contact && <a href={`mailto:${s.contact}`} className={styles.contactLink}>{s.contact}</a>}
            </section>
          ))}
          <div className={styles.navLinks}>
            <Link href="/privacy" className={styles.navLink}>Privacy Policy →</Link>
            <Link href="/about"   className={styles.navLink}>About AnimeDex →</Link>
          </div>
        </main>
      </div>
    </div>
  );
}

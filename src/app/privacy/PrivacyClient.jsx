"use client";
import Link from "next/link";
import styles from "./policy.module.css";

const LAST_UPDATED = "January 1, 2025";

const SECTIONS = [
  {
    id: "overview", title: "Overview",
    content: `AnimeDex ("we", "our", "us") is committed to protecting your privacy. This policy explains what information we collect when you use animedex.pp.ua (the "Service"), how we use it, and the controls you have. We keep this plainspoken — no legalese.`,
  },
  {
    id: "collect", title: "What we collect",
    subsections: [
      {
        title: "Information you provide",
        items: [
          "AniList OAuth token — stored as an httpOnly cookie when you choose to log in. Used solely to sync your watch list. We never see or store your AniList password.",
          "AniList profile data — your username, avatar, and list entries, fetched on demand via the AniList GraphQL API with your token.",
        ],
      },
      {
        title: "Automatically collected",
        items: [
          "Watch history — stored entirely in your browser's localStorage. Never sent to any server. Never leaves your device unless you sync via AniList.",
          "Stream source preference — saved in localStorage so your preferred source persists between sessions.",
          "Server logs — Vercel (our host) may retain standard request logs including IP address, user agent, and URL per Vercel's data policy.",
        ],
      },
      {
        title: "What we do NOT collect",
        items: [
          "No email address or personal identification.",
          "No payment information. The service is free.",
          "No third-party advertising cookies or tracking pixels.",
          "No fingerprinting scripts.",
        ],
      },
    ],
  },
  {
    id: "cookies", title: "Cookies & local storage",
    content: "We set exactly two cookies:",
    items: [
      "al_token — httpOnly, Secure, SameSite=Lax. Your AniList access token. Set only on login. Expires in 30 days or on logout.",
      "al_user — SameSite=Lax. Your AniList display name and avatar URL in JSON. Set alongside al_token.",
    ],
    footer: "Watch history and player preferences are stored in localStorage only — on your device, never on our servers.",
  },
  {
    id: "third-party", title: "Third-party services",
    items: [
      "AniList — all anime metadata, artwork, and OAuth. Your use is subject to AniList's own privacy policy.",
      "Crysoline API — provides stream source data. Your IP may be visible to Crysoline's servers during server-side fetches.",
      "Cloudflare — CDN and worker proxy. Subject to Cloudflare's privacy policy.",
      "Vercel — hosting provider. Subject to Vercel's privacy policy.",
      "Upstash / Turso — server-side API response caching only. No personal data is cached.",
    ],
  },
  {
    id: "deletion", title: "Data retention & deletion",
    content: "We maintain no user database. To erase all data associated with your use of AnimeDex:",
    items: [
      "Log out via the profile menu — instantly clears al_token and al_user cookies.",
      "Clear site data in your browser settings — removes all localStorage (history, preferences).",
      "Revoke the AnimeDex app at anilist.co/settings/apps — invalidates the token server-side.",
    ],
  },
  {
    id: "security", title: "Security",
    content: "Your AniList token lives in an httpOnly cookie — inaccessible to JavaScript, protecting against XSS. All traffic is served over HTTPS. Content Security Policy headers restrict what scripts and frames may execute on the site.",
  },
  {
    id: "children", title: "Children's privacy",
    content: "AnimeDex is not directed at children under 13. We do not knowingly collect personal information from children. Contact us if you believe a child has provided personal information and we will delete it promptly.",
  },
  {
    id: "changes", title: "Changes",
    content: `We may update this policy. Material changes will be shown by an updated "Last updated" date. Continued use constitutes acceptance.`,
  },
  {
    id: "contact", title: "Contact",
    content: "Questions? Reach the abyss at:",
    contact: "contact@animedex.pp.ua",
  },
];

export default function PrivacyClient() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <span>Privacy Policy</span>
          </div>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroMeta}>Last updated: {LAST_UPDATED}</p>
          <p className={styles.heroSub}>
            The short version: we collect almost nothing, store even less, and never sell your soul.
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
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className={styles.section}>
              <h2 className={styles.secTitle}>{s.title}</h2>
              {s.content && <p className={styles.para}>{s.content}</p>}
              {s.subsections?.map(sub => (
                <div key={sub.title} className={styles.subsection}>
                  <h3 className={styles.subTitle}>{sub.title}</h3>
                  <ul className={styles.list}>
                    {sub.items.map((item, i) => <li key={i} className={styles.listItem}>{item}</li>)}
                  </ul>
                </div>
              ))}
              {s.items && !s.subsections && (
                <ul className={styles.list}>
                  {s.items.map((item, i) => <li key={i} className={styles.listItem}>{item}</li>)}
                </ul>
              )}
              {s.footer && <p className={styles.para} style={{marginTop:"12px"}}>{s.footer}</p>}
              {s.contact && <a href={`mailto:${s.contact}`} className={styles.contactLink}>{s.contact}</a>}
            </section>
          ))}
          <div className={styles.navLinks}>
            <Link href="/terms" className={styles.navLink}>Terms of Service →</Link>
            <Link href="/about" className={styles.navLink}>About AnimeDex →</Link>
          </div>
        </main>
      </div>
    </div>
  );
}

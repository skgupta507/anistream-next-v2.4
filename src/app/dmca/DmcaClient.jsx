"use client";
import Link from "next/link";
import styles from "./dmca.module.css";

export default function DmcaClient() {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadLink}>Home</Link>
            <span className={styles.breadSep}>›</span>
            <span>DMCA</span>
          </div>
          <h1 className={styles.heroTitle}>DMCA &amp; Copyright</h1>
          <p className={styles.heroSub}>
            AnimeDex respects intellectual property rights. This page explains how to
            report copyright infringement and what happens when we receive a valid notice.
          </p>
        </div>
      </div>

      <div className={styles.content}>

        {/* Notice callout */}
        <div className={styles.notice}>
          <div className={styles.noticeIcon}>⚠</div>
          <div>
            <h2 className={styles.noticeTitle}>Important: We do not host video content</h2>
            <p className={styles.noticeText}>
              AnimeDex is a content aggregator. We do not upload, store, or distribute any
              video files. All streams are sourced from publicly accessible third-party providers.
              If you believe content accessible through our site infringes your copyright,
              we will investigate and take appropriate action.
            </p>
          </div>
        </div>

        {/* Sections */}
        <section className={styles.section}>
          <h2 className={styles.secTitle}>How to submit a DMCA takedown notice</h2>
          <p className={styles.para}>
            To request removal of content you believe infringes your copyright, send a
            written notice to our designated agent at{" "}
            <a href="mailto:dmca@animedex.pp.ua" className={styles.link}>dmca@animedex.pp.ua</a>.
            Your notice must include all of the following:
          </p>
          <ol className={styles.list}>
            <li className={styles.listItem}>
              <strong>Identification of the copyrighted work</strong> — a description of the
              copyrighted work you claim has been infringed. If multiple works are covered by
              a single notice, a representative list is acceptable.
            </li>
            <li className={styles.listItem}>
              <strong>Identification of the infringing material</strong> — the specific URL(s)
              on animedex.pp.ua where the allegedly infringing content is accessible.
            </li>
            <li className={styles.listItem}>
              <strong>Your contact information</strong> — your full name, mailing address,
              telephone number, and email address.
            </li>
            <li className={styles.listItem}>
              <strong>Good-faith statement</strong> — a statement that you have a good-faith
              belief that use of the material in the manner complained of is not authorised by
              the copyright owner, its agent, or the law.
            </li>
            <li className={styles.listItem}>
              <strong>Accuracy statement</strong> — a statement, made under penalty of perjury,
              that the information in the notification is accurate and that you are the copyright
              owner or authorised to act on behalf of the copyright owner.
            </li>
            <li className={styles.listItem}>
              <strong>Signature</strong> — a physical or electronic signature of the copyright
              owner or a person authorised to act on their behalf.
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.secTitle}>What happens after we receive your notice</h2>
          <div className={styles.timeline}>
            {[
              { step: "01", title: "Review", desc: "We review the notice within 2–5 business days to confirm it meets DMCA requirements." },
              { step: "02", title: "Action",  desc: "If valid, we disable access to the reported content or remove it from our index." },
              { step: "03", title: "Notice",  desc: "We notify the alleged infringer, who may submit a counter-notice if they believe the removal was in error." },
              { step: "04", title: "Resolve", desc: "If a counter-notice is received and we do not receive notice of legal action within 10 business days, content may be restored." },
            ].map(s => (
              <div key={s.step} className={styles.timelineStep}>
                <div className={styles.timelineNum}>{s.step}</div>
                <div>
                  <h3 className={styles.timelineTitle}>{s.title}</h3>
                  <p className={styles.timelineDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.secTitle}>Counter-notice procedure</h2>
          <p className={styles.para}>
            If you believe content was removed as a result of a mistake or
            misidentification, you may submit a counter-notice to{" "}
            <a href="mailto:dmca@animedex.pp.ua" className={styles.link}>dmca@animedex.pp.ua</a>.
            A valid counter-notice must include:
          </p>
          <ol className={styles.list}>
            <li className={styles.listItem}>Identification of the removed material and its former location on our site.</li>
            <li className={styles.listItem}>A statement under penalty of perjury that you have a good-faith belief that the material was removed by mistake.</li>
            <li className={styles.listItem}>Your name, address, telephone number, and consent to the jurisdiction of the relevant court.</li>
            <li className={styles.listItem}>Your physical or electronic signature.</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.secTitle}>Repeat infringers</h2>
          <p className={styles.para}>
            AnimeDex has a policy of terminating accounts of users who are repeat infringers
            in appropriate circumstances. We comply fully with the requirements of the
            Digital Millennium Copyright Act (17 U.S.C. § 512).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.secTitle}>Contact</h2>
          <p className={styles.para}>All DMCA notices and counter-notices should be sent to:</p>
          <div className={styles.contactCard}>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Email</span>
              <a href="mailto:dmca@animedex.pp.ua" className={styles.link}>dmca@animedex.pp.ua</a>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>General</span>
              <a href="mailto:contact@animedex.pp.ua" className={styles.link}>contact@animedex.pp.ua</a>
            </div>
          </div>
          <p className={styles.paraSmall}>
            We aim to respond to all valid DMCA notices within 2–5 business days.
            Frivolous or incomplete notices will not be processed.
          </p>
        </section>

        <div className={styles.navLinks}>
          <Link href="/privacy" className={styles.navLink}>Privacy Policy →</Link>
          <Link href="/terms"   className={styles.navLink}>Terms of Service →</Link>
          <Link href="/about"   className={styles.navLink}>About AnimeDex →</Link>
        </div>

      </div>
    </div>
  );
}

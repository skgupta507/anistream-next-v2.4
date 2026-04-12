"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import styles from "./Navbar.module.css";

/* ── AnimeDex demon skull — properly proportioned ─────────── */
function AnimeDexIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
      {/* Left horn: base y=20, tip y=2 */}
      <path d="M18 20 C15 11 13 5 16 2 C19 5 20 11 20 20Z" fill="currentColor" opacity="0.92"/>
      {/* Right horn */}
      <path d="M46 20 C49 11 51 5 48 2 C45 5 44 11 44 20Z" fill="currentColor" opacity="0.92"/>
      {/* Cranium: centred lower so brow/eyes are fully visible */}
      <ellipse cx="32" cy="31" rx="18" ry="16" fill="currentColor" opacity="0.96"/>
      {/* Cheekbones / sides */}
      <path d="M15 35 C13 42 15 50 19 54 L22 53 C18 49 16 43 17 37Z" fill="currentColor" opacity="0.72"/>
      <path d="M49 35 C51 42 49 50 45 54 L42 53 C46 49 48 43 47 37Z" fill="currentColor" opacity="0.72"/>
      {/* Jaw */}
      <path d="M22 49 Q32 57 42 49 L41 58 Q32 63 23 58Z" fill="currentColor" opacity="0.80"/>
      {/* Teeth — inside jaw, so bg-colored */}
      <rect x="24.5" y="54" width="3"   height="5"   rx="1" fill="rgba(7,6,11,1)"/>
      <rect x="28.5" y="53" width="3.5" height="6.5" rx="1" fill="rgba(7,6,11,1)"/>
      <rect x="33"   y="53" width="3.5" height="6.5" rx="1" fill="rgba(7,6,11,1)"/>
      <rect x="37.5" y="54" width="3"   height="5"   rx="1" fill="rgba(7,6,11,1)"/>
      {/* Nasal cavity */}
      <path d="M29 39 L32 34 L35 39 L34 43 L30 43Z" fill="rgba(7,6,11,0.9)"/>
      {/* Left eye socket — y=31 lines up with cranium centre */}
      <ellipse cx="23" cy="31" rx="6"   ry="5.5" fill="rgba(7,6,11,0.93)"/>
      <ellipse cx="23" cy="31" rx="4"   ry="3.8"  fill="rgba(255,60,85,0.92)"/>
      <ellipse cx="23" cy="31" rx="1.6" ry="3.2"  fill="rgba(7,6,11,1)"/>
      <ellipse cx="21.5" cy="29" rx="1" ry="1.5" fill="rgba(255,255,255,0.42)" transform="rotate(-15,21.5,29)"/>
      {/* Right eye socket */}
      <ellipse cx="41" cy="31" rx="6"   ry="5.5" fill="rgba(7,6,11,0.93)"/>
      <ellipse cx="41" cy="31" rx="4"   ry="3.8"  fill="rgba(255,60,85,0.92)"/>
      <ellipse cx="41" cy="31" rx="1.6" ry="3.2"  fill="rgba(7,6,11,1)"/>
      <ellipse cx="39.5" cy="29" rx="1" ry="1.5" fill="rgba(255,255,255,0.42)" transform="rotate(-15,39.5,29)"/>
    </svg>
  );
}

export default function Navbar() {
  const [query, setQuery]     = useState("");
  const [suggestions, setSug] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [scrolled, setScroll] = useState(false);
  const [mobileOpen, setMob]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const debounce = useRef(null);
  const router   = useRouter();
  const pathname = usePathname();
  const { user, login } = useAuth();

  useEffect(() => {
    const fn = () => setScroll(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMob(false); setSearchOpen(false); }, [pathname]);

  function handleInput(e) {
    const v = e.target.value; setQuery(v);
    clearTimeout(debounce.current);
    if (!v.trim() || v.trim().length < 2) { setSug([]); setShowSug(false); return; }
    debounce.current = setTimeout(async () => {
      try { const d = await api.search(v, 1); setSug((d.animes || []).slice(0, 6)); setShowSug(true); } catch {}
    }, 400);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSug(false); setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function pick(anime) { setQuery(""); setShowSug(false); setSearchOpen(false); router.push(`/anime/${anime.id}`); }

  const navLinks = [
    { href: "/",                             label: "Home"     },
    { href: "/browse?category=top-airing",   label: "Explore"  },
    { href: "/browse?category=most-popular", label: "Popular"  },
    { href: "/schedule",                     label: "Schedule" },
  ];

  const isActive = (href) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname.startsWith(base);
  };

  return (
    <motion.nav
      className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Blood shimmer top edge */}
      <div className={styles.topEdge} />

      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimeDexIcon />
          </motion.div>
          <span className={styles.logoText}>
            <span className={styles.logoMain}>Anime</span><span className={styles.logoDex}>Dex</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className={styles.links}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`${styles.link} ${isActive(l.href) ? styles.active : ""}`}>
              {l.label}
              {isActive(l.href) && (
                <motion.span
                  className={styles.activeLine}
                  layoutId="navline"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className={styles.rightSide}>
          {/* Search */}
          <div className={`${styles.searchWrap} ${searchOpen ? styles.searchOpen : ""}`}>
            <form className={styles.searchForm} onSubmit={handleSubmit}>
              <motion.button
                type="button"
                className={styles.searchIconBtn}
                onClick={() => setSearchOpen(v => !v)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle search"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </motion.button>
              <input
                value={query}
                onChange={handleInput}
                onFocus={() => suggestions.length && setShowSug(true)}
                onBlur={() => setTimeout(() => setShowSug(false), 180)}
                placeholder="Name your prey…"
                className={styles.input}
                aria-label="Search"
              />
              <AnimatePresence>
                {showSug && suggestions.length > 0 && (
                  <motion.ul
                    className={styles.dropdown}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {suggestions.map(a => (
                      <motion.li
                        key={a.id}
                        className={styles.dropItem}
                        onMouseDown={() => pick(a)}
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.12 }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.poster} alt="" className={styles.dropImg} />
                        <div>
                          <p className={styles.dropTitle}>{a.name}</p>
                          <span className={styles.dropMeta}>{a.type} · {a.episodes?.sub ?? "?"} eps</span>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Auth */}
          {user ? (
            <Link href="/profile" className={styles.avatarBtn} title={user.name}>
              {user.avatar?.large
                ? <img src={user.avatar.large} alt={user.name} className={styles.avatarImg} />
                : <span className={styles.avatarInitial}>{user.name?.[0]?.toUpperCase()}</span>
              }
            </Link>
          ) : (
            <motion.button
              className={styles.loginBtn}
              onClick={login}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Enter
            </motion.button>
          )}

          {/* Burger */}
          <button className={styles.burger} onClick={() => setMob(!mobileOpen)} aria-label="Menu">
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.bL1 : ""}`} />
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.bL2 : ""}`} />
            <span className={`${styles.burgerLine} ${mobileOpen ? styles.bL3 : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <form className={styles.mobileSearch} onSubmit={handleSubmit}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name your prey…" />
              <button type="submit">Go</button>
            </form>
            <div className={styles.mobileLinks}>
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.22 }}
                >
                  <Link href={l.href}
                    className={`${styles.mobileLink} ${isActive(l.href) ? styles.mobileLinkActive : ""}`}>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              {user
                ? <Link href="/profile" className={styles.mobileLink}>Profile</Link>
                : <button className={`${styles.mobileLink} ${styles.mobileLoginBtn}`} onClick={login}>Sign in with AniList</button>
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toSlug } from "@/lib/utils";
import styles from "./ScheduleClient.module.css";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function getTodayName() {
  const d = new Date().getDay(); // 0=Sun
  const idx = d === 0 ? 6 : d - 1;
  return DAYS[idx];
}

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function ScheduleAnimeCard({ entry }) {
  const { anime, episode, airingTime } = entry;
  const slug = typeof anime.id === "number" ? toSlug(anime.name, anime.id) : anime.id;
  return (
    <Link href={`/anime/${slug}`} className={styles.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={anime.poster} alt={anime.name} className={styles.cardPoster} />
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{anime.name}</p>
        {anime.jname && anime.jname !== anime.name && (
          <p className={styles.cardJname}>{anime.jname}</p>
        )}
        <div className={styles.cardMeta}>
          {anime.type && <span className={styles.typePill}>{anime.type}</span>}
          <span className={styles.epPill}>Ep {episode}</span>
          {airingTime && (
            <span className={styles.timePill}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {formatTime(airingTime)}
            </span>
          )}
        </div>
        {anime.rating && (
          <div className={styles.cardRating}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {anime.rating}
          </div>
        )}
      </div>
    </Link>
  );
}

function UpcomingCard({ anime }) {
  const slug = typeof anime.id === "number" ? toSlug(anime.name, anime.id) : anime.id;
  return (
    <Link href={`/anime/${slug}`} className={styles.upcomingCard}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={anime.poster} alt={anime.name} className={styles.upcomingPoster} />
      <div className={styles.upcomingInfo}>
        <p className={styles.upcomingName}>{anime.name}</p>
        {anime.type && <span className={styles.typePill}>{anime.type}</span>}
        {anime.season && <span className={styles.seasonText}>{anime.season}</span>}
        {anime.description && (
          <p className={styles.upcomingDesc}>{anime.description.slice(0, 120)}…</p>
        )}
      </div>
    </Link>
  );
}

export default function ScheduleClient() {
  const [tab, setTab]               = useState("weekly");
  const [schedule, setSchedule]     = useState(null);
  const [upcoming, setUpcoming]     = useState([]);
  const [schedLoading, setSchedLoad] = useState(true);
  const [upcomLoading, setUpcomLoad] = useState(true);
  const [schedError, setSchedErr]   = useState(null);
  const [activeDay, setActiveDay]   = useState(getTodayName());

  // Fetch weekly schedule
  useEffect(() => {
    setSchedLoad(true);
    fetch("/api/anime/schedule")
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setSchedule(d.schedule || {});
        setSchedLoad(false);
      })
      .catch(e => { setSchedErr(e.message); setSchedLoad(false); });
  }, []);

  // Fetch upcoming (NOT_YET_RELEASED)
  useEffect(() => {
    setUpcomLoad(true);
    fetch("/api/anime/category/upcoming?page=1")
      .then(r => r.json())
      .then(d => { setUpcoming(d.animes || []); setUpcomLoad(false); })
      .catch(() => setUpcomLoad(false));
  }, []);

  const today = getTodayName();

  return (
    <div className={`container ${styles.page}`}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Schedule
        </h1>
        <p className={styles.pageSubtitle}>Track anime airing times and upcoming releases</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "weekly" ? styles.tabActive : ""}`}
          onClick={() => setTab("weekly")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Weekly Schedule
        </button>
        <button
          className={`${styles.tab} ${tab === "upcoming" ? styles.tabActive : ""}`}
          onClick={() => setTab("upcoming")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Upcoming Releases
          {upcoming.length > 0 && (
            <span className={styles.tabBadge}>{upcoming.length}</span>
          )}
        </button>
      </div>

      {/* ── Weekly Schedule Tab ────────────────────────────── */}
      {tab === "weekly" && (
        <div className={styles.weeklyWrap}>
          {/* Day selector */}
          <div className={styles.daySelector}>
            {DAYS.map(day => {
              const count = schedule?.[day]?.length ?? 0;
              return (
                <button
                  key={day}
                  className={`${styles.dayBtn} ${activeDay === day ? styles.dayBtnActive : ""} ${day === today ? styles.dayBtnToday : ""}`}
                  onClick={() => setActiveDay(day)}
                >
                  <span className={styles.dayName}>{day.slice(0, 3)}</span>
                  {day === today && <span className={styles.todayDot} />}
                  {!schedLoading && count > 0 && (
                    <span className={styles.dayCount}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Day content */}
          <div className={styles.dayContent}>
            <div className={styles.dayContentHeader}>
              <h2 className={styles.dayTitle}>
                {activeDay}
                {activeDay === today && <span className={styles.todayBadge}>Today</span>}
              </h2>
              {!schedLoading && schedule?.[activeDay] && (
                <span className={styles.countLabel}>
                  {schedule[activeDay].length} anime airing
                </span>
              )}
            </div>

            {schedLoading ? (
              <div className={styles.schedGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.cardSkel}>
                    <div className={`skeleton ${styles.cardSkelPoster}`} />
                    <div className={styles.cardSkelBody}>
                      <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, width: "50%", borderRadius: 4, marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 9, width: "60%", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : schedError ? (
              <div className={styles.errorState}>
                <span>⚠</span>
                <p>Failed to load schedule: {schedError}</p>
              </div>
            ) : !schedule?.[activeDay]?.length ? (
              <div className={styles.emptyState}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p>No anime airing on {activeDay} this week</p>
              </div>
            ) : (
              <div className={styles.schedGrid}>
                {schedule[activeDay].map((entry, i) => (
                  <ScheduleAnimeCard key={`${entry.anime?.id}-${i}`} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Upcoming Tab ───────────────────────────────────── */}
      {tab === "upcoming" && (
        <div className={styles.upcomingWrap}>
          <div className={styles.upcomingHeader}>
            <h2 className={styles.upcomingTitle}>Not Yet Released</h2>
            <p className={styles.upcomingSubtitle}>
              Anime announced or in production — not yet airing
            </p>
          </div>

          {upcomLoading ? (
            <div className={styles.upcomingGrid}>
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className={styles.upcomingSkel}>
                  <div className={`skeleton ${styles.upcomingSkelPoster}`} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 13, width: "70%", borderRadius: 4, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 10, width: "40%", borderRadius: 4, marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 9, width: "90%", borderRadius: 4, marginBottom: 5 }} />
                    <div className="skeleton" style={{ height: 9, width: "75%", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No upcoming anime found.</p>
            </div>
          ) : (
            <div className={styles.upcomingGrid}>
              {upcoming.slice(0, 15).map(anime => (
                <UpcomingCard key={anime.id} anime={anime} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

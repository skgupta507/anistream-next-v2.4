"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => { console.error("[error boundary]", error); }, [error]);

  return (
    <div style={{
      minHeight: "calc(100vh - var(--nav-h))",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", textAlign: "center", gap: "20px",
    }}>
      <p style={{ fontSize: "72px", lineHeight: 1, margin: 0 }}>⚡</p>
      <h2 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(22px, 4vw, 36px)",
        fontWeight: 700, color: "var(--text-1)", margin: 0,
        letterSpacing: "0.02em",
      }}>
        The ritual failed
      </h2>
      <p style={{
        fontSize: "14px", color: "var(--text-2)",
        maxWidth: "360px", lineHeight: 1.65, margin: 0,
      }}>
        An unexpected disturbance in the abyss. This is usually temporary — try invoking the spell again.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
        <button onClick={() => reset()} style={{
          padding: "11px 26px", borderRadius: "var(--r-md)",
          background: "var(--accent)", color: "#fff",
          fontWeight: 600, fontSize: "14px", cursor: "pointer",
          border: "none", fontFamily: "var(--font-body)",
        }}>
          Try again
        </button>
        <Link href="/" style={{
          padding: "11px 26px", borderRadius: "var(--r-md)",
          border: "1px solid var(--border-md)", color: "var(--text-1)",
          fontWeight: 600, fontSize: "14px",
          background: "var(--bg-elevated)", fontFamily: "var(--font-body)",
        }}>
          Flee to safety
        </Link>
      </div>
    </div>
  );
}

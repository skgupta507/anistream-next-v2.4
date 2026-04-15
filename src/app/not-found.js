import Link from "next/link";

export const metadata = { title: "404 — Lost in the Abyss | AnimeDex" };

export default function NotFound() {
  return (
    <div style={{
      minHeight: "calc(100vh - var(--nav-h))",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", textAlign: "center", gap: "20px",
    }}>
      <p style={{ fontSize: "72px", lineHeight: 1, margin: 0 }}>💀</p>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(26px, 5vw, 42px)",
        fontWeight: 700, color: "var(--text-1)", margin: 0,
        letterSpacing: "0.02em",
      }}>
        Lost in the abyss
      </h1>
      <p style={{
        fontSize: "15px", color: "var(--text-2)",
        maxWidth: "360px", lineHeight: 1.65, margin: 0,
      }}>
        The soul you seek has wandered beyond reach.
        This page doesn't exist or has been claimed by the void.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
        <Link href="/" style={{
          padding: "11px 26px", borderRadius: "var(--r-md)",
          background: "var(--accent)", color: "#fff",
          fontWeight: 600, fontSize: "14px",
          fontFamily: "var(--font-body)",
        }}>
          Return to the surface
        </Link>
        <Link href="/browse" style={{
          padding: "11px 26px", borderRadius: "var(--r-md)",
          border: "1px solid var(--border-md)", color: "var(--text-1)",
          fontWeight: 600, fontSize: "14px",
          background: "var(--bg-elevated)",
          fontFamily: "var(--font-body)",
        }}>
          Browse the catalog
        </Link>
      </div>
    </div>
  );
}

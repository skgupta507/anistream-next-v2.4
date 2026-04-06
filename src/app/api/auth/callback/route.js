import { NextResponse } from "next/server";
import { ANILIST_TOKEN_URL, fetchAniListUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/?error=no_code", request.url));

  try {
    // Exchange code for access token
    // AniList requires application/x-www-form-urlencoded, NOT JSON
    const params = new URLSearchParams();
    params.append("grant_type",    "authorization_code");
    params.append("client_id",     process.env.ANILIST_CLIENT_ID || "");
    params.append("client_secret", process.env.ANILIST_CLIENT_SECRET || "");
    params.append("redirect_uri",  process.env.ANILIST_REDIRECT_URI || "http://localhost:3000/api/auth/callback");
    params.append("code",          code);

    const tokenRes = await fetch(ANILIST_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    // Store token in httpOnly cookie
    const user = await fetchAniListUser(tokenData.access_token);
    const response = NextResponse.redirect(new URL("/profile", request.url));
    response.cookies.set("al_token", tokenData.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in || 60 * 60 * 24 * 30, path: "/",
    });
    response.cookies.set("al_user", JSON.stringify({
      id: user?.id, name: user?.name, avatar: user?.avatar?.large,
    }), { maxAge: 60 * 60 * 24 * 30, path: "/" });

    return response;
  } catch (e) {
    console.error("[auth] callback error:", e.message);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authenticatePrivyRequest } from "@/lib/server/privy";
import { createServerSupabaseClient } from "@/lib/server/supabase";

const USERNAME = /^[a-z0-9_]{3,24}$/;

function isProfileInput(value: unknown): value is { username: string; bio: string; xProfileUrl?: string } {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return typeof input.username === "string"
    && USERNAME.test(input.username.toLowerCase())
    && typeof input.bio === "string"
    && input.bio.length <= 160
    && (input.xProfileUrl === undefined || (typeof input.xProfileUrl === "string" && input.xProfileUrl.length <= 160));
}

function validXProfileUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(url.hostname)) return false;
    return url.pathname.length > 1 ? url.toString() : false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const auth = await authenticatePrivyRequest(request);
  if (!auth) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Profile storage is not configured." }, { status: 503 });

  const { data, error } = await supabase.from("profiles").select("username, avatar_url, bio, x_profile_url, created_at, updated_at").eq("auth_subject", auth.userId).maybeSingle();
  if (error) return NextResponse.json({ error: "Profile lookup failed." }, { status: 502 });
  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const auth = await authenticatePrivyRequest(request);
  if (!auth) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const supabase = createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Profile storage is not configured." }, { status: 503 });

  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!isProfileInput(input)) return NextResponse.json({ error: "Choose a 3–24 character username and a bio of at most 160 characters." }, { status: 400 });
  const xProfileUrl = validXProfileUrl(input.xProfileUrl);
  if (xProfileUrl === false) return NextResponse.json({ error: "Use a valid HTTPS X profile URL." }, { status: 400 });

  const { data, error } = await supabase.from("profiles").upsert({
    auth_subject: auth.userId,
    username: input.username.toLowerCase(),
    bio: input.bio.trim(),
    x_profile_url: xProfileUrl,
    updated_at: new Date().toISOString(),
  }, { onConflict: "auth_subject" }).select("username, avatar_url, bio, x_profile_url, created_at, updated_at").single();

  if (error?.code === "23505") return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  if (error || !data) return NextResponse.json({ error: "Profile could not be saved." }, { status: 502 });
  return NextResponse.json({ profile: data });
}

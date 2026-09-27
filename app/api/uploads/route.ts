import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: NextRequest) {
  if (!process.env.PINATA_JWT) return NextResponse.json({ status: "integration_not_configured", error: "Artwork uploads are not configured." }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A file field is required." }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Only PNG, JPEG, and WebP artwork is accepted." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Artwork must be 5 MB or smaller." }, { status: 413 });
  return NextResponse.json({ status: "adapter_ready", message: "Pinata upload adapter is configured; provider upload wiring is intentionally gated until the production storage policy is approved." }, { status: 501 });
}

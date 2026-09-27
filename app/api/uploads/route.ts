import { NextRequest, NextResponse } from "next/server";
import { authenticatePrivyRequest } from "@/lib/server/privy";

const MAX_BYTES = 5 * 1024 * 1024;
const MIME_SIGNATURES: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/png": (bytes) => bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a,
  "image/jpeg": (bytes) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/webp": (bytes) => bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
};

export async function POST(request: NextRequest) {
  const user = await authenticatePrivyRequest(request);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const jwt = process.env.PINATA_JWT;
  if (!jwt) return NextResponse.json({ status: "integration_not_configured", error: "Artwork uploads are not configured." }, { status: 503 });

  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: "Expected a multipart image upload." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A file field is required." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Artwork must be between 1 byte and 5 MB." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const matchesSignature = MIME_SIGNATURES[file.type]?.(bytes) ?? false;
  if (!matchesSignature) return NextResponse.json({ error: "Upload a PNG, JPEG, or WebP image with matching file contents." }, { status: 415 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "stacksclub-image";
  const upload = new FormData();
  upload.append("network", "public");
  upload.append("file", new Blob([bytes], { type: file.type }), safeName);
  upload.append("name", safeName);
  upload.append("keyvalues", JSON.stringify({ owner: user.userId, purpose: "stacksclub-profile-or-stack-media" }));

  let response: Response;
  try {
    response = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: upload,
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Artwork upload is temporarily unavailable." }, { status: 502 });
  }

  let result: unknown;
  try { result = await response.json(); }
  catch { return NextResponse.json({ error: "Storage returned an unreadable response." }, { status: 502 }); }
  if (!response.ok || !result || typeof result !== "object") return NextResponse.json({ error: "Storage rejected the artwork upload." }, { status: 502 });
  const data = "data" in result && result.data && typeof result.data === "object" ? result.data as Record<string, unknown> : result as Record<string, unknown>;
  const cid = typeof data.cid === "string" ? data.cid : typeof data.IpfsHash === "string" ? data.IpfsHash : null;
  if (!cid || !/^bafy[a-zA-Z0-9]{20,}$/.test(cid)) return NextResponse.json({ error: "Storage did not return a valid content identifier." }, { status: 502 });

  const gateway = process.env.PINATA_GATEWAY_URL;
  const url = gateway ? `https://${gateway.replace(/^https?:\/\//, "").replace(/\/$/, "")}/ipfs/${cid}` : `ipfs://${cid}`;
  return NextResponse.json({ cid, url }, { status: 201 });
}

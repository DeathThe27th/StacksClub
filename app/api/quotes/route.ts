import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "executable_quotes_unavailable",
    quotes: {},
    message: "Underlying equity marks are not executable token quotes. Use the verified asset catalogue; trade routes remain disabled until the full wallet-signed flow is configured.",
  }, { status: 503 });
}

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "executable_quote_unavailable",
    error: "Underlying stock quotes are not executable BSC token trade quotes. Request an exact token-pair quote after the verified asset registry is available.",
  }, { status: 501 });
}

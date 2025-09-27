import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  // In a real system, this would fan out to responders and log location + transcript
  console.log("[v0] SOS payload received:", body)
  return new Response(null, { status: 204 })
}

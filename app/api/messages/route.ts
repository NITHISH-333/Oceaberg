import type { NextRequest } from "next/server"

// ephemeral in-memory chat
const STORE: { id: string; from: "USER" | "ADMIN"; text: string; at: string }[] = [
  {
    id: "m-1",
    from: "ADMIN",
    text: "Stay calm and proceed to the nearest safe shelter.",
    at: new Date().toISOString(),
  },
]

export async function GET() {
  return Response.json(STORE, { headers: { "cache-control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const { text } = JSON.parse(body || "{}")
  if (!text) return new Response("Missing text", { status: 400 })
  const msg = { id: `m-${Date.now()}`, from: "USER" as const, text, at: new Date().toISOString() }
  STORE.push(msg)
  // simulate admin reply
  setTimeout(() => {
    STORE.push({
      id: `m-${Date.now()}-a`,
      from: "ADMIN",
      text: "Acknowledged. Help is on the way.",
      at: new Date().toISOString(),
    })
  }, 2000)
  return new Response(null, { status: 204 })
}

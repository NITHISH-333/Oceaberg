import type { NextRequest } from "next/server"

// In-memory store per container
const REPORTS = [
  {
    id: "r-1",
    userId: "u-0",
    type: "tsunami",
    description: "Strong waves observed near the jetty.",
    district: "Kollam",
    state: "Kerala",
    observedAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    submittedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    media: [
      { type: "image", url: "/storm-surge-high-waves-near-jetty-kerala.jpg" },
      { type: "video", url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
    ] as { type: "image" | "video"; url: string }[],
    mediaFileIds: [],
    verified: true,
    source: "ADMIN",
  },
  {
    id: "r-2",
    userId: "u-1",
    type: "high_wave",
    description: "Boats swaying unusually, please advise.",
    district: "Kannur",
    state: "Kerala",
    observedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    media: [
      { type: "image", url: "/rough-sea-boats-swaying-kannur.jpg" },
      { type: "image", url: "/coastline-high-tide-warning-sign.jpg" },
    ] as { type: "image" | "video"; url: string }[],
    mediaFileIds: [],
    verified: false,
    source: "USER",
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let data = REPORTS.slice()
  const district = searchParams.get("district")
  const state = searchParams.get("state")
  const date = searchParams.get("date")
  const q = (searchParams.get("q") || "").toLowerCase()

  if (district) data = data.filter((r) => r.district === district)
  if (state) data = data.filter((r) => r.state === state)
  if (date) {
    const d0 = new Date(date)
    data = data.filter((r) => {
      const d = new Date(r.observedAt)
      return d.toDateString() === d0.toDateString()
    })
  }
  if (q) {
    data = data.filter((r) => {
      const hay = [r.type, r.description, r.district, r.state, r.source].join(" ").toLowerCase()
      return hay.includes(q)
    })
  }

  // sort: admin first then newest submitted
  data.sort((a, b) => {
    const aAdmin = a.source === "ADMIN"
    const bAdmin = b.source === "ADMIN"
    if (aAdmin && !bAdmin) return -1
    if (!aAdmin && bAdmin) return 1
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  })

  return Response.json(data, { headers: { "cache-control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const id = `r-${Date.now()}`
  const item = {
    id,
    userId: "user-demo",
    type: body.type || "unknown",
    description: body.description || "",
    district: body.district || "",
    state: body.state || "",
    observedAt: body.observedAt || new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    // new media array support
    media: Array.isArray(body.media) ? body.media.filter((m: any) => m?.url && m?.type) : [],
    // keep legacy IDs field for compatibility
    mediaFileIds: Array.isArray(body.mediaFileIds) ? body.mediaFileIds : [],
    verified: false,
    source: body.source || "USER",
    location: body.location || null,
  }
  REPORTS.unshift(item as any)
  return Response.json({ ok: true, id }, { status: 201 })
}

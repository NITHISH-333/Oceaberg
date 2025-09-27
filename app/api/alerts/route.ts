import type { NextRequest } from "next/server"

const sample = [
  {
    type: "Tsunami",
    district: "Chennai",
    state: "Tamil Nadu",
    color: "Red",
    message: "Severe tsunami alert issued for coastal regions.",
    source: "INCOIS",
    issueDate: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    latitude: 13.0827,
    longitude: 80.2707,
    details: { waveHeight: "3.2m" },
  },
  {
    type: "High Wave",
    district: "Kannur",
    state: "Kerala",
    color: "Orange",
    message: "High wave warning for fishermen.",
    source: "IMD",
    issueDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    latitude: 11.8745,
    longitude: 75.3704,
    details: { waveHeight: "1.8m" },
  },
  {
    type: "Swell Surge",
    district: "Mumbai",
    state: "Maharashtra",
    color: "Yellow",
    message: "Swell surge expected along the coast.",
    source: "INCOIS",
    issueDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    latitude: 19.076,
    longitude: 72.8777,
    details: { warningLevel: "low" },
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let data = sample.slice()
  const type = searchParams.get("type")
  const color = searchParams.get("color")
  const district = searchParams.get("district")
  const state = searchParams.get("state")
  const date = searchParams.get("date")

  if (type) data = data.filter((a) => a.type === type)
  if (color) data = data.filter((a) => a.color === color)
  if (district) data = data.filter((a) => a.district === district)
  if (state) data = data.filter((a) => a.state === state)
  if (date) {
    const d0 = new Date(date)
    data = data.filter((a) => {
      const d = new Date(a.issueDate)
      return d.toDateString() === d0.toDateString()
    })
  }
  return Response.json(data, { headers: { "cache-control": "no-store" } })
}

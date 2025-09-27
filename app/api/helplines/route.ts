const HELPLINES = [
  { id: "h-1", name: "Coast Guard", number: "1554", category: "Rescue" },
  { id: "h-2", name: "State Disaster Management", number: "1070", category: "Government" },
  { id: "h-3", name: "District Control Room", number: "1077", category: "Local" },
  { id: "h-4", name: "Medical Emergency", number: "108", category: "Health" },
]

export async function GET() {
  return Response.json(HELPLINES, { headers: { "cache-control": "no-store" } })
}

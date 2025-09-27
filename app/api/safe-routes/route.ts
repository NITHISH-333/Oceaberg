const routes = [
  {
    id: "s-1",
    name: "Beach to School (Shelter)",
    path: [
      { lat: 8.8932, lng: 76.6141 },
      { lat: 8.895, lng: 76.615 },
      { lat: 8.8975, lng: 76.6163 },
    ],
    safePlace: { lat: 8.8975, lng: 76.6163, label: "Govt School Shelter" },
  },
  {
    id: "s-2",
    name: "Jetty to Community Hall",
    path: [
      { lat: 11.8745, lng: 75.3704 },
      { lat: 11.8762, lng: 75.3721 },
      { lat: 11.878, lng: 75.3737 },
    ],
    safePlace: { lat: 11.878, lng: 75.3737, label: "Community Hall" },
  },
]

export async function GET() {
  return Response.json(routes, { headers: { "cache-control": "no-store" } })
}

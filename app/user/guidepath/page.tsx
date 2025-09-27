"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LeafletMap } from "@/components/maps/leaflet-map"
import { SOSPanel } from "@/components/guidepath/sos-panel"
import { MessagingPanel } from "@/components/guidepath/messaging-panel"
import { HelplineList } from "@/components/guidepath/helpline-list"
import { usePersistentSWR } from "@/components/hooks/use-persistent-swr"

type SafeRoute = {
  id: string
  name: string
  path: Array<{ lat: number; lng: number }>
  safePlace: { lat: number; lng: number; label: string }
}

export default function GuidepathPage() {
  const { data } = usePersistentSWR<SafeRoute[]>("/api/safe-routes", (url) => fetch(url).then((r) => r.json()), {
    localStorageKey: "oceanberg_safe_routes_cache",
  })
  const routes = data ?? []

  const polylines = useMemo(() => routes.map((r) => r.path), [routes])
  const markers = useMemo(
    () =>
      routes.map((r) => ({
        id: r.id,
        lat: r.safePlace.lat,
        lng: r.safePlace.lng,
        label: r.safePlace.label,
        color: "#16a34a",
        popup: r.name,
      })),
    [routes],
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Guidepath, SOS & Helplines</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Safe Routes</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <LeafletMap markers={markers} polylines={polylines} />
          </CardContent>
        </Card>

        <SOSPanel />

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Messaging with Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagingPanel />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Emergency Helplines</CardTitle>
          </CardHeader>
          <CardContent>
            <HelplineList />
          </CardContent>
        </Card>
      </section>
      <Separator className="my-6" />
    </main>
  )
}

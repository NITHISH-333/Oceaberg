"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertFilters } from "@/components/alerts/alert-filters"
import { AlertCard } from "@/components/alerts/alert-card"
import { LeafletMap } from "@/components/maps/leaflet-map"
import { cn } from "@/lib/utils"
import { usePersistentSWR } from "@/components/hooks/use-persistent-swr"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterIcon, SearchIcon } from "lucide-react"

const ALERTS_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_ALERTS_API) || "http://localhost:8080/api/alerts"

type Alert = {
  type: string
  district: string
  state: string
  color: "Yellow" | "Orange" | "Red"
  message: string
  source: string
  issueDate: string
  latitude: number
  longitude: number
  details?: Record<string, string>
}

type ReportSummary = {
  id: string
  type: string
  district: string
  state: string
  submittedAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EarlyWarningPage() {
  const [filters, setFilters] = useState<{
    type?: string
    color?: string
    district?: string
    state?: string
    date?: string
  }>({})
  const [q, setQ] = useState("")

  const { data, isLoading } = usePersistentSWR<Alert[]>(
    [ALERTS_BASE, filters],
    async ([base, f]) => {
      const hasAny = !!f?.type || !!f?.color || !!f?.district || !!f?.state || !!f?.date
      const u = new URL(hasAny ? `${base}/search` : `${base}`)
      if (hasAny) {
        if (f?.type && f.type !== "all") u.searchParams.set("type", f.type)
        if (f?.color && f.color !== "all") u.searchParams.set("color", f.color)
        if (f?.district && f.district !== "all") u.searchParams.set("district", f.district)
        if (f?.state && f.state !== "all") u.searchParams.set("state", f.state)
        if (f?.date) u.searchParams.set("issueDate", f.date) // Spring expects ISO date
      }
      return fetcher(u.toString())
    },
    {
      localStorageKey: "oceanberg_alerts_cache",
      revalidateOnFocus: true,
    },
  )

  const alerts = data ?? []

  const authoritativeAlerts = useMemo(
    () =>
      alerts.filter((a) => {
        const s = (a.source || "").toUpperCase()
        return s.includes("INCOIS") || s.includes("IMD")
      }),
    [alerts],
  )

  const highRiskCount = useMemo(
    () => authoritativeAlerts.filter((a) => a.color === "Red" || a.color === "Orange").length,
    [authoritativeAlerts],
  )

  const highRiskSorted = useMemo(() => {
    const rank = (c: Alert["color"]) => (c === "Red" ? 2 : c === "Orange" ? 1 : 0)
    return authoritativeAlerts
      .filter((a) => a.color === "Red" || a.color === "Orange")
      .sort((a, b) => {
        const r = rank(b.color) - rank(a.color)
        if (r !== 0) return r
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      })
  }, [authoritativeAlerts])
  const topHighRisk = highRiskSorted[0]

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!alerts.length) return
    if (!("Notification" in window)) return
    if (Notification.permission !== "granted") return
    const lastNotifiedAt = Number(localStorage.getItem("oceanberg_last_alert_ts") || "0")
    const newest = Math.max(...alerts.map((a) => new Date(a.issueDate).getTime()).filter((x) => !Number.isNaN(x)), 0)
    if (newest > lastNotifiedAt) {
      const newHighRisk = alerts.filter(
        (a) => (a.color === "Red" || a.color === "Orange") && new Date(a.issueDate).getTime() >= newest,
      )
      if (newHighRisk.length) {
        new Notification("New high-risk alert", {
          body: `${newHighRisk.length} new ${newHighRisk.length > 1 ? "alerts" : "alert"} detected`,
        })
      }
      localStorage.setItem("oceanberg_last_alert_ts", String(newest))
    }
  }, [alerts])

  const markers = useMemo(
    () =>
      authoritativeAlerts.map((a, idx) => ({
        id: `${a.type}-${idx}`,
        lat: a.latitude,
        lng: a.longitude,
        label: `${a.type} • ${a.color}`,
        color:
          a.color === "Red"
            ? "#dc2626"
            : a.color === "Orange"
              ? "#ea580c"
              : a.color === "Yellow"
                ? "#ca8a04"
                : "#2563eb",
        popup: `${a.message}\n${a.district}, ${a.state}\n${new Date(a.issueDate).toLocaleString()}`,
      })),
    [authoritativeAlerts],
  )

  const searchedAlerts = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return authoritativeAlerts
    return authoritativeAlerts.filter((a) =>
      [a.type, a.district, a.state, a.message, a.color]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    )
  }, [authoritativeAlerts, q])

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Early Warnings</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Live Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b bg-background/80 p-3" role="region" aria-label="Map search and filters">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search alerts by type, district, state, or message"
                    className="pl-8"
                    aria-label="Search alerts"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" aria-label="Open filters">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[2000] w-[320px] p-0" align="end" sideOffset={8}>
                    <AlertFilters
                      isLoading={isLoading}
                      value={filters}
                      onChange={(v) => setFilters((prev) => ({ ...prev, ...v }))}
                      types={["Tsunami", "High Wave", "Swell Surge"]}
                      colors={["Yellow", "Orange", "Red"]}
                      districts={["Kannur", "Kollam", "Chennai", "Mumbai"]}
                      states={["Kerala", "Tamil Nadu", "Maharashtra"]}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="relative z-0 h-[420px]">
              <LeafletMap markers={markers} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-secondary p-3">
              <div className="text-sm text-muted-foreground">Active alerts</div>
              <div className="text-2xl font-bold">{authoritativeAlerts.length}</div>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <div className="text-sm text-muted-foreground">High-risk (Red/Orange)</div>
              <div className={cn("text-2xl font-bold", highRiskCount > 0 && "text-(--color-destructive)")}>
                {highRiskCount}
              </div>
            </div>

            {topHighRisk ? (
              <div className="rounded-md border p-3">
                <div className="text-sm text-muted-foreground">Highest priority</div>
                <div className="mt-1 font-medium">
                  {topHighRisk.type} • {topHighRisk.color}
                </div>
                <div className="text-sm">
                  {topHighRisk.district}, {topHighRisk.state}
                </div>
                <div className="text-xs text-muted-foreground">
                  Issued: {new Date(topHighRisk.issueDate).toLocaleString()}
                </div>
                <div className="mt-1 text-xs">
                  Expected impact time: {topHighRisk?.details?.expectedTime || topHighRisk?.details?.eta || "Unknown"}
                </div>
                <div className="text-xs">
                  Expected impact place:{" "}
                  {topHighRisk?.details?.impactPlace || `${topHighRisk.district}, ${topHighRisk.state}`}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Separator className="my-6" />

      <section className="space-y-4">
        <div className="space-y-3">
          {searchedAlerts.map((a, i) => (
            <AlertCard key={i} alert={a} />
          ))}
          {!searchedAlerts.length && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No alerts found for selected filters or search.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}

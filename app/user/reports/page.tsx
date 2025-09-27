"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportCard } from "@/components/reports/report-card"
import { ReportForm } from "@/components/reports/report-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePersistentSWR } from "@/components/hooks/use-persistent-swr"

type MediaItem = { type: "image" | "video"; url: string }
type Report = {
  id: string
  userId?: string
  type: string
  description: string
  location?: { lat: number; lng: number }
  district: string
  state: string
  observedAt: string
  submittedAt: string
  media?: MediaItem[]
  mediaFileIds?: string[]
  verified?: boolean
  source: "USER" | "ADMIN" | "MOCK_REPORT"
}

export default function ReportsPage() {
  const [mode, setMode] = useState<"all" | "images" | "videos" | "admin">("all")
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<{ district?: string; state?: string; date?: string }>({})

  const { data, isLoading, mutate } = usePersistentSWR<Report[]>(
    ["/api/reports"],
    async ([url]) => fetch(url).then((r) => r.json()),
    { localStorageKey: "oceanberg_reports_cache" },
  )

  const districts = useMemo(() => Array.from(new Set((data ?? []).map((r) => r.district).filter(Boolean))), [data])
  const states = useMemo(() => Array.from(new Set((data ?? []).map((r) => r.state).filter(Boolean))), [data])

  const reports = useMemo(() => {
    const base = (data ?? []).slice()

    // media mode filter
    const byMode = base.filter((r) => {
      if (mode === "admin") return r.source === "ADMIN"
      const media: MediaItem[] =
        (r.media as MediaItem[] | undefined) ??
        (Array.isArray(r.mediaFileIds)
          ? r.mediaFileIds.map((id: string) => ({
              type: "image",
              url: `/placeholder.svg?height=480&width=960&query=${id}`,
            }))
          : [])
      if (mode === "images") return media.some((m) => m.type === "image")
      if (mode === "videos") return media.some((m) => m.type === "video")
      return true
    })

    // filters
    const byFilters = byMode.filter((r) => {
      if (filters.district && r.district !== filters.district) return false
      if (filters.state && r.state !== filters.state) return false
      if (filters.date) {
        const d0 = new Date(filters.date)
        const d = new Date(r.observedAt)
        if (d.toDateString() !== d0.toDateString()) return false
      }
      return true
    })

    // search
    const q = search.trim().toLowerCase()
    const bySearch = q
      ? byFilters.filter((r) => {
          const hay = [
            r.type,
            r.description,
            r.district,
            r.state,
            r.source,
            new Date(r.observedAt).toLocaleString(),
            new Date(r.submittedAt).toLocaleString(),
          ]
            .join(" ")
            .toLowerCase()
          return hay.includes(q)
        })
      : byFilters

    // admin first, then newest submitted
    bySearch.sort((a, b) => {
      const aAdmin = a.source === "ADMIN"
      const bAdmin = b.source === "ADMIN"
      if (aAdmin && !bAdmin) return -1
      if (!aAdmin && bAdmin) return 1
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    })
    return bySearch
  }, [data, mode, filters, search])

  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <header className="mb-4 space-y-3">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Community Reports</h1>

        <ReportFilters
          isLoading={isLoading}
          search={search}
          onSearch={setSearch}
          mode={mode}
          onModeChange={setMode}
          filters={filters}
          onFiltersChange={(v) => setFilters((prev) => ({ ...prev, ...v }))}
          districts={districts}
          states={states}
        />
      </header>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 space-y-3">
          {reports.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
          {!reports.length && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No reports yet. Be the first to post.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <ReportForm
            onSubmitted={async () => {
              await mutate()
              const tabs = document.querySelector('[role="tablist"] [data-state="active"]')
              ;(tabs as HTMLElement | null)?.click?.()
            }}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}

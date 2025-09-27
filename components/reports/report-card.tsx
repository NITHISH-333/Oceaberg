"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useState, useCallback } from "react"

type MediaItem = { type: "image" | "video"; url: string }

export function ReportCard({ report }: { report: any }) {
  const observed = new Date(report.observedAt)
  const submitted = new Date(report.submittedAt)

  // Backward compatibility: if no media array, map mediaFileIds to placeholder images
  const media: MediaItem[] =
    (report.media as MediaItem[] | undefined) ??
    (Array.isArray(report.mediaFileIds)
      ? report.mediaFileIds.map((id: string) => ({
          type: "image",
          url: `/placeholder.svg?height=480&width=960&query=report media ${id}`,
        }))
      : [])

  const [mediaIndex, setMediaIndex] = useState(0)
  const active = media[mediaIndex]
  const hasMultiple = media.length > 1
  const goPrev = useCallback(() => {
    setMediaIndex((i) => (i - 1 + media.length) % media.length)
  }, [media.length])
  const goNext = useCallback(() => {
    setMediaIndex((i) => (i + 1) % media.length)
  }, [media.length])

  const who = report.source === "ADMIN" ? "Official" : "User"
  const verified = !!report.verified

  return (
    <Card role="article" aria-label={`${report.type} report`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-pretty text-base">
          {report.type} {verified ? "• Verified" : ""} {report.source === "ADMIN" ? "• Official" : ""}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {active ? (
          <div
            className="relative w-full overflow-hidden rounded-md border"
            role="region"
            aria-roledescription="carousel"
            aria-label="Report media carousel"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") goPrev()
              if (e.key === "ArrowRight") goNext()
            }}
          >
            {active.type === "video" ? (
              <video
                className="h-auto w-full"
                controls
                playsInline
                preload="metadata"
                aria-label="Report video"
                src={active.url}
              />
            ) : (
              <Image
                src={active.url || "/placeholder.svg"}
                alt="Report image"
                width={1200}
                height={900}
                className="h-auto w-full object-cover"
                priority
              />
            )}

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous media"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-2 py-2 text-foreground shadow backdrop-blur-sm hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {"‹"}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next media"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-2 py-2 text-foreground shadow backdrop-blur-sm hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {"›"}
                </button>
                <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-background/70 px-2 py-1 text-xs text-foreground shadow">
                  {mediaIndex + 1} / {media.length}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Meta row under media */}
        <div className="text-sm text-muted-foreground">
          <div>
            {report.district && report.state
              ? `${report.district}, ${report.state}`
              : report.state || report.district || "Location"}
          </div>
          <div>
            by {who} • Observed {observed.toLocaleString()} • Submitted {submitted.toLocaleString()}
          </div>
          {report?.location?.lat != null && report?.location?.lng != null ? (
            <div className="text-xs">{`Lat ${Number(report.location.lat).toFixed(4)}, Lng ${Number(
              report.location.lng,
            ).toFixed(4)}`}</div>
          ) : null}
        </div>

        {/* Description */}
        {report.description ? <p className="text-sm leading-relaxed text-foreground">{report.description}</p> : null}
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useRef } from "react"

type Marker = {
  id: string
  lat: number
  lng: number
  label?: string
  color?: string
  popup?: string
}

declare global {
  interface Window {
    L: any
  }
}

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("window not available"))
    if (window.L) return resolve(window.L)

    // Add Leaflet CSS via CDN
    const existingCss = document.querySelector('link[data-leaflet="css"]') as HTMLLinkElement | null
    if (!existingCss) {
      const css = document.createElement("link")
      css.setAttribute("rel", "stylesheet")
      css.setAttribute("href", "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css")
      css.setAttribute("integrity", "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=")
      css.setAttribute("crossorigin", "")
      css.setAttribute("data-leaflet", "css")
      document.head.appendChild(css)
    }

    // Add Leaflet JS via CDN
    const existingScript = document.querySelector('script[data-leaflet="js"]') as HTMLScriptElement | null
    if (existingScript && window.L) return resolve(window.L)
    const script = existingScript || document.createElement("script")
    if (!existingScript) {
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
      script.crossOrigin = ""
      script.async = true
      script.setAttribute("data-leaflet", "js")
      document.body.appendChild(script)
    }
    script.addEventListener("load", () => {
      if (window.L) resolve(window.L)
      else reject(new Error("Leaflet did not load"))
    })
    script.addEventListener("error", () => reject(new Error("Failed to load Leaflet script")))
  })
}

export function LeafletMap({
  markers = [],
  polylines = [],
  onPickLocation,
}: {
  markers?: Marker[]
  polylines?: Array<Array<{ lat: number; lng: number }>>
  onPickLocation?: (pt: { lat: number; lng: number }) => void
}) {
  const start = useMemo(() => ({ lat: 12.9716, lng: 77.5946 }), [])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const overlaysRef = useRef<any>(null)
  const clickHandlerRef = useRef<any>(null)

  // Initialize map
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const L = await loadLeaflet()
        if (cancelled || !containerRef.current) return

        const map = L.map(containerRef.current, {
          center: [start.lat, start.lng],
          zoom: 6,
          scrollWheelZoom: true,
        })
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          crossOrigin: "anonymous",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        }).addTo(map)

        mapRef.current = map

        // Initial overlays render
        const points: [number, number][] = [
          ...markers.map((m) => [m.lat, m.lng]),
          ...(polylines ?? []).flat().map((p) => [p.lat, p.lng]),
        ] as [number, number][]
        const group = L.layerGroup()
        markers.forEach((m) => {
          const marker = L.circleMarker([m.lat, m.lng], {
            color: m.color || "#2563eb",
            fillColor: m.color || "#2563eb",
            radius: 8,
          })
          const popupHtml = `
            <div class="text-sm">
              ${m.label ? `<div class="font-medium">${m.label}</div>` : ""}
              ${m.popup ? `<div class="whitespace-pre-wrap">${m.popup}</div>` : ""}
            </div>
          `
          if (m.popup || m.label) marker.bindPopup(popupHtml)
          marker.addTo(group)
        })
        ;(polylines || []).forEach((line) => {
          L.polyline(
            line.map((p) => [p.lat, p.lng]),
            { color: "#16a34a" },
          ).addTo(group)
        })
        group.addTo(map)
        overlaysRef.current = group

        if (points.length) {
          const bounds = L.latLngBounds(points)
          map.fitBounds(bounds.pad(0.2))
        }

        // Click handler for location picking
        if (onPickLocation) {
          const handler = (e: any) => onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
          clickHandlerRef.current = handler
          map.on("click", handler)
        }
      } catch (err) {
        console.error("[v0] Leaflet load/init error:", err)
      }
    })()

    return () => {
      cancelled = true
      const map = mapRef.current
      if (map) {
        if (clickHandlerRef.current) map.off("click", clickHandlerRef.current)
        map.remove()
      }
      mapRef.current = null
      overlaysRef.current = null
      clickHandlerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update overlays when markers or polylines change
  useEffect(() => {
    ;(async () => {
      const map = mapRef.current
      if (!map) return
      const L = window.L
      if (!L) return

      if (overlaysRef.current) {
        overlaysRef.current.remove()
        overlaysRef.current = null
      }

      const group = L.layerGroup()
      markers.forEach((m) => {
        const marker = L.circleMarker([m.lat, m.lng], {
          color: m.color || "#2563eb",
          fillColor: m.color || "#2563eb",
          radius: 8,
        })
        const popupHtml = `
          <div class="text-sm">
            ${m.label ? `<div class="font-medium">${m.label}</div>` : ""}
            ${m.popup ? `<div class="whitespace-pre-wrap">${m.popup}</div>` : ""}
          </div>
        `
        if (m.popup || m.label) marker.bindPopup(popupHtml)
        marker.addTo(group)
      })
      ;(polylines || []).forEach((line) => {
        L.polyline(
          line.map((p) => [p.lat, p.lng]),
          { color: "#16a34a" },
        ).addTo(group)
      })
      group.addTo(map)
      overlaysRef.current = group

      const points: [number, number][] = [
        ...markers.map((m) => [m.lat, m.lng]),
        ...(polylines ?? []).flat().map((p) => [p.lat, p.lng]),
      ] as [number, number][]
      if (points.length) {
        const bounds = L.latLngBounds(points)
        map.fitBounds(bounds.pad(0.2))
      } else {
        map.setView([start.lat, start.lng], 6)
      }
    })()
  }, [markers, polylines, start])

  // React to onPickLocation changes (attach/detach listener)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (clickHandlerRef.current) {
      map.off("click", clickHandlerRef.current)
      clickHandlerRef.current = null
    }
    if (onPickLocation) {
      const handler = (e: any) => onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
      clickHandlerRef.current = handler
      map.on("click", handler)
    }
  }, [onPickLocation])

  return <div ref={containerRef} className="h-full w-full rounded-md" role="region" aria-label="Interactive map" />
}

"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer as any), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer as any), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker as any), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline as any), { ssr: false })
import "leaflet/dist/leaflet.css"

type Props = {
  origin: { lat: number; lon: number } | null
  dest: { lat: number; lon: number } | null
  label?: string
}

export default function RouteMap({ origin, dest }: Props) {
  const center = origin ?? dest ?? { lat: 12.9716, lon: 77.5946 }

  useEffect(() => {
    function onFocus(e: any) {
      // optionally: pan the map via leaflet ref; simplified as no ref here
      // We rely on parent to re-render with new origin coords
      // console.log('[v0] sos:focus', e.detail)
    }
    window.addEventListener("sos:focus", onFocus)
    return () => window.removeEventListener("sos:focus", onFocus)
  }, [])

  const path =
    origin && dest
      ? [
          [origin.lat, origin.lon],
          [dest.lat, dest.lon],
        ]
      : []

  return (
    <MapContainer center={[center.lat, center.lon]} zoom={8} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {origin ? <Marker position={[origin.lat, origin.lon]} /> : null}
      {dest ? <Marker position={[dest.lat, dest.lon]} /> : null}
      {path.length ? <Polyline positions={path as any} color="#ef4444" /> : null}
    </MapContainer>
  )
}

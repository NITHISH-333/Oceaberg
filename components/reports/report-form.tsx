"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LeafletMap } from "@/components/maps/leaflet-map"
import { useToast } from "@/hooks/use-toast"

type MediaItem = { type: "image" | "video"; url: string }

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function reverseGeocode(lat: number, lon: number): Promise<{ district?: string; state?: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
    const res = await fetch(url, { headers: { Accept: "application/json" } })
    const data = await res.json()
    const addr = data?.address || {}
    return {
      district: addr.district || addr.county || addr.city_district || addr.city || undefined,
      state: addr.state || undefined,
    }
  } catch {
    return {}
  }
}

export function ReportForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { toast } = useToast()
  const [type, setType] = useState("tsunami")
  const [description, setDescription] = useState("")
  const [district, setDistrict] = useState("")
  const [state, setState] = useState("")
  const [observedAt, setObservedAt] = useState<string>("")
  const [media, setMedia] = useState<File[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)

  async function useMyLocation() {
    if (!("geolocation" in navigator)) {
      toast({
        title: "Location unavailable",
        description: "Geolocation not supported in this browser.",
        variant: "destructive",
      })
      return
    }
    setLocating(true)
    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 15000 },
        )
      })
      const lat = coords.latitude
      const lng = coords.longitude
      setLocation({ lat, lng })
      const rg = await reverseGeocode(lat, lng)
      if (rg.district) setDistrict(rg.district)
      if (rg.state) setState(rg.state)
      toast({ title: "Location set", description: `${lat.toFixed(4)}, ${lng.toFixed(4)}` })
    } catch (e: any) {
      toast({
        title: "Could not fetch location",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLocating(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    try {
      const mediaObjs: MediaItem[] = await Promise.all(
        media.map(async (f) => {
          const url = await fileToDataURL(f)
          const kind = f.type.startsWith("video") ? "video" : "image"
          return { type: kind as MediaItem["type"], url }
        }),
      )

      const res = await fetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          type,
          description,
          district,
          state,
          observedAt,
          location,
          mediaFileIds: media.map((f, idx) => `${Date.now()}-${idx}-${f.name}`),
          media: mediaObjs,
          source: "USER",
        }),
      })
      if (!res.ok) throw new Error("Failed to submit")
      toast({ title: "Report submitted", description: "Thank you for contributing." })
      setType("tsunami")
      setDescription("")
      setDistrict("")
      setState("")
      setObservedAt("")
      setMedia([])
      setLocation(null)
      onSubmitted?.()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Create Report</CardTitle>
        <Button variant="secondary" onClick={useMyLocation} disabled={locating}>
          {locating ? "Locating…" : "Use my location"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tsunami">Tsunami</SelectItem>
                <SelectItem value="high_wave">High Wave</SelectItem>
                <SelectItem value="swell_surge">Swell Surge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observed At</Label>
            <Input type="datetime-local" value={observedAt} onChange={(e) => setObservedAt(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g., Kannur" />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g., Kerala" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              className="min-h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Pick Location</Label>
            <div className="h-[300px] rounded-md border">
              <LeafletMap
                markers={location ? [{ id: "picked", lat: location.lat, lng: location.lng, label: "Selected" }] : []}
                onPickLocation={(pt) => setLocation(pt)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click on the map to set the exact location.{" "}
              {location && `Selected: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Media Upload</Label>
            <Input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setMedia(Array.from(e.target.files || []))}
            />
            {media.length ? (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {media.map((f, i) => {
                  const objectUrl = URL.createObjectURL(f)
                  const isVideo = f.type.startsWith("video")
                  return (
                    <div key={`${f.name}-${i}`} className="relative h-24 w-full overflow-hidden rounded-md border">
                      {isVideo ? (
                        <video className="h-full w-full object-cover" muted playsInline src={objectUrl} />
                      ) : (
                        <img
                          className="h-full w-full object-cover"
                          alt={f.name}
                          src={objectUrl || "/placeholder.svg"}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">Images and videos will display in your post.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

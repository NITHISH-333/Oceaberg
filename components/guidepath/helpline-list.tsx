"use client"

import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

type Helpline = {
  id: string
  name: string
  number: string
  category: string
}

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export function HelplineList() {
  const { data } = useSWR<Helpline[]>("/api/helplines", fetcher, { revalidateOnFocus: false })
  const [q, setQ] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const f = JSON.parse(localStorage.getItem("oceanberg_helpline_favs") || "[]")
    setFavorites(f)
  }, [])
  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem("oceanberg_helpline_favs", JSON.stringify(next))
      return next
    })
  }

  const list = useMemo(() => {
    const src = data ?? []
    return src
      .filter(
        (h) => h.name.toLowerCase().includes(q.toLowerCase()) || h.category.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) => {
        const aFav = favorites.includes(a.id)
        const bFav = favorites.includes(b.id)
        if (aFav && !bFav) return -1
        if (!aFav && bFav) return 1
        return a.name.localeCompare(b.name)
      })
  }, [data, q, favorites])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search helplines…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search helplines"
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {list.map((h) => (
          <Card key={h.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{h.name}</div>
              <div className="text-sm text-muted-foreground">{h.category}</div>
            </div>
            <div className="flex items-center gap-2">
              <a className="underline" href={`tel:${h.number}`} aria-label={`Call ${h.name}`}>
                {h.number}
              </a>
              <Button
                variant={favorites.includes(h.id) ? "default" : "secondary"}
                size="icon"
                aria-pressed={favorites.includes(h.id)}
                aria-label={favorites.includes(h.id) ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFav(h.id)}
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

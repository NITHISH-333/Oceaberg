"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon, VideoIcon, ShieldCheck, ListIcon, FilterIcon } from "lucide-react"

type Mode = "all" | "images" | "videos" | "admin"
type Filters = { district?: string; state?: string; date?: string }

export function ReportFilters(props: {
  isLoading?: boolean
  search: string
  onSearch: (v: string) => void
  mode: Mode
  onModeChange: (mode: Mode) => void
  filters: Filters
  onFiltersChange: (v: Partial<Filters>) => void
  districts?: string[]
  states?: string[]
}) {
  const {
    isLoading,
    search,
    onSearch,
    mode,
    onModeChange,
    filters,
    onFiltersChange,
    districts = [],
    states = [],
  } = props

  const [open, setOpen] = useState(false)

  return (
    <div className="flex w-full items-center gap-2">
      {/* Search bar */}
      <div className="flex-1">
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search reports (type, description, location)…"
          aria-label="Search reports"
        />
      </div>

      {/* Media mode icons */}
      <div role="toolbar" aria-label="Media type filter" className="hidden items-center gap-1 sm:flex">
        <Button
          size="icon"
          variant={mode === "all" ? "default" : "secondary"}
          aria-pressed={mode === "all"}
          aria-label="All posts"
          disabled={isLoading}
          onClick={() => onModeChange("all")}
        >
          <ListIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={mode === "images" ? "default" : "secondary"}
          aria-pressed={mode === "images"}
          aria-label="Images only"
          disabled={isLoading}
          onClick={() => onModeChange("images")}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={mode === "videos" ? "default" : "secondary"}
          aria-pressed={mode === "videos"}
          aria-label="Videos only"
          disabled={isLoading}
          onClick={() => onModeChange("videos")}
        >
          <VideoIcon className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant={mode === "admin" ? "default" : "secondary"}
          aria-pressed={mode === "admin"}
          aria-label="Admin posts"
          disabled={isLoading}
          onClick={() => onModeChange("admin")}
        >
          <ShieldCheck className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="icon" aria-label="Open filters" disabled={isLoading}>
            <FilterIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-4">
          <div className="space-y-2">
            <Label>District</Label>
            <Select
              value={filters.district || "all"}
              onValueChange={(val) => onFiltersChange({ district: val === "all" ? undefined : val })}
            >
              <SelectTrigger aria-label="Filter by district">
                <SelectValue placeholder="All districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>State</Label>
            <Select
              value={filters.state || "all"}
              onValueChange={(val) => onFiltersChange({ state: val === "all" ? undefined : val })}
            >
              <SelectTrigger aria-label="Filter by state">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <input
              type="date"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={filters.date || ""}
              onChange={(e) => onFiltersChange({ date: e.target.value || undefined })}
              aria-label="Filter by date"
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => onFiltersChange({ district: undefined, state: undefined, date: undefined })}
            >
              Clear
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

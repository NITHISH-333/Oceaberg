"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AlertFilters(props: {
  isLoading?: boolean
  value: { type?: string; color?: string; district?: string; state?: string; date?: string }
  onChange: (v: Partial<{ type: string; color: string; district: string; state: string; date: string }>) => void
  types: string[]
  colors: string[]
  districts: string[]
  states: string[]
}) {
  const dateId = useId()
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={props.value.type || "all"} onValueChange={(v) => props.onChange({ type: v || undefined })}>
            <SelectTrigger aria-label="Filter by type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {props.types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <Select value={props.value.color || "all"} onValueChange={(v) => props.onChange({ color: v || undefined })}>
            <SelectTrigger aria-label="Filter by color">
              <SelectValue placeholder="All colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {props.colors.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>District</Label>
          <Select
            value={props.value.district || "all"}
            onValueChange={(v) => props.onChange({ district: v || undefined })}
          >
            <SelectTrigger aria-label="Filter by district">
              <SelectValue placeholder="All districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {props.districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>State</Label>
          <Select value={props.value.state || "all"} onValueChange={(v) => props.onChange({ state: v || undefined })}>
            <SelectTrigger aria-label="Filter by state">
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {props.states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={dateId}>Date</Label>
          <Input
            id={dateId}
            type="date"
            value={props.value.date || ""}
            onChange={(e) => props.onChange({ date: e.target.value || undefined })}
          />
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            className="w-full"
            disabled={props.isLoading}
            onClick={() =>
              props.onChange({ type: "all", color: "all", district: "all", state: "all", date: "" } as any)
            }
          >
            Clear filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

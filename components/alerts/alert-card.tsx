"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AlertCard({ alert }: { alert: any }) {
  const issued = new Date(alert.issueDate)
  return (
    <Card role="article" aria-label={`${alert.type} alert`}>
      <CardHeader>
        <CardTitle className="text-pretty text-base">
          {alert.type} • <span className="font-normal">{alert.color}</span>
        </CardTitle>
        <CardDescription className="text-sm">
          {alert.district}, {alert.state} • {issued.toLocaleString()} • Source: {alert.source}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{alert.message}</p>
      </CardContent>
    </Card>
  )
}

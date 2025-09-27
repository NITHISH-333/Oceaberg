"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PhoneCall } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VoiceSOSRecorder } from "./voice-sos-recorder"

export function SOSPanel() {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  async function sendSOS(payload?: { transcript?: string }) {
    setSending(true)
    try {
      await fetch("/api/sos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "SOS", ...payload }),
      })
      toast({ title: "SOS sent", description: "Authorities have been notified." })
    } catch {
      toast({ title: "Failed to send SOS", variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <Button className="h-12" onClick={() => sendSOS()} disabled={sending}>
        <PhoneCall className="mr-2 h-4 w-4" />
        {sending ? "Sending..." : "Send SOS"}
      </Button>
      <VoiceSOSRecorder onTranscribed={(t) => sendSOS({ transcript: t })} />
    </Card>
  )
}

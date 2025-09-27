"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function VoiceSOSRecorder({ onTranscribed }: { onTranscribed: (text: string) => void }) {
  const { toast } = useToast()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState<string>("")

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      mediaRecorderRef.current = rec
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
          try {
            // This is a noop here because Web Speech API works live, not from blob; we fallback to prompt UX
            // To keep demo simple, just notify user to type or use live recorder below.
          } catch {}
        }
        toast({
          title: "Voice recorded",
          description: "Transcription is not processed on-device in this demo.",
        })
      }
      rec.start()
      setRecording(true)
    } catch (e: any) {
      toast({ title: "Microphone error", description: e.message, variant: "destructive" })
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    setRecording(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {!recording ? (
          <Button variant="secondary" onClick={start}>
            <Mic className="mr-2 h-4 w-4" />
            Record Voice SOS
          </Button>
        ) : (
          <Button variant="destructive" onClick={stop}>
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm">Optional transcript</label>
        <textarea
          className="w-full rounded-md border bg-background p-2 text-sm"
          placeholder="Type a brief description if voice transcription is unavailable…"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => onTranscribed(transcript)} disabled={!transcript.trim()}>
            Send Transcript as SOS
          </Button>
        </div>
      </div>
    </div>
  )
}

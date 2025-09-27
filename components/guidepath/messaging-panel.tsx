"use client"

import useSWR from "swr"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Message = {
  id: string
  from: "USER" | "ADMIN"
  text: string
  at: string
}

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export function MessagingPanel() {
  const { data, mutate } = useSWR<Message[]>("/api/messages", fetcher, { refreshInterval: 6000 })
  const [text, setText] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  const messages = data ?? []

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    if ("Notification" in window && Notification.permission === "granted") {
      const last = messages[messages.length - 1]
      if (last?.from === "ADMIN") {
        new Notification("New message from Admin", { body: last.text })
      }
    }
  }, [messages])

  async function send() {
    if (!text.trim()) return
    await fetch("/api/messages", { method: "POST", body: JSON.stringify({ text }) })
    setText("")
    await mutate()
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr,280px]">
      <Card className="flex h-72 flex-col">
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
          {messages.map((m) => (
            <div key={m.id} className={m.from === "USER" ? "text-right" : "text-left"} aria-live="polite">
              <div
                className={
                  m.from === "USER"
                    ? "ml-auto inline-block max-w-[75%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "inline-block max-w-[75%] rounded-md bg-secondary px-3 py-2 text-sm"
                }
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <div className="mt-1 text-[10px] opacity-70">{new Date(m.at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 p-3">
          <Input
            placeholder="Type your message to Admin…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            aria-label="Message input"
          />
          <Button onClick={send}>Send</Button>
        </div>
      </Card>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Stay connected with Admin for guidance and updates during emergencies.
        </p>
      </div>
    </div>
  )
}

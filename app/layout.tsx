import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Link from "next/link"
import SiteNav from "../components/site-nav"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Suspense fallback={<div>Loading...</div>}>
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="font-semibold text-foreground">
                Oceanberg
                <span className="sr-only">{" - Home"}</span>
              </Link>
              <SiteNav />
            </div>
          </header>

          <main id="main" className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
        </Suspense>

        <Analytics />
      </body>
    </html>
  )
}

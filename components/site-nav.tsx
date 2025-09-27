"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavLink = {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: "/user/early-warning", label: "Early Warning" },
  { href: "/user/reports", label: "Reports" },
  { href: "/user/guidepath", label: "Guidepath" },
]

export default function SiteNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="flex items-center gap-1 overflow-x-auto">
      {links.map((l) => {
        const isActive = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            data-active={isActive}
            className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            aria-current={isActive ? "page" : undefined}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}

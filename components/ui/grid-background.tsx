"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  children: ReactNode
  className?: string
}

export function GridBackground({ children, className }: GridBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="grid-pattern absolute inset-0 opacity-50" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

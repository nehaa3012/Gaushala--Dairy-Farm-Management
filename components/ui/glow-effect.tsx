"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowEffectProps {
  className?: string
  color?: "purple" | "blue" | "green" | "pink"
  size?: "sm" | "md" | "lg"
}

export function GlowEffect({
  className,
  color = "purple",
  size = "md",
}: GlowEffectProps) {
  const colors = {
    purple: "rgba(139, 92, 246, 0.4)",
    blue: "rgba(59, 130, 246, 0.4)",
    green: "rgba(34, 197, 94, 0.4)",
    pink: "rgba(236, 72, 153, 0.4)",
  }

  const sizes = {
    sm: "h-32 w-32",
    md: "h-64 w-64",
    lg: "h-96 w-96",
  }

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        sizes[size],
        className
      )}
      style={{
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

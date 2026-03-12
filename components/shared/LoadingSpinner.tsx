"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  )
}

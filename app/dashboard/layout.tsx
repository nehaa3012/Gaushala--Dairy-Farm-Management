"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { MobileNav } from "@/components/layout/MobileNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/sync-user", { method: "POST" }).catch(console.error)
    }
  }, [isSignedIn])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="lg:pl-72">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  X,
  Milk,
  LayoutDashboard,
  Users,
  FileText,
  Beef,
  Wheat,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Deliveries", href: "/dashboard/deliveries", icon: Milk },
  { name: "Billing", href: "/dashboard/billing", icon: FileText },
  { name: "Cows", href: "/dashboard/cows", icon: Beef },
  { name: "Feed", href: "/dashboard/feed", icon: Wheat },
  { name: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card lg:hidden">
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Milk className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DudhWala</h1>
              <p className="text-xs text-muted-foreground">Farm Management</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col px-6 py-4">
          <ul role="list" className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}

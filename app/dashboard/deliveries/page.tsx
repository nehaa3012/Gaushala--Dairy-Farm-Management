"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import { Milk, Calendar, Plus } from "lucide-react"
import { GridBackground } from "@/components/ui/grid-background"
import { GlowEffect } from "@/components/ui/glow-effect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  pricePerLiter: number
  isActive?: boolean
}

interface DeliveryEntry {
  customerId: string
  morningLiters: string
  eveningLiters: string
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DeliveriesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deliveries, setDeliveries] = useState<Record<string, DeliveryEntry>>(
    {}
  )

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers")
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.filter((c: Customer) => c.isActive))
        // Initialize delivery entries
        const initialDeliveries: Record<string, DeliveryEntry> = {}
        data.forEach((customer: Customer) => {
          initialDeliveries[customer.id] = {
            customerId: customer.id,
            morningLiters: "",
            eveningLiters: "",
          }
        })
        setDeliveries(initialDeliveries)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  function updateDelivery(
    customerId: string,
    session: "morning" | "evening",
    value: string
  ) {
    setDeliveries((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [session === "morning" ? "morningLiters" : "eveningLiters"]: value,
      },
    }))
  }

  async function saveDelivery(
    customerId: string,
    session: "MORNING" | "EVENING"
  ) {
    const entry = deliveries[customerId]
    const liters =
      session === "MORNING" ? entry.morningLiters : entry.eveningLiters

    if (!liters || parseFloat(liters) === 0) return

    setSaving(true)
    try {
      const customer = customers.find((c) => c.id === customerId)
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          date: new Date(selectedDate).toISOString(),
          liters: parseFloat(liters),
          session,
          priceAtTime: customer?.pricePerLiter || 0,
        }),
      })

      if (res.ok) {
        toast.success(`${session.toLowerCase()} delivery saved!`)
        // Clear the input
        updateDelivery(
          customerId,
          session === "MORNING" ? "morning" : "evening",
          ""
        )
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to save delivery")
      }
    } catch (error) {
      toast.error("Failed to save delivery")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading deliveries..." />

  return (
    <GridBackground className="min-h-screen">
      <GlowEffect
        color="blue"
        size="lg"
        className="-top-20 right-10 opacity-30"
      />
      <GlowEffect
        color="purple"
        size="md"
        className="bottom-20 left-10 opacity-20"
      />
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 p-3 shadow-lg backdrop-blur-sm">
              <Milk className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Daily Deliveries
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Record milk deliveries for customers
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="max-w-xs flex-1">
            <Label htmlFor="date">Delivery Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </motion.div>

        {customers.length === 0 ? (
          <EmptyState
            icon={Milk}
            title="No active customers"
            description="Add customers to start recording deliveries"
            actionLabel="Add Customer"
            onAction={() => (window.location.href = "/dashboard/customers/new")}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-gradient border-purple-500/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-600/20 p-2 shadow backdrop-blur-sm">
                    <Milk className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-xl">Quick Entry</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer, idx) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 300,
                      }}
                      className="grid grid-cols-1 items-end gap-4 rounded-lg border border-purple-500/20 bg-gradient-to-br from-background via-background to-purple-500/5 p-4 shadow-md backdrop-blur-sm transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 md:grid-cols-12"
                    >
                      <div className="md:col-span-4">
                        <Label className="text-base font-semibold">
                          {customer.name}
                        </Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          ₹{Number(customer.pricePerLiter).toFixed(2)}/L
                        </p>
                      </div>
                      <div className="md:col-span-3">
                        <Label
                          htmlFor={`morning-${customer.id}`}
                          className="text-sm font-medium"
                        >
                          Morning (L)
                        </Label>
                        <Input
                          id={`morning-${customer.id}`}
                          type="number"
                          step="0.25"
                          min="0"
                          placeholder="0.00"
                          className="mt-1.5 border-purple-500/20 focus:border-purple-500/50"
                          value={deliveries[customer.id]?.morningLiters || ""}
                          onChange={(e) =>
                            updateDelivery(
                              customer.id,
                              "morning",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveDelivery(customer.id, "MORNING")
                            }
                          }}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label
                          htmlFor={`evening-${customer.id}`}
                          className="text-sm font-medium"
                        >
                          Evening (L)
                        </Label>
                        <Input
                          id={`evening-${customer.id}`}
                          type="number"
                          step="0.25"
                          min="0"
                          placeholder="0.00"
                          className="mt-1.5 border-purple-500/20 focus:border-purple-500/50"
                          value={deliveries[customer.id]?.eveningLiters || ""}
                          onChange={(e) =>
                            updateDelivery(
                              customer.id,
                              "evening",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              saveDelivery(customer.id, "EVENING")
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2 md:col-span-2">
                        <Button
                          size="sm"
                          onClick={() => saveDelivery(customer.id, "MORNING")}
                          disabled={
                            saving || !deliveries[customer.id]?.morningLiters
                          }
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                          Save
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GridBackground>
  )
}

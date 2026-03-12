"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Milk, Calendar, Plus } from "lucide-react"
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Daily Deliveries
        </h1>
        <p className="text-muted-foreground">
          Record milk deliveries for customers
        </p>
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer, idx) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-1 items-end gap-4 rounded-lg border p-4 transition-colors hover:border-primary/50 md:grid-cols-12"
                  >
                    <div className="md:col-span-4">
                      <Label className="font-medium">{customer.name}</Label>
                      <p className="text-sm text-muted-foreground">
                        ₹{Number(customer.pricePerLiter).toFixed(2)}/L
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor={`morning-${customer.id}`}>
                        Morning (L)
                      </Label>
                      <Input
                        id={`morning-${customer.id}`}
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="0.00"
                        value={deliveries[customer.id]?.morningLiters || ""}
                        onChange={(e) =>
                          updateDelivery(customer.id, "morning", e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveDelivery(customer.id, "MORNING")
                          }
                        }}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label htmlFor={`evening-${customer.id}`}>
                        Evening (L)
                      </Label>
                      <Input
                        id={`evening-${customer.id}`}
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="0.00"
                        value={deliveries[customer.id]?.eveningLiters || ""}
                        onChange={(e) =>
                          updateDelivery(customer.id, "evening", e.target.value)
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
                        className="flex-1"
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
  )
}

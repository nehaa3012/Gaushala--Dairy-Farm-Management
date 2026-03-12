"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, User, Droplet, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const deliverySchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  liters: z.number().min(0.1, "Quantity must be at least 0.1 L"),
  session: z.enum(["MORNING", "EVENING"]),
  date: z.string().min(1, "Date is required"),
})

type DeliveryFormData = z.infer<typeof deliverySchema>

interface Customer {
  id: string
  name: string
  pricePerLiter: number
}

interface DeliveryFormProps {
  deliveryId?: string
  defaultValues?: Partial<DeliveryFormData>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function DeliveryForm({
  deliveryId,
  defaultValues,
  onSuccess,
  onCancel,
}: DeliveryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const isEditMode = !!deliveryId

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: defaultValues || {
      customerId: "",
      liters: 0,
      session: "MORNING",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const watchCustomerId = watch("customerId")
  const watchLiters = watch("liters")
  const watchSession = watch("session")

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers")
        if (!response.ok) throw new Error("Failed to fetch customers")
        const data = await response.json()
        setCustomers(data || [])
      } catch (error) {
        toast.error("Failed to load customers")
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  // Update selected customer - removed defaultQuantity logic as it doesn't exist
  useEffect(() => {
    if (watchCustomerId) {
      const customer = customers.find((c) => c.id === watchCustomerId)
      setSelectedCustomer(customer || null)
    }
  }, [watchCustomerId, customers])

  const onSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true)

    try {
      const url = isEditMode
        ? `/api/deliveries/${deliveryId}`
        : "/api/deliveries"
      const method = isEditMode ? "PATCH" : "POST"

      const customer = customers.find((c) => c.id === data.customerId)
      
      const payload = {
        customerId: data.customerId,
        liters: Number(data.liters),
        session: data.session,
        date: new Date(data.date).toISOString(),
        priceAtTime: customer?.pricePerLiter || 0,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save delivery")
      }

      toast.success(
        isEditMode
          ? "Delivery updated successfully!"
          : "Delivery added successfully!"
      )
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total amount
  const totalAmount =
    selectedCustomer && watchLiters
      ? (selectedCustomer.pricePerLiter * Number(watchLiters)).toFixed(2)
      : "0.00"

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Date Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Delivery Date *
        </Label>
        <Input
          id="date"
          type="date"
          {...register("date")}
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </motion.div>

      {/* Session Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="session" className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Session *
        </Label>
        <Select
          value={watchSession}
          onValueChange={(value) =>
            setValue("session", value as "MORNING" | "EVENING")
          }
        >
          <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MORNING">Morning</SelectItem>
            <SelectItem value="EVENING">Evening</SelectItem>
          </SelectContent>
        </Select>
        {errors.session && (
          <p className="text-sm text-destructive">{errors.session.message}</p>
        )}
      </motion.div>

      {/* Customer Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="customerId" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Customer *
        </Label>
        {loadingCustomers ? (
          <div className="flex h-10 items-center justify-center rounded-md border bg-muted/50">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Select
            value={watchCustomerId}
            onValueChange={(value) => setValue("customerId", value)}
            disabled={isEditMode}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.customerId && (
          <p className="text-sm text-destructive">
            {errors.customerId.message}
          </p>
        )}
      </motion.div>

      {/* Liters Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="liters" className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-muted-foreground" />
          Quantity (Liters) *
        </Label>
        <Input
          id="liters"
          type="number"
          step="0.5"
          {...register("liters", { valueAsNumber: true })}
          placeholder="Enter quantity"
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.liters && (
          <p className="text-sm text-destructive">{errors.liters.message}</p>
        )}
      </motion.div>

      {/* Total Amount Display */}
      {selectedCustomer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-2xl font-bold text-transparent">
                ₹{totalAmount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-lg font-semibold">
                ₹{selectedCustomer.pricePerLiter}/L
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-3 pt-4"
      >
        <Button
          type="submit"
          disabled={isSubmitting || loadingCustomers}
          className="group relative flex-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Delivery" : "Add Delivery"}
          </span>
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 transition-transform duration-700 group-hover:translate-x-[100%]" />
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 transition-colors hover:bg-muted"
          >
            Cancel
          </Button>
        )}
      </motion.div>
    </motion.form>
  )
}

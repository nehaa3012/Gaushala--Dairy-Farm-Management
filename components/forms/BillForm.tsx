"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, User, Calendar, DollarSign, FileText } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

const billSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  notes: z.string().optional(),
})

type BillFormData = z.infer<typeof billSchema>

interface Customer {
  id: string
  name: string
  phone?: string
}

interface BillFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export default function BillForm({ onSuccess, onCancel }: BillFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      customerId: "",
      month: currentMonth,
      year: currentYear,
      notes: "",
    },
  })

  const watchCustomerId = watch("customerId")
  const watchMonth = watch("month")
  const watchYear = watch("year")

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

  const onSubmit = async (data: BillFormData) => {
    setIsSubmitting(true)

    try {
      const payload = {
        customerId: data.customerId,
        month: Number(data.month),
        year: Number(data.year),
        notes: data.notes,
      }

      const response = await fetch("/api/bills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate bill")
      }

      toast.success("Bill generated successfully!")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCustomer = customers.find((c) => c.id === watchCustomerId)
  const selectedMonth = MONTHS.find((m) => m.value === watchMonth)

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Customer Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="customerId" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Select Customer *
        </Label>
        {loadingCustomers ? (
          <div className="flex h-10 items-center justify-center rounded-md border bg-muted/50">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Select
            value={watchCustomerId}
            onValueChange={(value) => setValue("customerId", value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.phone && ` - ${customer.phone}`}
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

      {/* Month and Year Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="month" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Month *
          </Label>
          <Select
            value={watchMonth?.toString()}
            onValueChange={(value) => setValue("month", parseInt(value))}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.month && (
            <p className="text-sm text-destructive">{errors.month.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="year" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Year *
          </Label>
          <Input
            id="year"
            type="number"
            {...register("year", { valueAsNumber: true })}
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          {errors.year && (
            <p className="text-sm text-destructive">{errors.year.message}</p>
          )}
        </motion.div>
      </div>

      {/* Bill Preview Card */}
      {selectedCustomer && selectedMonth && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">{selectedCustomer.name}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Billing Period</p>
              <p className="font-semibold">
                {selectedMonth.label} {watchYear}
              </p>
            </div>
            <div className="mt-2 rounded-md bg-muted/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                The bill will be automatically calculated based on deliveries
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notes Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Any additional notes for this bill"
          rows={3}
          className="resize-none transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
      </motion.div>

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
            Generate Bill
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

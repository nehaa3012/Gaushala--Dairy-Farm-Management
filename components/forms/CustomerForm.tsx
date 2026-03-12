"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, User, Phone, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().optional(),
  pricePerLiter: z.number().min(0, "Rate must be positive"),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customerId?: string
  defaultValues?: Partial<CustomerFormData>
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CustomerForm({
  customerId,
  defaultValues,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!customerId

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {
      name: "",
      phone: "",
      address: "",
      pricePerLiter: 60,
    },
  })

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true)

    try {
      const url = isEditMode ? `/api/customers/${customerId}` : "/api/customers"
      const method = isEditMode ? "PATCH" : "POST"

      const payload = {
        ...data,
        pricePerLiter: Number(data.pricePerLiter),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save customer")
      }

      toast.success(
        isEditMode
          ? "Customer updated successfully!"
          : "Customer added successfully!"
      )
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Name Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Customer Name *
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter customer name"
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </motion.div>

      {/* Phone Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Phone Number *
        </Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="Enter phone number"
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </motion.div>

      {/* Address Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Address
        </Label>
        <Textarea
          id="address"
          {...register("address")}
          placeholder="Enter customer address (optional)"
          rows={3}
          className="resize-none transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </motion.div>

      {/* Milk Rate */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="pricePerLiter" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Milk Rate (₹/L) *
        </Label>
        <Input
          id="pricePerLiter"
          type="number"
          step="0.01"
          {...register("pricePerLiter", { valueAsNumber: true })}
          placeholder="60.00"
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.pricePerLiter && (
          <p className="text-sm text-destructive">
            {errors.pricePerLiter.message}
          </p>
        )}
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
          disabled={isSubmitting}
          className="group relative flex-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Customer" : "Add Customer"}
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

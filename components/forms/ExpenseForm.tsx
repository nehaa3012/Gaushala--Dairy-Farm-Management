"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, Tag, DollarSign, Calendar, FileText } from "lucide-react"
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

const expenseSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  expenseId?: string
  defaultValues?: Partial<ExpenseFormData>
  onSuccess?: () => void
  onCancel?: () => void
}

const EXPENSE_CATEGORIES = [
  { value: "FEED", label: "Feed & Fodder" },
  { value: "MEDICINE", label: "Medicine & Veterinary" },
  { value: "LABOR", label: "Labor & Wages" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "MAINTENANCE", label: "Maintenance & Repairs" },
  { value: "TRANSPORT", label: "Transport & Logistics" },
  { value: "OTHER", label: "Other Expenses" },
]

export default function ExpenseForm({
  expenseId,
  defaultValues,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!expenseId

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues || {
      category: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  const watchCategory = watch("category")
  const watchAmount = watch("amount")

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)

    try {
      const url = isEditMode ? `/api/expenses/${expenseId}` : "/api/expenses"
      const method = isEditMode ? "PATCH" : "POST"

      // Convert date to ISO datetime string
      const dateTime = new Date(data.date)
      dateTime.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

      const payload = {
        category: data.category,
        amount: Number(data.amount),
        date: dateTime.toISOString(),
        notes: data.notes || undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save expense")
      }

      toast.success(
        isEditMode
          ? "Expense updated successfully!"
          : "Expense added successfully!"
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
      {/* Date Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Expense Date *
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

      {/* Category Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="category" className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Category *
        </Label>
        <Select
          value={watchCategory}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
            <SelectValue placeholder="Select expense category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </motion.div>

      {/* Amount Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="amount" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Amount (₹) *
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          placeholder="0.00"
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </motion.div>

      {/* Amount Display Card */}
      {Number(watchAmount) > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-red-500/20 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Expense</p>
            <p className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-2xl font-bold text-transparent">
              ₹{Number(watchAmount).toFixed(2)}
            </p>
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
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Any additional details about this expense"
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
          disabled={isSubmitting}
          className="group relative flex-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Expense" : "Add Expense"}
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

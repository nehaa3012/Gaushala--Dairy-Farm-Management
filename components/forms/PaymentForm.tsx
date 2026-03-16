"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, DollarSign, FileText, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const paymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  billId: string
  billDetails: {
    customerName: string
    month: string
    year: number
    totalAmount: number
    paidAmount: number
    outstandingAmount: number
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PaymentForm({
  billId,
  billDetails,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      notes: "",
    },
  })

  const watchAmount = watch("amount")

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(data.amount),
          notes: data.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to record payment")
      }

      toast.success("Payment recorded successfully!")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayFull = () => {
    setValue("amount", billDetails.outstandingAmount)
  }

  const remainingAfterPayment = Math.max(
    0,
    billDetails.outstandingAmount - (watchAmount || 0)
  )

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Bill Summary Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Customer
            </div>
            <p className="font-semibold">{billDetails.customerName}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Billing Period
            </div>
            <p className="font-semibold">
              {billDetails.month} {billDetails.year}
            </p>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">
                ₹{billDetails.totalAmount.toFixed(2)}
              </span>
            </div>
            {billDetails.paidAmount > 0 && (
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid</span>
                <span className="font-medium text-green-600">
                  ₹{billDetails.paidAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-muted-foreground">Outstanding</span>
              <span className="font-bold text-red-600">
                ₹{billDetails.outstandingAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Amount Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="amount" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          Payment Amount (₹) *
        </Label>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
            className="flex-1 transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePayFull}
            disabled={isSubmitting}
            className="whitespace-nowrap"
          >
            Pay Full
          </Button>
        </div>
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </motion.div>

      {/* Payment Preview */}
      {watchAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border bg-muted/50 p-4"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount</span>
              <span className="font-bold text-green-600">
                ₹{(watchAmount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Remaining After Payment
              </span>
              <span
                className={`font-bold ${
                  remainingAfterPayment === 0
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                ₹{remainingAfterPayment.toFixed(2)}
              </span>
            </div>
            {remainingAfterPayment === 0 && (
              <div className="mt-2 rounded-md bg-green-100 p-2 text-center dark:bg-green-900/20">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  This payment will mark the bill as PAID
                </p>
              </div>
            )}
            {remainingAfterPayment > 0 && watchAmount > 0 && (
              <div className="mt-2 rounded-md bg-orange-100 p-2 text-center dark:bg-orange-900/20">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-400">
                  This payment will mark the bill as PARTIAL
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Notes Field */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Add any notes about this payment (e.g., check number, transaction ID)"
          rows={3}
          className="resize-none transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 pt-4"
      >
        <Button
          type="submit"
          disabled={isSubmitting || !watchAmount || watchAmount <= 0}
          className="group relative flex-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Record Payment
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

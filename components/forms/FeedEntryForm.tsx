"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, Wheat, DollarSign, Calendar, Hash } from "lucide-react"
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

const feedSchema = z.object({
  cowId: z.string().min(1, "Please select a cow"),
  feedType: z.string().min(1, "Please select a feed type"),
  customType: z.string().optional(),
  quantityKg: z.number().min(0.1, "Quantity must be at least 0.1 kg"),
  costPerKg: z.number().min(0, "Cost must be positive"),
  notes: z.string().optional(),
  date: z.string().min(1, "Date is required"),
})

type FeedFormData = z.infer<typeof feedSchema>

interface Cow {
  id: string
  name: string
  tagNumber: string
}

interface FeedEntryFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function FeedEntryForm({
  onSuccess,
  onCancel,
}: FeedEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cows, setCows] = useState<Cow[]>([])
  const [loadingCows, setLoadingCows] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FeedFormData>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      cowId: "",
      feedType: "",
      customType: "",
      quantityKg: 0,
      costPerKg: 0,
      notes: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const watchCowId = watch("cowId")
  const watchFeedType = watch("feedType")
  const watchQuantity = watch("quantityKg")
  const watchCost = watch("costPerKg")

  // Fetch cows
  useEffect(() => {
    const fetchCows = async () => {
      try {
        const response = await fetch("/api/cows")
        if (!response.ok) throw new Error("Failed to fetch cows")
        const data = await response.json()
        setCows(data || [])
      } catch (error) {
        toast.error("Failed to load cows")
      } finally {
        setLoadingCows(false)
      }
    }

    fetchCows()
  }, [])

  const onSubmit = async (data: FeedFormData) => {
    setIsSubmitting(true)

    try {
      // Convert date to ISO datetime string
      const dateTime = new Date(data.date)
      dateTime.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

      const payload = {
        cowId: data.cowId,
        feedType: data.feedType,
        customType: data.feedType === "CUSTOM" ? data.customType : undefined,
        quantityKg: Number(data.quantityKg),
        costPerKg: Number(data.costPerKg),
        date: dateTime.toISOString(),
        notes: data.notes || undefined,
      }

      const response = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save feed entry")
      }

      toast.success("Feed entry added successfully!")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-calculate total cost
  const totalCost =
    watchQuantity && watchCost
      ? (Number(watchQuantity) * Number(watchCost)).toFixed(2)
      : "0.00"

  const FEED_TYPES = [
    { value: "GREEN_FODDER", label: "Green Fodder" },
    { value: "DRY_FODDER", label: "Dry Fodder" },
    { value: "CONCENTRATE", label: "Concentrate" },
    { value: "SILAGE", label: "Silage" },
    { value: "MINERAL_MIX", label: "Mineral Mix" },
    { value: "CUSTOM", label: "Custom" },
  ]

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
          Date *
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

      {/* Cow Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="cowId" className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          Select Cow *
        </Label>
        {loadingCows ? (
          <div className="flex h-10 items-center justify-center rounded-md border bg-muted/50">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : cows.length === 0 ? (
          <div className="flex h-10 items-center justify-center rounded-md border border-yellow-500/50 bg-yellow-500/10 text-sm text-yellow-700">
            No cows available. Please add cows first.
          </div>
        ) : (
          <Select
            value={watchCowId}
            onValueChange={(value) => setValue("cowId", value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
              <SelectValue placeholder="Select a cow" />
            </SelectTrigger>
            <SelectContent>
              {cows.map((cow) => (
                <SelectItem key={cow.id} value={cow.id}>
                  {cow.name} (Tag: {cow.tagNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.cowId && (
          <p className="text-sm text-destructive">{errors.cowId.message}</p>
        )}
      </motion.div>

      {/* Feed Type */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="feedType" className="flex items-center gap-2">
          <Wheat className="h-4 w-4 text-muted-foreground" />
          Feed Type *
        </Label>
        <Select
          value={watchFeedType}
          onValueChange={(value) => setValue("feedType", value)}
        >
          <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
            <SelectValue placeholder="Select feed type" />
          </SelectTrigger>
          <SelectContent>
            {FEED_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.feedType && (
          <p className="text-sm text-destructive">{errors.feedType.message}</p>
        )}
      </motion.div>

      {/* Custom Type - Only show if CUSTOM is selected */}
      {watchFeedType === "CUSTOM" && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-2"
        >
          <Label htmlFor="customType" className="flex items-center gap-2">
            <Wheat className="h-4 w-4 text-muted-foreground" />
            Custom Feed Type *
          </Label>
          <Input
            id="customType"
            {...register("customType")}
            placeholder="e.g., Special Mix, Hay"
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          {errors.customType && (
            <p className="text-sm text-destructive">
              {errors.customType.message}
            </p>
          )}
        </motion.div>
      )}

      {/* Quantity and Price Per Kg */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="quantityKg" className="flex items-center gap-2">
            <Wheat className="h-4 w-4 text-muted-foreground" />
            Quantity (kg) *
          </Label>
          <Input
            id="quantityKg"
            type="number"
            step="0.1"
            {...register("quantityKg", { valueAsNumber: true })}
            placeholder="0.0"
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          {errors.quantityKg && (
            <p className="text-sm text-destructive">
              {errors.quantityKg.message}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <Label htmlFor="costPerKg" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Cost per kg (₹) *
          </Label>
          <Input
            id="costPerKg"
            type="number"
            step="0.01"
            {...register("costPerKg", { valueAsNumber: true })}
            placeholder="0.00"
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          {errors.costPerKg && (
            <p className="text-sm text-destructive">
              {errors.costPerKg.message}
            </p>
          )}
        </motion.div>
      </div>

      {/* Total Cost Display */}
      {Number(totalCost) > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-lg border border-green-500/20 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-2xl font-bold text-transparent">
              ₹{totalCost}
            </p>
          </div>
        </motion.div>
      )}

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-2"
      >
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Any additional notes about this feed entry"
          rows={3}
          className="resize-none transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-3 pt-4"
      >
        <Button
          type="submit"
          disabled={isSubmitting || loadingCows || cows.length === 0}
          className="group relative flex-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Feed Entry
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

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Loader2, Hash, Tag, Calendar, Activity } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { formatAgeFromDOB } from "@/lib/utils"

const cowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tagNumber: z.string().min(1, "Tag number is required"),
  breed: z.string().min(2, "Breed is required"),
  dateOfBirth: z.string().optional(),
  status: z.enum([
    "ACTIVE",
    "MILKING",
    "DRY",
    "PREGNANT",
    "SICK",
    "SOLD",
    "DECEASED",
  ]),
  notes: z.string().optional(),
})

type CowFormData = z.infer<typeof cowSchema>

interface CowFormProps {
  cowId?: string
  defaultValues?: Partial<CowFormData>
  onSuccess?: () => void
  onCancel?: () => void
}

const COW_STATUSES = [
  { value: "ACTIVE", label: "Active", color: "bg-emerald-500" },
  { value: "MILKING", label: "Milking", color: "bg-green-500" },
  { value: "DRY", label: "Dry", color: "bg-yellow-500" },
  { value: "PREGNANT", label: "Pregnant", color: "bg-blue-500" },
  { value: "SICK", label: "Sick", color: "bg-red-500" },
  { value: "SOLD", label: "Sold", color: "bg-orange-500" },
  { value: "DECEASED", label: "Deceased", color: "bg-gray-500" },
]

export default function CowForm({
  cowId,
  defaultValues,
  onSuccess,
  onCancel,
}: CowFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!cowId

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CowFormData>({
    resolver: zodResolver(cowSchema),
    defaultValues: defaultValues || {
      name: "",
      tagNumber: "",
      breed: "",
      dateOfBirth: "",
      status: "ACTIVE",
      notes: "",
    },
  })

  const watchStatus = watch("status")
  const watchDateOfBirth = watch("dateOfBirth")

  const onSubmit = async (data: CowFormData) => {
    setIsSubmitting(true)

    try {
      const url = isEditMode ? `/api/cows/${cowId}` : "/api/cows"
      const method = isEditMode ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save cow")
      }

      toast.success(
        isEditMode ? "Cow updated successfully!" : "Cow added successfully!"
      )
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected status details
  const selectedStatus = COW_STATUSES.find((s) => s.value === watchStatus)

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Name and Tag Number */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="name" className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Cow Name *
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter cow name"
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="tagNumber" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Tag Number *
          </Label>
          <Input
            id="tagNumber"
            {...register("tagNumber")}
            placeholder="e.g., C001"
            className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
          />
          {errors.tagNumber && (
            <p className="text-sm text-destructive">
              {errors.tagNumber.message}
            </p>
          )}
        </motion.div>
      </div>

      {/* Breed */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Label htmlFor="breed" className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Breed *
        </Label>
        <Input
          id="breed"
          {...register("breed")}
          placeholder="e.g., Holstein, Jersey, Gir"
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
        {errors.breed && (
          <p className="text-sm text-destructive">{errors.breed.message}</p>
        )}
      </motion.div>

      {/* Date of Birth */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Date of Birth (Optional)
        </Label>
        <Input
          id="dateOfBirth"
          type="date"
          {...register("dateOfBirth")}
          className="transition-all duration-200 hover:border-primary/50 focus:border-primary"
        />
      </motion.div>

      {/* Age Display Card */}
      {watchDateOfBirth && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Calculated Age</p>
              <p className="text-lg font-semibold">
                {formatAgeFromDOB(watchDateOfBirth)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <Label htmlFor="status" className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Status *
        </Label>
        <Select
          value={watchStatus}
          onValueChange={(value) =>
            setValue(
              "status",
              value as
                | "ACTIVE"
                | "MILKING"
                | "DRY"
                | "PREGNANT"
                | "SICK"
                | "SOLD"
                | "DECEASED"
            )
          }
        >
          <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
            <SelectValue placeholder="Select cow status" />
          </SelectTrigger>
          <SelectContent>
            {COW_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${status.color}`}></div>
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </motion.div>

      {/* Status Display Card */}
      {selectedStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${selectedStatus.color} animate-pulse`}
            ></div>
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className="text-lg font-semibold">{selectedStatus.label}</p>
            </div>
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
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Medical history, special care instructions, etc."
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
          disabled={isSubmitting}
          className="group relative flex-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Cow" : "Add Cow"}
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

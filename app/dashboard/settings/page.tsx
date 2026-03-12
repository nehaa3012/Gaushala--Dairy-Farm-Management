"use client"

import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Settings as SettingsIcon, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const settingsSchema = z.object({
  farmName: z.string().min(1, "Farm name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  defaultMilkPrice: z.string().min(1, "Default price is required"),
})

type SettingsForm = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  })

  function onSubmit(data: SettingsForm) {
    console.log(data)
    toast.success("Settings saved successfully!")
  }

  return (
    <div className="max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Configure your farm settings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Farm Profile</CardTitle>
            <CardDescription>Update your farm information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input
                  id="farmName"
                  placeholder="Enter farm name"
                  {...register("farmName")}
                />
                {errors.farmName && (
                  <p className="text-sm text-destructive">
                    {errors.farmName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  {...register("address")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultMilkPrice">
                  Default Milk Price (₹/L) *
                </Label>
                <Input
                  id="defaultMilkPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 60.00"
                  {...register("defaultMilkPrice")}
                />
                {errors.defaultMilkPrice && (
                  <p className="text-sm text-destructive">
                    {errors.defaultMilkPrice.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

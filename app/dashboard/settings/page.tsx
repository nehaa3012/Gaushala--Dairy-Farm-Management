"use client"

import { motion, Variants } from "framer-motion"
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
import { GridBackground } from "@/components/ui/grid-background"
import { GlowEffect } from "@/components/ui/glow-effect"

const settingsSchema = z.object({
  farmName: z.string().min(1, "Farm name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  defaultMilkPrice: z.string().min(1, "Default price is required"),
})

type SettingsForm = z.infer<typeof settingsSchema>

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
    <GridBackground className="min-h-screen">
      <GlowEffect
        color="purple"
        size="lg"
        className="-top-20 right-10 opacity-20"
      />
      <GlowEffect
        color="blue"
        size="md"
        className="bottom-20 left-10 opacity-15"
      />

      <div className="max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-600/20 backdrop-blur-sm">
            <SettingsIcon className="h-7 w-7 text-slate-400" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Settings
            </h1>
            <p className="mt-1 text-muted-foreground">
              Configure your farm settings and preferences
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item}>
            <Card className="card-gradient border-slate-500/20 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/30">
              <CardHeader>
                <CardTitle className="text-2xl">Farm Profile</CardTitle>
                <CardDescription className="text-base">
                  Update your farm information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="farmName" className="text-sm font-medium">
                      Farm Name *
                    </Label>
                    <Input
                      id="farmName"
                      placeholder="Enter farm name"
                      className="h-11"
                      {...register("farmName")}
                    />
                    {errors.farmName && (
                      <p className="text-sm text-destructive">
                        {errors.farmName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      className="h-11"
                      {...register("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Address
                    </Label>
                    <Input
                      id="address"
                      placeholder="Enter address"
                      className="h-11"
                      {...register("address")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="defaultMilkPrice"
                      className="text-sm font-medium"
                    >
                      Default Milk Price (₹/L) *
                    </Label>
                    <Input
                      id="defaultMilkPrice"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 60.00"
                      className="h-11"
                      {...register("defaultMilkPrice")}
                    />
                    {errors.defaultMilkPrice && (
                      <p className="text-sm text-destructive">
                        {errors.defaultMilkPrice.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-medium"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </GridBackground>
  )
}

"use client"

import { motion, Variants } from "framer-motion"
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Wallet,
  Users,
  Beef,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { KPICard } from "@/components/shared/KPICard"
import { RevenueVsExpenseChart } from "@/components/charts/RevenueVsExpenseChart"
import { ExpenseBreakdownChart } from "@/components/charts/ExpenseBreakdownChart"
import { FeedConsumptionChart } from "@/components/charts/FeedConsumptionChart"
import { MilkSalesTrendChart } from "@/components/charts/MilkSalesTrendChart"
import { CustomerConsumptionChart } from "@/components/charts/CustomerConsumptionChart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { Card, CardContent } from "@/components/ui/card"
import { GridBackground } from "@/components/ui/grid-background"
import { GlowEffect } from "@/components/ui/glow-effect"

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
}

export default function DashboardPage() {
  const { dashboardData, feedData, expenseData, loading, error } =
    useAnalytics()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-b-4 border-primary"></div>
            <div className="absolute inset-2 animate-spin rounded-full border-t-4 border-b-4 border-purple-500 [animation-direction:reverse] [animation-duration:1.5s]"></div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Loading dashboard...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-md border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center gap-3 text-destructive">
                <AlertCircle className="h-6 w-6" />
                <h3 className="text-lg font-semibold">
                  Error Loading Dashboard
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!dashboardData || !feedData || !expenseData) {
    return null
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <GridBackground className="min-h-screen">
      {/* Ambient Glow Effects */}
      <GlowEffect
        color="purple"
        size="lg"
        className="-top-20 right-10 opacity-30"
      />
      <GlowEffect
        color="blue"
        size="lg"
        className="bottom-20 left-10 opacity-20"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Overview of your farm performance for{" "}
                <span className="font-medium text-foreground">
                  {new Date(
                    dashboardData.year,
                    dashboardData.month - 1
                  ).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Primary KPI Cards */}
        <motion.div
          variants={item}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Total Milk Sold"
              value={`${dashboardData.totalLitersSold} L`}
              icon={TrendingUp}
              description="This month"
              className="stat-card border-blue-500/20 hover:border-blue-500/40"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Total Revenue"
              value={formatCurrency(dashboardData.totalRevenue)}
              icon={DollarSign}
              description="This month"
              className="stat-card border-green-500/20 hover:border-green-500/40"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Total Expenses"
              value={formatCurrency(dashboardData.totalExpenses)}
              icon={TrendingDown}
              description="This month"
              className="stat-card border-red-500/20 hover:border-red-500/40"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Net Profit"
              value={formatCurrency(dashboardData.netProfit)}
              icon={Wallet}
              description="This month"
              className={`stat-card ${
                dashboardData.netProfit >= 0
                  ? "border-emerald-500/20 hover:border-emerald-500/40"
                  : "border-red-500/20 hover:border-red-500/40"
              }`}
            />
          </motion.div>
        </motion.div>

        {/* Secondary KPIs */}
        <motion.div
          variants={item}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Outstanding Dues"
              value={formatCurrency(dashboardData.outstandingDues)}
              icon={AlertCircle}
              description="Pending payments"
              className="stat-card border-orange-500/20 hover:border-orange-500/40"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Active Customers"
              value={dashboardData.activeCustomers}
              icon={Users}
              description="Total active customers"
              className="stat-card border-purple-500/20 hover:border-purple-500/40"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <KPICard
              title="Active Cows"
              value={dashboardData.activeCows}
              icon={Beef}
              description="Currently producing"
              className="stat-card border-pink-500/20 hover:border-pink-500/40"
            />
          </motion.div>
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          {/* Revenue vs Expense Chart */}
          <motion.div
            className="lg:col-span-2"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <RevenueVsExpenseChart data={expenseData.monthlyComparison} />
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ExpenseBreakdownChart data={expenseData.categoryBreakdown} />
          </motion.div>

          {/* Feed Consumption */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FeedConsumptionChart data={feedData.dailyConsumption} />
          </motion.div>
        </motion.div>
      </motion.div>
    </GridBackground>
  )
}

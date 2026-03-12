"use client"

import { motion } from "framer-motion"
import {
  TrendingUp,
  DollarSign,
  TrendingDown,
  Wallet,
  Users,
  Beef,
  AlertCircle,
} from "lucide-react"
import { KPICard } from "@/components/shared/KPICard"
import { RevenueVsExpenseChart } from "@/components/charts/RevenueVsExpenseChart"
import { ExpenseBreakdownChart } from "@/components/charts/ExpenseBreakdownChart"
import { FeedConsumptionChart } from "@/components/charts/FeedConsumptionChart"
import { MilkSalesTrendChart } from "@/components/charts/MilkSalesTrendChart"
import { CustomerConsumptionChart } from "@/components/charts/CustomerConsumptionChart"
import { useAnalytics } from "@/hooks/useAnalytics"
import { Card, CardContent } from "@/components/ui/card"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error Loading Dashboard</h3>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your farm performance for{" "}
          {new Date(
            dashboardData.year,
            dashboardData.month - 1
          ).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={item}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <KPICard
          title="Total Milk Sold"
          value={`${dashboardData.totalLitersSold} L`}
          icon={TrendingUp}
          description="This month"
        />
        <KPICard
          title="Total Revenue"
          value={formatCurrency(dashboardData.totalRevenue)}
          icon={DollarSign}
          description="This month"
          className="border-green-200 dark:border-green-900"
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(dashboardData.totalExpenses)}
          icon={TrendingDown}
          description="This month"
          className="border-red-200 dark:border-red-900"
        />
        <KPICard
          title="Net Profit"
          value={formatCurrency(dashboardData.netProfit)}
          icon={Wallet}
          description="This month"
          className={
            dashboardData.netProfit >= 0
              ? "border-green-200 dark:border-green-900"
              : "border-red-200 dark:border-red-900"
          }
        />
      </motion.div>

      {/* Secondary KPIs */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Outstanding Dues"
          value={formatCurrency(dashboardData.outstandingDues)}
          icon={AlertCircle}
          description="Pending payments"
        />
        <KPICard
          title="Active Customers"
          value={dashboardData.activeCustomers}
          icon={Users}
          description="Total active customers"
        />
        <KPICard
          title="Active Cows"
          value={dashboardData.activeCows}
          icon={Beef}
          description="Currently producing"
        />
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        {/* Revenue vs Expense Chart */}
        <div className="md:col-span-2">
          <RevenueVsExpenseChart data={expenseData.monthlyComparison} />
        </div>

        {/* Expense Breakdown */}
        <ExpenseBreakdownChart data={expenseData.categoryBreakdown} />

        {/* Feed Consumption */}
        <FeedConsumptionChart data={feedData.dailyConsumption} />
      </motion.div>

      {/* Additional Charts */}
      {/* 
      Uncomment these when you have the data:
      <div className="grid gap-6 md:grid-cols-2">
        <MilkSalesTrendChart data={milkSalesData} />
        <CustomerConsumptionChart data={topCustomersData} />
      </div>
      */}
    </motion.div>
  )
}

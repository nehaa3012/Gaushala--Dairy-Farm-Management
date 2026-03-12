"use client"

import { useState, useEffect } from "react"

interface DashboardKPIs {
  totalLitersSold: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  outstandingDues: number
  activeCustomers: number
  activeCows: number
  month: number
  year: number
}

interface FeedChartData {
  dailyConsumption: Array<{
    date: string
    quantityKg: number
    totalCost: number
  }>
  feedTypeBreakdown: Array<{
    feedType: string
    totalCost: number
    totalQuantity: number
  }>
  totalQuantity: number
  totalCost: number
}

interface ExpenseChartData {
  categoryBreakdown: Array<{
    category: string
    amount: number
  }>
  monthlyTrend: Array<{
    month: string
    amount: number
  }>
  monthlyComparison: Array<{
    month: string
    expenses: number
    revenue: number
    profit: number
  }>
  totalExpenses: number
}

export function useAnalytics() {
  const [dashboardData, setDashboardData] = useState<DashboardKPIs | null>(null)
  const [feedData, setFeedData] = useState<FeedChartData | null>(null)
  const [expenseData, setExpenseData] = useState<ExpenseChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [dashboardRes, feedRes, expenseRes] = await Promise.all([
          fetch("/api/analytics/dashboard"),
          fetch("/api/analytics/feed-chart?days=30"),
          fetch("/api/analytics/expense-chart?months=6"),
        ])

        if (!dashboardRes.ok) {
          const dashboardError = await dashboardRes.json()
          console.error("Dashboard API error:", dashboardError)
          throw new Error(
            `Dashboard: ${dashboardError.error || "Failed to fetch"}`
          )
        }

        if (!feedRes.ok) {
          const feedError = await feedRes.json()
          console.error("Feed API error:", feedError)
          throw new Error(`Feed: ${feedError.error || "Failed to fetch"}`)
        }

        if (!expenseRes.ok) {
          const expenseError = await expenseRes.json()
          console.error("Expense API error:", expenseError)
          throw new Error(`Expense: ${expenseError.error || "Failed to fetch"}`)
        }

        const [dashboard, feed, expense] = await Promise.all([
          dashboardRes.json(),
          feedRes.json(),
          expenseRes.json(),
        ])

        setDashboardData(dashboard)
        setFeedData(feed)
        setExpenseData(expense)
      } catch (err) {
        console.error("Analytics fetch error:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics data. Please check your database connection."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    dashboardData,
    feedData,
    expenseData,
    loading,
    error,
  }
}

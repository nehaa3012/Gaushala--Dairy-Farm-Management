import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/analytics/expense-chart - Expense chart data
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const months = parseInt(searchParams.get("months") || "6")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Get expenses for the period
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    })

    // Group by category for breakdown chart
    const categoryBreakdown: Record<
      string,
      { category: string; amount: number }
    > = {}

    expenses.forEach((expense) => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = {
          category: expense.category,
          amount: 0,
        }
      }
      categoryBreakdown[expense.category].amount += Number(expense.amount)
    })

    // Group by month for trend chart
    const monthlyExpenses: Record<string, { month: string; amount: number }> =
      {}

    expenses.forEach((expense) => {
      const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, "0")}`
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = {
          month: monthKey,
          amount: 0,
        }
      }
      monthlyExpenses[monthKey].amount += Number(expense.amount)
    })

    // Get revenue data for comparison
    const deliveries = await prisma.delivery.findMany({
      where: {
        customer: {
          userId: user.id,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
        isHoliday: false,
      },
      include: {
        customer: true,
      },
    })

    // Group revenue by month
    const monthlyRevenue: Record<string, { month: string; revenue: number }> =
      {}

    deliveries.forEach((delivery) => {
      const monthKey = `${delivery.date.getFullYear()}-${String(delivery.date.getMonth() + 1).padStart(2, "0")}`
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = {
          month: monthKey,
          revenue: 0,
        }
      }
      monthlyRevenue[monthKey].revenue +=
        Number(delivery.liters) * Number(delivery.priceAtTime)
    })

    // Combine expenses and revenue by month
    const monthlyComparison = Object.keys({
      ...monthlyExpenses,
      ...monthlyRevenue,
    })
      .sort()
      .map((month) => ({
        month,
        expenses: monthlyExpenses[month]?.amount || 0,
        revenue: monthlyRevenue[month]?.revenue || 0,
        profit:
          (monthlyRevenue[month]?.revenue || 0) -
          (monthlyExpenses[month]?.amount || 0),
      }))

    return NextResponse.json({
      categoryBreakdown: Object.values(categoryBreakdown),
      monthlyTrend: Object.values(monthlyExpenses),
      monthlyComparison,
      totalExpenses: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    })
  } catch (error) {
    console.error("Expense chart analytics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/analytics/dashboard - KPI cards data
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current month start and end
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const monthStart = new Date(currentYear, currentMonth - 1, 1)
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

    // Total liters sold this month
    const deliveries = await prisma.delivery.findMany({
      where: {
        customer: {
          userId: user.id,
        },
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        isHoliday: false,
      },
    })

    const totalLitersSold = deliveries.reduce(
      (sum, d) => sum + Number(d.liters),
      0
    )

    // Total revenue this month (from deliveries)
    const totalRevenue = deliveries.reduce(
      (sum, d) => sum + Number(d.liters) * Number(d.priceAtTime),
      0
    )

    // Total expenses this month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    // Net profit this month
    const netProfit = totalRevenue - totalExpenses

    // Outstanding dues (sum of all unpaid bills)
    const unpaidBills = await prisma.bill.findMany({
      where: {
        customer: {
          userId: user.id,
        },
        status: {
          in: ["UNPAID", "PARTIAL"],
        },
      },
    })

    const outstandingDues = unpaidBills.reduce(
      (sum, b) => sum + (Number(b.totalAmount) - Number(b.paidAmount)),
      0
    )

    // Active customers count
    const activeCustomers = await prisma.customer.count({
      where: {
        userId: user.id,
        isActive: true,
        deletedAt: null,
      },
    })

    // Active cows count
    const activeCows = await prisma.cow.count({
      where: {
        userId: user.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    })

    return NextResponse.json({
      totalLitersSold: Number(totalLitersSold.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      outstandingDues: Number(outstandingDues.toFixed(2)),
      activeCustomers,
      activeCows,
      month: currentMonth,
      year: currentYear,
    })
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

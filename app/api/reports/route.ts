import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const monthlyReportSchema = z.object({
  type: z.literal("MONTHLY"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
})

const customerStatementSchema = z.object({
  type: z.literal("CUSTOMER_STATEMENT"),
  customerId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

// GET /api/reports - List all generated reports
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    const whereClause: any = {
      userId: user.id,
    }

    if (type === "MONTHLY" || type === "CUSTOMER_STATEMENT") {
      whereClause.type = type
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/reports - Generate a new report
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const reportType = body.type

    if (reportType === "MONTHLY") {
      const parsed = monthlyReportSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.format() },
          { status: 400 }
        )
      }

      const { month, year } = parsed.data

      // Fetch data for the month
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      // Get all deliveries for the month
      const deliveries = await prisma.delivery.findMany({
        where: {
          customer: { userId: user.id },
          date: { gte: startDate, lte: endDate },
        },
        include: {
          customer: {
            select: { id: true, name: true },
          },
        },
      })

      // Get all expenses for the month
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
      })

      // Get all feed entries for the month
      const feedEntries = await prisma.feedEntry.findMany({
        where: {
          userId: user.id,
          date: { gte: startDate, lte: endDate },
        },
        include: {
          cow: {
            select: { id: true, name: true, tagNumber: true },
          },
        },
      })

      // Get active cows count
      const activeCows = await prisma.cow.count({
        where: {
          userId: user.id,
          deletedAt: null,
          status: { in: ["ACTIVE", "MILKING", "PREGNANT"] },
        },
      })

      // Calculate totals
      const totalRevenue = deliveries.reduce(
        (sum, d) => sum + Number(d.liters) * Number(d.priceAtTime),
        0
      )
      const totalExpenses = expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0
      )
      const totalFeedCost = feedEntries.reduce(
        (sum, f) => sum + Number(f.totalCost),
        0
      )
      const totalMilkDelivered = deliveries.reduce(
        (sum, d) => sum + Number(d.liters),
        0
      )

      const reportData = {
        month,
        year,
        period: `${getMonthName(month)} ${year}`,
        summary: {
          activeCows,
          totalRevenue,
          totalExpenses: totalExpenses + totalFeedCost,
          netProfit: totalRevenue - totalExpenses - totalFeedCost,
          totalMilkDelivered,
          deliveryCount: deliveries.length,
        },
        deliveries: deliveries.map((d) => ({
          date: d.date,
          customerName: d.customer.name,
          liters: Number(d.liters),
          priceAtTime: Number(d.priceAtTime),
          amount: Number(d.liters) * Number(d.priceAtTime),
          session: d.session,
        })),
        expenses: expenses.map((e) => ({
          date: e.date,
          category: e.category,
          amount: Number(e.amount),
          notes: e.notes,
        })),
        feedEntries: feedEntries.map((f) => ({
          date: f.date,
          cowName: f.cow?.name || "N/A",
          feedType: f.feedType,
          quantityKg: Number(f.quantityKg),
          totalCost: Number(f.totalCost),
        })),
      }

      // Create report record
      const report = await prisma.report.create({
        data: {
          userId: user.id,
          type: "MONTHLY",
          title: `Monthly Report - ${getMonthName(month)} ${year}`,
          description: `Comprehensive farm report for ${getMonthName(month)} ${year}`,
          month,
          year,
          data: reportData,
        },
      })

      return NextResponse.json(report, { status: 201 })
    } else if (reportType === "CUSTOMER_STATEMENT") {
      const parsed = customerStatementSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.format() },
          { status: 400 }
        )
      }

      const { customerId, startDate: startDateStr, endDate: endDateStr } = parsed.data

      // Verify customer belongs to user
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId: user.id,
          deletedAt: null,
        },
      })

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        )
      }

      const startDate = new Date(startDateStr)
      const endDate = new Date(endDateStr)
      endDate.setHours(23, 59, 59, 999)

      // Get deliveries for customer in date range
      const deliveries = await prisma.delivery.findMany({
        where: {
          customerId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: "asc" },
      })

      // Get bills for customer
      const bills = await prisma.bill.findMany({
        where: {
          customerId,
        },
        include: {
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      })

      // Calculate totals
      const totalLiters = deliveries.reduce(
        (sum, d) => sum + Number(d.liters),
        0
      )
      const totalAmount = deliveries.reduce(
        (sum, d) => sum + Number(d.liters) * Number(d.priceAtTime),
        0
      )
      const totalPaid = bills.reduce(
        (sum, b) => sum + Number(b.paidAmount),
        0
      )

      const reportData = {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          pricePerLiter: Number(customer.pricePerLiter),
        },
        period: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
        summary: {
          totalLiters,
          totalAmount,
          totalPaid,
          balance: totalAmount - totalPaid,
          deliveryCount: deliveries.length,
        },
        deliveries: deliveries.map((d) => ({
          date: d.date,
          liters: Number(d.liters),
          priceAtTime: Number(d.priceAtTime),
          amount: Number(d.liters) * Number(d.priceAtTime),
          session: d.session,
        })),
        bills: bills.map((b) => ({
          month: b.month,
          year: b.year,
          totalAmount: Number(b.totalAmount),
          paidAmount: Number(b.paidAmount),
          status: b.status,
          payments: b.payments.map((p) => ({
            amount: Number(p.amount),
            paidAt: p.paidAt,
            notes: p.notes,
          })),
        })),
      }

      // Create report record
      const report = await prisma.report.create({
        data: {
          userId: user.id,
          type: "CUSTOMER_STATEMENT",
          title: `Customer Statement - ${customer.name}`,
          description: `Statement from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          customerId: customer.id,
          customerName: customer.name,
          startDate,
          endDate,
          data: reportData,
        },
      })

      return NextResponse.json(report, { status: 201 })
    } else {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function getMonthName(month: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1]
}

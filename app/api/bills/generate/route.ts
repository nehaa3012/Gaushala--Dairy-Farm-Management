import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const generateBillSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  customerId: z.string().optional(), // If not provided, generate for all customers
})

// POST /api/bills/generate - Generate bills for a month
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = generateBillSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { month, year, customerId } = parsed.data

    // Get customers to generate bills for
    const customers = await prisma.customer.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
        ...(customerId && { id: customerId }),
      },
    })

    if (customers.length === 0) {
      return NextResponse.json({ error: "No customers found" }, { status: 404 })
    }

    const generatedBills = []

    // Get start and end date for the month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    for (const customer of customers) {
      // Calculate total deliveries for the month
      const deliveries = await prisma.delivery.findMany({
        where: {
          customerId: customer.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
          isHoliday: false,
        },
      })

      // Calculate total liters and amount
      const totalLiters = deliveries.reduce(
        (sum, delivery) => sum + Number(delivery.liters),
        0
      )

      const totalAmount = deliveries.reduce(
        (sum, delivery) =>
          sum + Number(delivery.liters) * Number(delivery.priceAtTime),
        0
      )

      // Check if bill already exists
      const existingBill = await prisma.bill.findUnique({
        where: {
          customerId_month_year: {
            customerId: customer.id,
            month,
            year,
          },
        },
      })

      if (existingBill) {
        // Update existing bill
        const updatedBill = await prisma.bill.update({
          where: { id: existingBill.id },
          data: {
            totalLiters,
            totalAmount,
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
        generatedBills.push(updatedBill)
      } else {
        // Create new bill
        const newBill = await prisma.bill.create({
          data: {
            customerId: customer.id,
            month,
            year,
            totalLiters,
            totalAmount,
            paidAmount: 0,
            status: "UNPAID",
          },
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
        generatedBills.push(newBill)
      }
    }

    return NextResponse.json({
      message: `Generated ${generatedBills.length} bill(s)`,
      bills: generatedBills,
    })
  } catch (error) {
    console.error("Generate bills error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

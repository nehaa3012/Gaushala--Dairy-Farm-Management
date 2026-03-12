import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const expenseSchema = z.object({
  category: z.enum([
    "FEED",
    "MEDICINE",
    "LABOR",
    "ELECTRICITY",
    "MAINTENANCE",
    "TRANSPORT",
    "OTHER",
  ]),
  amount: z.number().min(0),
  date: z.string().datetime(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
})

// GET /api/expenses - List expenses
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const whereClause: any = {
      userId: user.id,
      deletedAt: null,
    }

    if (category) {
      whereClause.category = category
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Get expenses error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/expenses - Add expense
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = expenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        category: parsed.data.category,
        amount: parsed.data.amount,
        date: new Date(parsed.data.date),
        notes: parsed.data.notes,
        isRecurring: parsed.data.isRecurring ?? false,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Create expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

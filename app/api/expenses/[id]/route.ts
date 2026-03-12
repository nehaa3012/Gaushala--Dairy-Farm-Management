import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateExpenseSchema = z.object({
  category: z
    .enum([
      "FEED",
      "MEDICINE",
      "LABOR",
      "ELECTRICITY",
      "MAINTENANCE",
      "TRANSPORT",
      "OTHER",
    ])
    .optional(),
  amount: z.number().min(0).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
})

// PATCH /api/expenses/[id] - Edit expense
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = updateExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Verify expense exists and belongs to user
    const existing = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    // Convert date string to Date object if provided
    const updateData: any = { ...parsed.data }
    if (updateData.date) {
      updateData.date = new Date(updateData.date)
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Update expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/expenses/[id] - Soft delete expense
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify expense exists and belongs to user
    const existing = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    // Soft delete by setting deletedAt
    await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Delete expense error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

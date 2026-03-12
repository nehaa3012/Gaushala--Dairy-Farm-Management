import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const recordPaymentSchema = z.object({
  amount: z.number().min(0),
  notes: z.string().optional(),
})

// PATCH /api/bills/[id] - Record payment
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
    const parsed = recordPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Verify bill exists and belongs to user
    const bill = await prisma.bill.findFirst({
      where: {
        id,
        customer: {
          userId: user.id,
        },
      },
    })

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        billId: id,
        amount: parsed.data.amount,
        notes: parsed.data.notes,
      },
    })

    // Update bill paid amount
    const newPaidAmount = Number(bill.paidAmount) + parsed.data.amount

    // Determine new status
    let newStatus = bill.status
    if (newPaidAmount >= Number(bill.totalAmount)) {
      newStatus = "PAID"
    } else if (newPaidAmount > 0) {
      newStatus = "PARTIAL"
    } else {
      newStatus = "UNPAID"
    }

    // Update bill
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
    })

    return NextResponse.json({
      bill: updatedBill,
      payment,
    })
  } catch (error) {
    console.error("Record payment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET /api/bills/[id] - Get single bill
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const bill = await prisma.bill.findFirst({
      where: {
        id,
        customer: {
          userId: user.id,
        },
      },
      include: {
        customer: true,
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
    })

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Get bill error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

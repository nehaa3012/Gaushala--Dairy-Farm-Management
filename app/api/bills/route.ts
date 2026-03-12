import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/bills - List bills
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    const status = searchParams.get("status")

    const whereClause: any = {
      customer: {
        userId: user.id,
      },
    }

    if (customerId) {
      whereClause.customerId = customerId
    }

    if (status) {
      whereClause.status = status
    }

    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    })

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Get bills error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

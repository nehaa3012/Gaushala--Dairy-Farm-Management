import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const deliverySchema = z.object({
  customerId: z.string(),
  date: z.string().datetime(),
  liters: z.number().min(0).max(100),
  session: z.enum(["MORNING", "EVENING"]),
  isHoliday: z.boolean().optional(),
  notes: z.string().optional(),
})

// GET /api/deliveries - List deliveries with filters
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customerId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const whereClause: any = {
      customer: {
        userId: user.id,
      },
    }

    if (customerId) {
      whereClause.customerId = customerId
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(deliveries)
  } catch (error) {
    console.error("Get deliveries error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/deliveries - Create delivery entry
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = deliverySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Validate: date cannot be in future
    const deliveryDate = new Date(parsed.data.date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (deliveryDate > today) {
      return NextResponse.json(
        { error: "Cannot create delivery for future date" },
        { status: 400 }
      )
    }

    // Validate: customer must be active and belong to user
    const customer = await prisma.customer.findFirst({
      where: {
        id: parsed.data.customerId,
        userId: user.id,
        isActive: true,
        deletedAt: null,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found or inactive" },
        { status: 404 }
      )
    }

    // Check for duplicate entry (same customer, date, session)
    const existing = await prisma.delivery.findUnique({
      where: {
        customerId_date_session: {
          customerId: parsed.data.customerId,
          date: deliveryDate,
          session: parsed.data.session,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Delivery entry already exists for this date and session" },
        { status: 409 }
      )
    }

    // Create delivery with price snapshot
    const delivery = await prisma.delivery.create({
      data: {
        customerId: parsed.data.customerId,
        date: deliveryDate,
        liters: parsed.data.liters,
        session: parsed.data.session,
        priceAtTime: customer.pricePerLiter,
        isHoliday: parsed.data.isHoliday ?? false,
        notes: parsed.data.notes,
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

    return NextResponse.json(delivery, { status: 201 })
  } catch (error) {
    console.error("Create delivery error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

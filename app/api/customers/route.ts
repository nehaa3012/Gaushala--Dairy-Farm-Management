import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const customerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  phone: z.string().min(10, "Phone number must be at least 10 digits long"),
  address: z.string().optional(),
  notes: z.string().optional(),
  pricePerLiter: z.number().min(0, "Price must be positive"),
})

// GET /api/customers - List all customers
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customers = await prisma.customer.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Get customers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create customer
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = customerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Check for duplicate phone
    if (parsed.data.phone) {
      const existing = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          phone: parsed.data.phone,
          deletedAt: null,
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: "Phone number already exists" },
          { status: 409 }
        )
      }
    }

    const customer = await prisma.customer.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error("Create customer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

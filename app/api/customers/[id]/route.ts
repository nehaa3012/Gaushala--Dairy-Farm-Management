import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  pricePerLiter: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/customers/[id] - Get single customer
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

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        deliveries: {
          orderBy: { date: "desc" },
          take: 10,
        },
        bills: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Get customer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/customers/[id] - Update customer
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
    const parsed = updateCustomerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Verify customer exists and belongs to user
    const existing = await prisma.customer.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Check for duplicate phone if updating phone
    if (parsed.data.phone && parsed.data.phone !== existing.phone) {
      const duplicate = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          phone: parsed.data.phone,
          deletedAt: null,
          id: { not: id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: "Phone number already exists" },
          { status: 409 }
        )
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Update customer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Soft delete customer
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

    // Verify customer exists and belongs to user
    const existing = await prisma.customer.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Soft delete by setting deletedAt
    const customer = await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Delete customer error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

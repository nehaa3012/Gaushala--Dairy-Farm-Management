import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateDeliverySchema = z.object({
  liters: z.number().min(0).max(100).optional(),
  isHoliday: z.boolean().optional(),
  notes: z.string().optional(),
})

// PATCH /api/deliveries/[id] - Update delivery (within 24h)
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
    const parsed = updateDeliverySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Verify delivery exists and belongs to user
    const existing = await prisma.delivery.findFirst({
      where: {
        id,
        customer: {
          userId: user.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Check if 24h lock is in place
    if (existing.lockedAt) {
      return NextResponse.json(
        { error: "Delivery is locked and cannot be edited" },
        { status: 403 }
      )
    }

    // Check if 24 hours have passed since creation
    const now = new Date()
    const hoursSinceCreation =
      (now.getTime() - existing.createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation > 24) {
      // Lock the delivery
      await prisma.delivery.update({
        where: { id },
        data: { lockedAt: now },
      })

      return NextResponse.json(
        { error: "Delivery is locked after 24 hours" },
        { status: 403 }
      )
    }

    const delivery = await prisma.delivery.update({
      where: { id },
      data: parsed.data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(delivery)
  } catch (error) {
    console.error("Update delivery error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/deliveries/[id] - Delete delivery (within 24h)
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

    // Verify delivery exists and belongs to user
    const existing = await prisma.delivery.findFirst({
      where: {
        id,
        customer: {
          userId: user.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    // Check if 24h lock is in place
    if (existing.lockedAt) {
      return NextResponse.json(
        { error: "Delivery is locked and cannot be deleted" },
        { status: 403 }
      )
    }

    // Check if 24 hours have passed since creation
    const now = new Date()
    const hoursSinceCreation =
      (now.getTime() - existing.createdAt.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation > 24) {
      // Lock the delivery
      await prisma.delivery.update({
        where: { id },
        data: { lockedAt: now },
      })

      return NextResponse.json(
        { error: "Delivery is locked after 24 hours" },
        { status: 403 }
      )
    }

    await prisma.delivery.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Delivery deleted successfully" })
  } catch (error) {
    console.error("Delete delivery error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

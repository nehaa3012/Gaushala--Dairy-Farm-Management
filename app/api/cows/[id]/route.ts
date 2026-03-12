import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCowSchema = z.object({
  name: z.string().min(1).optional(),
  tagNumber: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  age: z.number().min(0).optional(),
  status: z.enum([
    "ACTIVE",
    "DRY",
    "MILKING",
    "PREGNANT",
    "SICK",
    "SOLD",
    "DECEASED",
  ]).optional(),
  notes: z.string().optional(),
})

// Helper function to calculate age from date of birth
function calculateAgeInMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const now = new Date()
  const ageInMonths = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  )
  return Math.max(0, ageInMonths) // Ensure non-negative
}

// GET /api/cows/[id] - Get single cow
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

    const cow = await prisma.cow.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        feedEntries: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    })

    if (!cow) {
      return NextResponse.json({ error: "Cow not found" }, { status: 404 })
    }

    return NextResponse.json(cow)
  } catch (error) {
    console.error("Get cow error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/cows/[id] - Update cow status
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
    const parsed = updateCowSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Verify cow exists and belongs to user
    const existing = await prisma.cow.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Cow not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...parsed.data }
    
    // If dateOfBirth is provided, convert to Date and calculate age
    if (parsed.data.dateOfBirth) {
      updateData.dateOfBirth = new Date(parsed.data.dateOfBirth)
      updateData.age = calculateAgeInMonths(parsed.data.dateOfBirth)
    }

    const cow = await prisma.cow.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(cow)
  } catch (error) {
    console.error("Update cow error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/cows/[id] - Soft delete cow
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

    // Verify cow exists and belongs to user
    const existing = await prisma.cow.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Cow not found" }, { status: 404 })
    }

    // Soft delete by setting deletedAt
    await prisma.cow.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ message: "Cow deleted successfully" })
  } catch (error) {
    console.error("Delete cow error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

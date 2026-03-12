import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const cowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagNumber: z.string().min(1, "Tag number is required"),
  breed: z.string().min(1, "Breed is required"),
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
  ]).optional().default("ACTIVE"),
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

// GET /api/cows - List cows
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cows = await prisma.cow.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cows)
  } catch (error) {
    console.error("Get cows error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/cows - Add cow
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = cowSchema.safeParse(body)

    if (!parsed.success) {
      console.error("Validation error:", parsed.error.format())
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.format(),
        },
        { status: 400 }
      )
    }

    // Prepare data for database
    const cowData: any = {
      name: parsed.data.name,
      tagNumber: parsed.data.tagNumber,
      breed: parsed.data.breed,
      status: parsed.data.status,
      userId: user.id,
    }

    // Add optional fields if provided
    if (parsed.data.notes) {
      cowData.notes = parsed.data.notes
    }

    if (parsed.data.dateOfBirth) {
      cowData.dateOfBirth = new Date(parsed.data.dateOfBirth)
      // Auto-calculate age from date of birth
      cowData.age = calculateAgeInMonths(parsed.data.dateOfBirth)
    } else if (parsed.data.age !== undefined) {
      // Use provided age if dateOfBirth not given
      cowData.age = parsed.data.age
    }

    const cow = await prisma.cow.create({
      data: cowData,
    })

    return NextResponse.json(cow, { status: 201 })
  } catch (error) {
    console.error("Create cow error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

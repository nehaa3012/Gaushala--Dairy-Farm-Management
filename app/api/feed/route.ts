import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const feedEntrySchema = z.object({
  cowId: z.string().optional(),
  date: z.string().datetime(),
  feedType: z.enum([
    "GREEN_FODDER",
    "DRY_FODDER",
    "CONCENTRATE",
    "SILAGE",
    "MINERAL_MIX",
    "CUSTOM",
  ]),
  customType: z.string().optional(),
  quantityKg: z.number().min(0),
  costPerKg: z.number().min(0),
  notes: z.string().optional(),
})

// GET /api/feed - List feed entries
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cowId = searchParams.get("cowId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const whereClause: any = {
      userId: user.id,
    }

    if (cowId) {
      whereClause.cowId = cowId
    }

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const feedEntries = await prisma.feedEntry.findMany({
      where: whereClause,
      include: {
        cow: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(feedEntries)
  } catch (error) {
    console.error("Get feed entries error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/feed - Add feed entry
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = feedEntrySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      )
    }

    // Validate: if feedType is CUSTOM, customType is required
    if (parsed.data.feedType === "CUSTOM" && !parsed.data.customType) {
      return NextResponse.json(
        { error: "Custom type is required when feed type is CUSTOM" },
        { status: 400 }
      )
    }

    // Validate: if cowId is provided, cow must exist and belong to user
    if (parsed.data.cowId) {
      const cow = await prisma.cow.findFirst({
        where: {
          id: parsed.data.cowId,
          userId: user.id,
          deletedAt: null,
        },
      })

      if (!cow) {
        return NextResponse.json({ error: "Cow not found" }, { status: 404 })
      }
    }

    // Calculate total cost
    const totalCost = parsed.data.quantityKg * parsed.data.costPerKg

    const feedEntry = await prisma.feedEntry.create({
      data: {
        userId: user.id,
        cowId: parsed.data.cowId,
        date: new Date(parsed.data.date),
        feedType: parsed.data.feedType,
        customType: parsed.data.customType,
        quantityKg: parsed.data.quantityKg,
        costPerKg: parsed.data.costPerKg,
        totalCost,
        notes: parsed.data.notes,
      },
      include: {
        cow: {
          select: {
            id: true,
            name: true,
            tagNumber: true,
          },
        },
      },
    })

    return NextResponse.json(feedEntry, { status: 201 })
  } catch (error) {
    console.error("Create feed entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

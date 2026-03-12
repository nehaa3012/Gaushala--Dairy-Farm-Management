import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/analytics/feed-chart - Feed chart data
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get("days") || "30")
    const cowId = searchParams.get("cowId")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const whereClause: any = {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (cowId) {
      whereClause.cowId = cowId
    }

    // Get feed entries for the period
    const feedEntries = await prisma.feedEntry.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    })

    // Group by date for daily consumption chart
    const dailyConsumption: Record<
      string,
      { date: string; quantityKg: number; totalCost: number }
    > = {}

    feedEntries.forEach((entry) => {
      const dateKey = entry.date.toISOString().split("T")[0]
      if (!dailyConsumption[dateKey]) {
        dailyConsumption[dateKey] = {
          date: dateKey,
          quantityKg: 0,
          totalCost: 0,
        }
      }
      dailyConsumption[dateKey].quantityKg += Number(entry.quantityKg)
      dailyConsumption[dateKey].totalCost += Number(entry.totalCost)
    })

    // Group by feed type for breakdown chart
    const feedTypeBreakdown: Record<
      string,
      { feedType: string; totalCost: number; totalQuantity: number }
    > = {}

    feedEntries.forEach((entry) => {
      const type =
        entry.feedType === "CUSTOM"
          ? entry.customType || "CUSTOM"
          : entry.feedType
      if (!feedTypeBreakdown[type]) {
        feedTypeBreakdown[type] = {
          feedType: type,
          totalCost: 0,
          totalQuantity: 0,
        }
      }
      feedTypeBreakdown[type].totalCost += Number(entry.totalCost)
      feedTypeBreakdown[type].totalQuantity += Number(entry.quantityKg)
    })

    return NextResponse.json({
      dailyConsumption: Object.values(dailyConsumption),
      feedTypeBreakdown: Object.values(feedTypeBreakdown),
      totalQuantity: feedEntries.reduce(
        (sum, e) => sum + Number(e.quantityKg),
        0
      ),
      totalCost: feedEntries.reduce((sum, e) => sum + Number(e.totalCost), 0),
    })
  } catch (error) {
    console.error("Feed chart analytics error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

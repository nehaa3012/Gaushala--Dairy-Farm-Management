import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/feed/[id] - Delete feed entry
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

    // Verify feed entry exists and belongs to user
    const existing = await prisma.feedEntry.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Feed entry not found" },
        { status: 404 }
      )
    }

    await prisma.feedEntry.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Feed entry deleted successfully" })
  } catch (error) {
    console.error("Delete feed entry error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

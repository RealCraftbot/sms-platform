import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")
    const categoryId = searchParams.get("categoryId")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const status = searchParams.get("status") || "available"

    const where: any = {
      status,
    }

    if (platform) where.platform = platform
    if (categoryId) where.categoryId = categoryId
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) }
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) }

    const logs = await prisma.socialLog.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { price: "asc" },
      take: 100,
    })

    const categories = await prisma.logCategory.findMany({
      where: { isActive: true },
    })

    return NextResponse.json({
      logs,
      categories,
      platforms: ["Instagram", "Facebook", "Twitter", "TikTok"],
    })
  } catch (error) {
    console.error("Get logs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const [
      totalUsers,
      totalOrders,
      pendingPayments,
      availableLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.manualPayment.count({
        where: { status: "pending_review" },
      }),
      prisma.socialLog.count({
        where: { status: "available" },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalOrders,
      pendingPayments,
      availableLogs,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
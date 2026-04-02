import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

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
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Simple admin auth check - expects x-admin-id header
async function getAdmin(request: Request) {
  const adminId = request.headers.get("x-admin-id")
  const adminEmail = request.headers.get("x-admin-email")
  
  if (!adminId && !adminEmail) {
    return null
  }
  
  if (adminId) {
    return prisma.admin.findUnique({
      where: { id: adminId },
    })
  }
  
  if (adminEmail) {
    return prisma.admin.findUnique({
      where: { email: adminEmail },
    })
  }
  
  return null
}

export async function GET() {
  try {
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
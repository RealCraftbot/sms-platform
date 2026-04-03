import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const payments = await prisma.manualPayment.findMany({
      where: { status: "approved" },
      include: {
        order: {
          include: { user: true },
        },
      },
      orderBy: { reviewedAt: "desc" },
    })

    const serialized = payments.map(p => ({
      id: p.id,
      amount: p.order.totalRevenue?.toString() || "0",
      status: p.status,
      createdAt: p.order.createdAt.toISOString(),
      paidAt: p.order.paidAt?.toISOString() || null,
      user: {
        email: p.order.user.email,
        name: p.order.user.name,
      },
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Get approved payments error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const payments = await prisma.manualPayment.findMany({
      where: { status: "pending_review" },
      include: {
        order: {
          include: {
            user: true,
            paymentMethodRel: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Get pending payments error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
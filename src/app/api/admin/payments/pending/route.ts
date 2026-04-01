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

    const payments = await prisma.manualPayment.findMany({
      where: { status: "pending_review" },
      include: {
        order: {
          include: {
            user: true,
            paymentMethod: true,
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
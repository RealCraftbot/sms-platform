import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!adminUser || adminUser.email !== "admin@smsreseller.com") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, reviewNotes } = body

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const payment = await prisma.manualPayment.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    await prisma.manualPayment.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: adminUser.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
    })

    const orderStatus = action === "approve" ? "paid" : "cancelled"

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
    })

    if (action === "approve") {
      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
      })

      if (order && order.type === "sms") {
        const phoneNumber = "+234" + Math.floor(Math.random() * 900000000 + 100000000)
        await prisma.sMSOrder.update({
          where: { orderId: order.id },
          data: {
            phoneNumber,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          }
        })
      } else if (order && order.type === "log") {
        const logOrder = await prisma.logOrder.findUnique({
          where: { orderId: order.id },
        })
        if (logOrder) {
          const logIds = logOrder.items as string[]
          await prisma.socialLog.updateMany({
            where: { id: { in: logIds } },
            data: {
              status: "sold",
              soldToId: order.userId,
              soldAt: new Date(),
            }
          })
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "completed" },
          })
        }
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("Review payment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
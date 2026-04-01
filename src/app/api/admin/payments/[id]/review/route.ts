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

    if (action === "approve") {
      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      if (order.type === "deposit") {
        await prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.amount } },
        })

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "completed" },
        })

        return NextResponse.json({ 
          success: true, 
          status: newStatus,
          message: `₦${order.amount} added to user wallet` 
        })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "paid" },
      })

      return NextResponse.json({ 
        success: true, 
        status: newStatus,
        message: "Order marked as paid. User can now use wallet for orders." 
      })
    }

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "cancelled" },
    })

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    console.error("Review payment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response, admin } = await checkAdminAuth(request)
    if (!authorized || !admin) return response

    const { id } = await params
    const body = await request.json()
    const { action, reviewNotes, amount } = body

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const payment = await prisma.manualPayment.findUnique({
      where: { id },
      include: { order: true, user: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const newStatus = action === "approve" ? "approved" : "rejected"

    await prisma.manualPayment.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
    })

    if (action === "approve") {
      const finalAmount = amount ? parseFloat(amount) : Number(payment.order.totalRevenue)
      
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "paid",
          totalRevenue: finalAmount,
          paidAt: new Date(),
          status: "processing",
        },
      })

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          balance: {
            increment: finalAmount,
          },
        },
      })

      return NextResponse.json({
        success: true,
        status: newStatus,
        message: `Payment approved! ₦${finalAmount.toFixed(2)} added to wallet`,
        addedAmount: finalAmount,
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

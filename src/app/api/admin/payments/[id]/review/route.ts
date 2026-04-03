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
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        reviewNotes,
      },
    })

    if (action === "approve") {
      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "paid",
            paidAt: new Date(),
            status: "processing",
          },
        })
      }

      return NextResponse.json({
        success: true,
        status: newStatus,
        message: "Payment approved and order marked as paid",
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

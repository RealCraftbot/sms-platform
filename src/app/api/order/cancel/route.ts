import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createSupplierManager } from "@/lib/suppliers"
import { ServiceType } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: true,
        pricingRule: {
          include: {
            supplierProduct: {
              include: { supplier: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.user.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (order.status !== "paid" && order.status !== "processing") {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 })
    }

    if (order.canCancelUntil && new Date() > order.canCancelUntil) {
      return NextResponse.json({ error: "Cancellation window has expired" }, { status: 400 })
    }

    let refundSuccessful = false

    if (order.pricingRule?.type === ServiceType.SMS_NUMBER && order.supplierId) {
      try {
        const supplier = await prisma.supplier.findUnique({
          where: { id: order.supplierId },
        })

        if (supplier) {
          const manager = createSupplierManager(supplier)
          refundSuccessful = await manager.cancel(order.externalOrderId!)
        }
      } catch (error) {
        console.error("Supplier cancel error:", error)
      }
    }

    const refundAmount = order.paymentStatus === "paid" ? Number(order.totalRevenue) : 0

    await prisma.user.update({
      where: { id: order.userId },
      data: {
        balance: { increment: refundAmount },
      },
    })

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "cancelled",
        isCancelled: true,
        cancellationReason: "User requested cancellation",
        cancelledAt: new Date(),
        paymentStatus: refundAmount > 0 ? "refunded" : "cancelled",
      },
      include: {
        items: true,
        pricingRule: true,
      },
    })

    const user = await prisma.user.findUnique({
      where: { id: order.userId },
    })

    return NextResponse.json({
      ...updatedOrder,
      refundedAmount: refundAmount,
      supplierRefundStatus: refundSuccessful ? "success" : "failed",
      newBalance: user?.balance,
    })
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

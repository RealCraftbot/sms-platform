import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType, OrderStatus, PaymentStatus } from "@prisma/client"
import { getProviderBySlug } from "@/lib/providers"

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
            providerProduct: {
              include: { provider: true },
            },
          },
        },
        provider: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.user.email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (order.status !== OrderStatus.PROCESSING && order.status !== OrderStatus.APPROVED) {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 })
    }

    if (order.canCancelUntil && new Date() > order.canCancelUntil) {
      return NextResponse.json({ error: "Cancellation window has expired" }, { status: 400 })
    }

    let refundSuccessful = false

    if (order.pricingRule?.type === ServiceType.SMS_NUMBER && order.providerId && order.externalOrderId) {
      try {
        const provider = await prisma.provider.findUnique({
          where: { id: order.providerId },
        })

        if (provider) {
          const manager = getProviderBySlug(provider.slug)
          if (manager) {
            const result = await manager.cancelOrder(order.externalOrderId)
            refundSuccessful = result.success
          }
        }
      } catch (error) {
        console.error("Provider cancel error:", error)
      }
    }

    const refundAmount = order.paymentStatus === PaymentStatus.PAID ? Number(order.totalRevenue) : 0

    await prisma.user.update({
      where: { id: order.userId },
      data: {
        balance: { increment: refundAmount },
      },
    })

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        isCancelled: true,
        cancellationReason: "User requested cancellation",
        cancelledAt: new Date(),
        paymentStatus: refundAmount > 0 ? PaymentStatus.REFUNDED : PaymentStatus.FAILED,
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
      providerRefundStatus: refundSuccessful ? "success" : "failed",
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

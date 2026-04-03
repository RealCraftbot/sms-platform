import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType, OrderStatus } from "@prisma/client"
import { getProviderBySlug } from "@/lib/providers"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

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

    if (order.user.email !== session.user.email && !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const item = order.items[0]
    if (!item || !order.externalOrderId || !order.providerId) {
      return NextResponse.json(order)
    }

    try {
      const provider = await prisma.provider.findUnique({
        where: { id: order.providerId },
      })

      if (!provider) {
        return NextResponse.json(order)
      }

      const manager = getProviderBySlug(provider.slug)

      if (order.pricingRule?.providerProduct && manager) {
        if (order.pricingRule?.type === ServiceType.SMS_NUMBER) {
          const smsResult = await manager.checkOrderStatus(order.externalOrderId)
          
          if (smsResult?.success) {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                smsCode: smsResult.status,
                smsText: smsResult.message || undefined,
                smsReceivedAt: new Date(),
                status: "completed",
              },
            })

            await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
            })
          }
        }

        if (order.pricingRule?.type === ServiceType.SOCIAL_BOOST) {
          const boostStatus = await manager.checkOrderStatus(order.externalOrderId)
          
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              boostStatus: boostStatus.status,
            },
          })

          if (boostStatus.status === "completed") {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
            })
          }
        }
      }
    } catch (error) {
      console.error("Check order status error:", error)
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        pricingRule: true,
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Check order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

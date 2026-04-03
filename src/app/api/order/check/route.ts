import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createSupplierManager } from "@/lib/suppliers"
import { ServiceType } from "@prisma/client"

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

    if (order.user.email !== session.user.email && !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const item = order.items[0]
    if (!item || !order.externalOrderId || !order.supplierId) {
      return NextResponse.json(order)
    }

    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id: order.supplierId },
      })

      if (!supplier) {
        return NextResponse.json(order)
      }

      const manager = createSupplierManager(supplier)

      if (order.pricingRule?.supplierProduct) {
        if (order.pricingRule?.type === ServiceType.SMS_NUMBER) {
          const smsResult = await manager.checkSms(order.externalOrderId)
          
          if (smsResult?.success) {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                smsCode: smsResult.code,
                smsText: smsResult.text,
                smsReceivedAt: new Date(),
                status: "completed",
              },
            })

            await prisma.order.update({
              where: { id: orderId },
              data: { status: "completed", completedAt: new Date() },
            })
          }
        }

        if (order.pricingRule?.type === ServiceType.SOCIAL_BOOST) {
          const boostStatus = await manager.checkStatus(order.externalOrderId)
          
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              boostStatus: boostStatus.status,
              boostProgress: boostStatus.progress,
            },
          })

          if (boostStatus.status === "completed") {
            await prisma.order.update({
              where: { id: orderId },
              data: { status: "completed", completedAt: new Date() },
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

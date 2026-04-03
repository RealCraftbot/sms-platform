import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType, OrderStatus, PaymentStatus } from "@prisma/client"
import { getBestSupplier } from "@/lib/suppliers"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, reference } = body

    if (!orderId || !reference) {
      return NextResponse.json(
        { error: "Order ID and reference are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, pricingRule: true },
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === OrderStatus.APPROVED || order.status === OrderStatus.PROCESSING) {
      return NextResponse.json({ message: "Order already paid" })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.APPROVED,
        paidAt: new Date(),
        paymentStatus: PaymentStatus.PAID,
      }
    })

    if (order.type === ServiceType.SMS_NUMBER) {
      await processSMSOrder(order.id)
    } else if (order.type === ServiceType.SOCIAL_LOG) {
      await processLogOrder(order.id)
    } else if (order.type === ServiceType.SOCIAL_BOOST) {
      await processBoostOrder(order.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Paystack verify error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function processSMSOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, pricingRule: true },
  })

  if (!order || order.items.length === 0) return

  const item = order.items[0]
  const provider = await getBestSupplier("SMS")

  if (!provider) {
    console.error("No SMS provider available")
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PENDING },
    })
    return
  }

  const service = order.pricingRule?.service || "whatsapp"
  const country = order.pricingRule?.country || "ng"

  const orderResult = await provider.placeOrder(service, 1, { country })

  if (orderResult.success && orderResult.phoneNumber) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        phoneNumber: orderResult.phoneNumber,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
        status: "pending",
      }
    })

    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
    })

    const providerRecord = await prisma.provider.findFirst({ where: { name: provider.name } })
    if (providerRecord) {
      await prisma.providerLog.create({
        data: {
          providerId: providerRecord.id,
          action: "ORDER_PLACED",
          request: { service, country },
          response: { orderId: orderResult.externalOrderId, phone: orderResult.phoneNumber },
          success: true,
        }
      })
    }
  } else {
    console.error("SMS order failed:", orderResult.message)
    const providerRecord = await prisma.provider.findFirst({ where: { name: provider.name } })
    if (providerRecord) {
      await prisma.providerLog.create({
        data: {
          providerId: providerRecord.id,
          action: "ORDER_PLACED",
          request: { service, country },
          response: { error: orderResult.message },
          success: false,
          errorMessage: orderResult.message,
        }
      })
    }
  }
}

async function processLogOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order || order.items.length === 0) return

  for (const item of order.items) {
    if (item.accountId) {
      await prisma.socialLog.updateMany({
        where: { id: item.accountId },
        data: {
          status: "sold",
          soldToId: order.userId,
          soldAt: new Date(),
        }
      })
    }
  }

  await prisma.orderItem.updateMany({
    where: { orderId },
    data: {
      status: "delivered",
      deliveredAt: new Date(),
    }
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.COMPLETED },
  })
}

async function processBoostOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, pricingRule: true },
  })

  if (!order || order.items.length === 0) return

  const item = order.items[0]
  const provider = await getBestSupplier("BOOSTING")

  if (!provider) {
    console.error("No Boosting provider available")
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PENDING },
    })
    return
  }

  const service = order.pricingRule?.service || "followers"
  const link = item.targetUrl || ""

  const orderResult = await provider.placeOrder(service, order.quantity || 100, { link })

  if (orderResult.success) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        boostStatus: "processing",
        boostStartedAt: new Date(),
      }
    })

    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PROCESSING },
    })

    const providerRecord = await prisma.provider.findFirst({ where: { name: provider.name } })
    if (providerRecord) {
      await prisma.providerLog.create({
        data: {
          providerId: providerRecord.id,
          action: "ORDER_PLACED",
          request: { service, link, quantity: order.quantity },
          response: { orderId: orderResult.externalOrderId },
          success: true,
        }
      })
    }
  } else {
    console.error("Boost order failed:", orderResult.message)
    const providerRecord = await prisma.provider.findFirst({ where: { name: provider.name } })
    if (providerRecord) {
      await prisma.providerLog.create({
        data: {
          providerId: providerRecord.id,
          action: "ORDER_PLACED",
          request: { service, link, quantity: order.quantity },
          response: { error: orderResult.message },
          success: false,
          errorMessage: orderResult.message,
        }
      })
    }
  }
}

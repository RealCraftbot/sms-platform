import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@prisma/client"

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
      include: { transaction: true },
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status === "paid" || order.status === "approved") {
      return NextResponse.json({ message: "Order already paid" })
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        paidAt: new Date(),
        paymentStatus: "paid",
        transaction: {
          update: {
            status: "success",
            providerTxId: reference,
          }
        }
      }
    })

    if (order.type === ServiceType.SMS_NUMBER) {
      await processSMSOrder(order.id)
    } else if (order.type === ServiceType.SOCIAL_LOG) {
      await processLogOrder(order.id)
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
    include: { items: true },
  })

  if (!order || order.items.length === 0) return

  const phoneNumber = "+234" + Math.floor(Math.random() * 900000000 + 100000000)
  
  await prisma.orderItem.update({
    where: { id: order.items[0].id },
    data: {
      phoneNumber,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      status: "delivered",
    }
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "processing" },
  })
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
    data: { status: "completed" },
  })
}

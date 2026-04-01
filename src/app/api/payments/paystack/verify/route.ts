import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        transaction: {
          update: {
            status: "success",
            providerTxId: reference,
          }
        }
      }
    })

    if (order.type === "sms") {
      await processSMSOrder(order.id)
    } else if (order.type === "log") {
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
    include: { smsOrder: true },
  })

  if (!order || !order.smsOrder) return

  // In production, you would call SMSPool API here to get a number
  // For now, we'll simulate it
  const phoneNumber = "+234" + Math.floor(Math.random() * 900000000 + 100000000)
  
  await prisma.sMSOrder.update({
    where: { orderId },
    data: {
      phoneNumber,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    }
  })
}

async function processLogOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { logOrder: true },
  })

  if (!order || !order.logOrder) return

  const logIds = order.logOrder.items as string[]
  
  await prisma.socialLog.updateMany({
    where: { id: { in: logIds } },
    data: {
      status: "sold",
      soldToId: order.userId,
      soldAt: new Date(),
    }
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "completed" },
  })
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSMSPool } from "@/lib/smspool"

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        type: "sms",
      },
      include: {
        smsOrder: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const smsOrder = order.smsOrder
    if (!smsOrder || !smsOrder.supplierOrderId) {
      return NextResponse.json({ error: "No supplier order ID" }, { status: 400 })
    }

    try {
      const smspool = getSMSPool()
      const result = await smspool.getSms(smsOrder.supplierOrderId)

      if (result.success && result.sms) {
        await prisma.sMSOrder.update({
          where: { orderId: order.id },
          data: {
            smsText: result.sms,
            smsCode: result.code,
          },
        })

        return NextResponse.json({
          success: true,
          sms: result.sms,
          code: result.code,
        })
      }

      return NextResponse.json({
        success: false,
        message: result.message || "No SMS received yet",
      })
    } catch (error) {
      console.error("Error checking SMS:", error)
      return NextResponse.json({ error: "Failed to check SMS" }, { status: 500 })
    }
  } catch (error) {
    console.error("Check SMS error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
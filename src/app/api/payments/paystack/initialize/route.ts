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
    const { orderId, amount } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: "Order ID and amount are required" },
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
      include: { user: true },
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const reference = `TX-${Date.now()}-${Math.random().toString(36).substring(7)}`

    await prisma.transaction.create({
      data: {
        orderId: order.id,
        userId: user.id,
        provider: "paystack",
        reference,
        amount: order.totalRevenue,
        status: "pending",
      },
    })

    return NextResponse.json({
      authorizationUrl: `https://checkout.paystack.com/${reference}`,
      reference: reference,
      amount: Number(order.totalRevenue),
      email: user.email,
    })
  } catch (error) {
    console.error("Paystack initialize error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

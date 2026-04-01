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
    const { logIds, paymentMethodId } = body

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json(
        { error: "Log IDs are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const logs = await prisma.socialLog.findMany({
      where: {
        id: { in: logIds },
        status: "available",
      },
    })

    if (logs.length !== logIds.length) {
      return NextResponse.json(
        { error: "Some logs are no longer available" },
        { status: 400 }
      )
    }

    const totalAmount = logs.reduce((sum, log) => sum + Number(log.price), 0)

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId }
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
    }

    let orderStatus: string
    if (paymentMethod.type === "auto") {
      orderStatus = "pending"
    } else {
      orderStatus = "awaiting_approval"
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        paymentMethodId,
        type: "log",
        status: orderStatus,
        amount: totalAmount,
        currency: "NGN",
        logOrder: {
          create: {
            items: logIds,
          }
        }
      },
      include: {
        logOrder: true,
        paymentMethod: true,
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Log order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
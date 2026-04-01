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
    const { service, country, paymentMethodId } = body

    if (!service || !country || !paymentMethodId) {
      return NextResponse.json(
        { error: "Service, country and payment method are required" },
        { status: 400 }
      )
    }

    const pricingRule = await prisma.pricingRule.findUnique({
      where: {
        service_country: {
          service,
          country,
        },
      },
    })

    if (!pricingRule) {
      return NextResponse.json(
        { error: "Pricing not available for this service/country" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { orders: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

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
        type: "sms",
        status: orderStatus,
        amount: pricingRule.finalPrice,
        currency: "NGN",
        smsOrder: {
          create: {
            service,
            country,
          }
        }
      },
      include: {
        smsOrder: true,
        paymentMethod: true,
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("SMS order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        type: "sms",
      },
      include: {
        smsOrder: true,
        paymentMethod: true,
        transaction: true,
        manualPayment: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get SMS orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
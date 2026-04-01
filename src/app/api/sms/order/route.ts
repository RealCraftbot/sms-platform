import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSupplier, Supplier } from "@/lib/sms-supplier"

async function getActiveSupplier(): Promise<Supplier> {
  const setting = await prisma.setting.findUnique({
    where: { key: "smsSupplier" },
  })
  return (setting?.value as Supplier) || "smspool"
}

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

    const orderAmount = pricingRule.finalPrice

    if (paymentMethod.type === "wallet") {
      if (user.balance.lt(orderAmount)) {
        return NextResponse.json(
          { error: `Insufficient funds. Your balance: ₦${user.balance}, Required: ₦${orderAmount}` },
          { status: 400 }
        )
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { decrement: orderAmount },
        },
      })

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          paymentMethodId,
          type: "sms",
          status: "paid",
          amount: orderAmount,
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

      const smsOrder = order.smsOrder
      if (smsOrder) {
        try {
          const supplierType = await getActiveSupplier()
          const supplier = getSupplier(supplierType)
          const result = await supplier.buyNumber(smsOrder.service, smsOrder.country)

          if (result.success && result.phoneNumber && result.orderId) {
            await prisma.sMSOrder.update({
              where: { orderId: order.id },
              data: {
                phoneNumber: result.phoneNumber,
                supplierOrderId: result.orderId,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
              }
            })
          } else {
            console.error("SMS supplier failed:", result.message)
            await prisma.order.update({
              where: { id: order.id },
              data: { status: "failed" },
            })
          }
        } catch (error) {
          console.error("Error fetching phone from supplier:", error)
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "failed" },
          })
        }
      }

      return NextResponse.json({
        ...order,
        remainingBalance: updatedUser.balance,
      })
    }

    if (paymentMethod.type === "auto") {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          paymentMethodId,
          type: "sms",
          status: "pending",
          amount: orderAmount,
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
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        paymentMethodId,
        type: "sms",
        status: "awaiting_approval",
        amount: orderAmount,
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
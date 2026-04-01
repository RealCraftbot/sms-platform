import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAcctShop } from "@/lib/acctshop"
import { getTutAds } from "@/lib/tutads"

export type SocialSupplier = "acctshop" | "tutads"

async function getActiveSocialSupplier(): Promise<SocialSupplier> {
  const setting = await prisma.setting.findUnique({
    where: { key: "socialSupplier" },
  })
  return (setting?.value as SocialSupplier) || "acctshop"
}

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

    if (paymentMethod.type === "wallet") {
      if (user.balance.lt(totalAmount)) {
        return NextResponse.json(
          { error: `Insufficient funds. Your balance: ₦${user.balance}, Required: ₦${totalAmount}` },
          { status: 400 }
        )
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalAmount } },
      })

      const logIdsList = logs.map(l => l.id)
      await prisma.socialLog.updateMany({
        where: { id: { in: logIdsList } },
        data: {
          status: "sold",
          soldToId: user.id,
          soldAt: new Date(),
        }
      })

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          paymentMethodId,
          type: "log",
          status: "completed",
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
    }

    const orderStatus = paymentMethod.type === "auto" ? "pending" : "awaiting_approval"

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
        type: "log",
      },
      include: {
        logOrder: true,
        paymentMethod: true,
        transaction: true,
        manualPayment: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get log orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
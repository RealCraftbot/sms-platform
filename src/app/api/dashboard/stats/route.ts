import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const totalOrders = await prisma.order.count({
      where: { userId: user.id },
    })

    const smsOrders = await prisma.order.count({
      where: { userId: user.id, type: "sms" },
    })

    const logOrders = await prisma.order.count({
      where: { userId: user.id, type: "log" },
    })

    const pendingOrders = await prisma.order.count({
      where: { userId: user.id, status: "awaiting_approval" },
    })

    const completedOrders = await prisma.order.count({
      where: { userId: user.id, status: "completed" },
    })

    const recentOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        smsOrder: true,
        logOrder: true,
        paymentMethod: true,
      },
    })

    const pricingRules = await prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { service: "asc" },
    })

    const servicesMap = new Map<string, { name: string; count: number }>()
    pricingRules.forEach(rule => {
      const current = servicesMap.get(rule.service)
      if (current) {
        servicesMap.set(rule.service, { name: rule.service, count: current.count + 1 })
      } else {
        servicesMap.set(rule.service, { name: rule.service, count: 1 })
      }
    })

    const services = Array.from(servicesMap.values()).slice(0, 5)

    return NextResponse.json({
      balance: user.balance.toString(),
      totalOrders,
      smsOrders,
      logOrders,
      pendingOrders,
      completedOrders,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        type: order.type,
        amount: order.amount.toString(),
        status: order.status,
        createdAt: order.createdAt,
        serviceName: order.smsOrder?.service || null,
        country: order.smsOrder?.country || null,
      })),
      services,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
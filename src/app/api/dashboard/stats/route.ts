import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@prisma/client"

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
      where: { userId: user.id, type: ServiceType.SMS_NUMBER },
    })

    const logOrders = await prisma.order.count({
      where: { userId: user.id, type: ServiceType.SOCIAL_LOG },
    })

    const boostOrders = await prisma.order.count({
      where: { userId: user.id, type: ServiceType.SOCIAL_BOOST },
    })

    const pendingOrders = await prisma.order.count({
      where: { userId: user.id, status: "PENDING" },
    })

    const completedOrders = await prisma.order.count({
      where: { userId: user.id, status: "COMPLETED" },
    })

    const recentOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: true,
        pricingRule: true,
        paymentMethodRel: true,
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
        servicesMap.set(rule.service, { name: rule.displayName, count: current.count + 1 })
      } else {
        servicesMap.set(rule.service, { name: rule.displayName, count: 1 })
      }
    })

    const services = Array.from(servicesMap.values()).slice(0, 5)

    return NextResponse.json({
      balance: user.balance.toString(),
      totalOrders,
      smsOrders,
      logOrders,
      boostOrders,
      pendingOrders,
      completedOrders,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        type: order.type,
        amount: order.totalRevenue.toString(),
        status: order.status,
        createdAt: order.createdAt,
        serviceName: order.pricingRule?.displayName || null,
        phoneNumber: order.items[0]?.phoneNumber || null,
      })),
      services,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@prisma/client"
import { createSupplierManager } from "@/lib/suppliers"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as ServiceType | null

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const where: Prisma.OrderWhereInput = {
      userId: user.id,
    }

    if (type) {
      where.type = type
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        pricingRule: true,
        paymentMethodRel: true,
        transaction: true,
        manualPayment: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const serialized = orders.map(order => ({
      id: order.id,
      type: order.type,
      status: order.status,
      totalAmount: order.totalRevenue?.toString() || order.unitSellingPrice?.toString() || "0",
      currency: "NGN",
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.paymentMethod || order.paymentMethodRel?.name || "Unknown",
      service: order.pricingRule?.service || order.pricingRule?.displayName || "Unknown",
      country: order.pricingRule?.country || "",
      platform: order.pricingRule?.platform || "",
      subService: order.pricingRule?.subService || "",
      displayName: order.pricingRule?.displayName || "",
      items: order.items.map(item => ({
        id: item.id,
        phoneNumber: item.phoneNumber,
        smsCode: item.smsCode,
        smsText: item.smsText,
        status: item.status,
        deliveredAt: item.deliveredAt?.toISOString(),
        boostQuantity: item.boostQuantity,
        deliveredQuantity: item.deliveredAt ? item.boostQuantity : 0,
      })),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      pricingRuleId,
      serviceType,
      service,
      country,
      quantity = 1,
      paymentMethod,
      targetUrl,
      options,
    } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let pricingRule = null

    if (pricingRuleId) {
      pricingRule = await prisma.pricingRule.findUnique({
        where: { id: pricingRuleId },
        include: {
          supplierProduct: {
            include: { supplier: true },
          },
        },
      })
    } else if (service && country && serviceType) {
      pricingRule = await prisma.pricingRule.findFirst({
        where: {
          type: serviceType as ServiceType,
          service: service,
          country: country,
          isActive: true,
        },
        include: {
          supplierProduct: {
            include: { supplier: true },
          },
        },
      })
    }

    if (!pricingRule || !pricingRule.isActive) {
      return NextResponse.json(
        { error: "Pricing not available for this service" },
        { status: 400 }
      )
    }

    let paymentMethodRecord = null
    if (paymentMethod) {
      paymentMethodRecord = await prisma.paymentMethod.findFirst({
        where: {
          OR: [
            { id: paymentMethod },
            { name: { equals: paymentMethod, mode: "insensitive" } },
          ],
        },
      })
    }

    if (!paymentMethodRecord) {
      paymentMethodRecord = await prisma.paymentMethod.findFirst({
        where: { isActive: true },
      })
    }

    if (!paymentMethodRecord) {
      return NextResponse.json({ error: "No payment method available" }, { status: 400 })
    }

    const totalRevenue = Number(pricingRule.sellingPriceNGN) * quantity
    const totalCost = Number(pricingRule.costPrice) * quantity
    const profit = Number(pricingRule.profitPerUnit) * quantity

    if (paymentMethodRecord.type === "wallet") {
      if (user.balance.lt(totalRevenue)) {
        return NextResponse.json(
          { error: `Insufficient funds. Balance: ₦${user.balance}, Required: ₦${totalRevenue}` },
          { status: 400 }
        )
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalRevenue } },
      })

      let supplierId: string | undefined
      let supplierName: string | undefined
      let externalOrderId: string | undefined
      let purchaseResult: { success: boolean; externalOrderId?: string; phoneNumber?: string; accounts?: unknown[]; boostStatus?: string; message?: string } | undefined

      if (pricingRule.supplierProduct?.supplier) {
        supplierId = pricingRule.supplierProduct.supplier.id
        supplierName = pricingRule.supplierProduct.supplier.name

        try {
          const manager = createSupplierManager(pricingRule.supplierProduct.supplier)
          purchaseResult = await manager.purchase(
            `${pricingRule.supplierProduct.supplier.name}-${pricingRule.supplierProduct.externalId}`,
            quantity,
            { targetUrl, ...options }
          )

          if (purchaseResult.success) {
            externalOrderId = purchaseResult.externalOrderId
          } else {
            console.error("Supplier purchase failed:", purchaseResult.message)
          }
        } catch (error) {
          console.error("Supplier error:", error)
        }
      }

      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = []

      if (pricingRule.type === ServiceType.SMS_NUMBER) {
        orderItemsData.push({
          phoneNumber: purchaseResult?.phoneNumber,
          expiresAt: new Date(Date.now() + 20 * 60 * 1000),
          status: purchaseResult?.phoneNumber ? "delivered" : "pending",
        })
      } else if (pricingRule.type === ServiceType.SOCIAL_LOG && purchaseResult?.accounts) {
        for (const acc of purchaseResult.accounts) {
          const accData = acc as { id?: string; email?: string; password?: string; cookies?: string }
          orderItemsData.push({
            accountId: accData.id,
            accountEmail: accData.email,
            accountPassword: accData.password,
            accountCookies: accData.cookies,
            status: "delivered",
            deliveredAt: new Date(),
          })
        }
      } else if (pricingRule.type === ServiceType.SOCIAL_BOOST) {
        orderItemsData.push({
          targetUrl: targetUrl,
          targetUsername: options?.username,
          boostType: pricingRule.subService || pricingRule.service,
          boostQuantity: quantity,
          boostStatus: purchaseResult?.boostStatus || "pending",
          boostStartedAt: new Date(),
        })
      }

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          pricingRuleId: pricingRule.id,
          paymentMethodId: paymentMethodRecord.id,
          paymentMethod: paymentMethodRecord.name,
          paymentStatus: "paid",
          type: pricingRule.type,
          status: "processing",
          quantity,
          unitCostPrice: pricingRule.costPrice,
          unitSellingPrice: pricingRule.sellingPriceNGN,
          totalCost,
          totalRevenue,
          profit,
          supplierId,
          supplierName,
          externalOrderId,
          paidAt: new Date(),
          canCancelUntil: pricingRule.type === ServiceType.SMS_NUMBER
            ? new Date(Date.now() + 5 * 60 * 1000)
            : undefined,
          items: orderItemsData.length > 0 ? { create: orderItemsData } : undefined,
        },
        include: {
          items: true,
          pricingRule: true,
        },
      })

      return NextResponse.json({
        id: order.id,
        status: order.status,
        totalAmount: order.totalRevenue.toString(),
        remainingBalance: Number(user.balance) - totalRevenue,
      })
    }

    if (paymentMethodRecord.type === "manual") {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          pricingRuleId: pricingRule.id,
          paymentMethodId: paymentMethodRecord.id,
          paymentMethod: paymentMethodRecord.name,
          paymentStatus: "pending",
          type: pricingRule.type,
          status: "pending",
          quantity,
          unitCostPrice: pricingRule.costPrice,
          unitSellingPrice: pricingRule.sellingPriceNGN,
          totalCost,
          totalRevenue,
          profit,
          canCancelUntil: pricingRule.type === ServiceType.SMS_NUMBER
            ? new Date(Date.now() + 5 * 60 * 1000)
            : undefined,
        },
        include: {
          pricingRule: true,
          paymentMethodRel: true,
        },
      })

      return NextResponse.json({
        id: order.id,
        status: order.status,
        totalAmount: order.totalRevenue.toString(),
        message: "Order created. Please upload payment proof.",
      })
    }

    return NextResponse.json({ error: "Payment method not supported" }, { status: 400 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

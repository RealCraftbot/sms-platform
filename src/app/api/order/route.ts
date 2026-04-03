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

    return NextResponse.json(orders)
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
      quantity = 1,
      paymentMethodId,
      targetUrl,
      options,
    } = body

    if (!pricingRuleId || !paymentMethodId) {
      return NextResponse.json(
        { error: "Pricing rule and payment method are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const pricingRule = await prisma.pricingRule.findUnique({
      where: { id: pricingRuleId },
      include: {
        supplierProduct: {
          include: { supplier: true },
        },
      },
    })

    if (!pricingRule || !pricingRule.isActive) {
      return NextResponse.json(
        { error: "Pricing not available" },
        { status: 400 }
      )
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
    }

    const totalRevenue = Number(pricingRule.sellingPriceNGN) * quantity
    const totalCost = Number(pricingRule.costPrice) * quantity
    const profit = Number(pricingRule.profitPerUnit) * quantity

    if (paymentMethod.type === "wallet") {
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
          pricingRuleId,
          paymentMethodId,
          paymentMethod: paymentMethod.name,
          paymentStatus: "paid",
          type: pricingRule.type,
          status: externalOrderId ? "processing" : "completed",
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
        ...order,
        remainingBalance: Number(user.balance) - totalRevenue,
      })
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        pricingRuleId,
        paymentMethodId,
        paymentMethod: paymentMethod.name,
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

    return NextResponse.json(order)
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

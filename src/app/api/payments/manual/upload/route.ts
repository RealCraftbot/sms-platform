import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { proofUrl, notes, amount } = body

    if (!proofUrl || !amount) {
      return NextResponse.json(
        { error: "Proof URL and amount are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { type: "manual" },
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: "Manual payment method not configured" }, { status: 500 })
    }

    const walletPaymentMethod = await prisma.paymentMethod.findFirst({
      where: { type: "wallet" },
    })

    const depositRule = await prisma.pricingRule.findFirst({
      where: { type: ServiceType.SMS_NUMBER, service: "deposit" },
    })

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        paymentMethodId: paymentMethod.id,
        paymentMethod: "Manual Transfer",
        pricingRuleId: depositRule?.id,
        type: ServiceType.SMS_NUMBER,
        status: "awaiting_approval",
        unitSellingPrice: amount,
        totalRevenue: amount,
        quantity: 1,
        unitCostPrice: 0,
        totalCost: 0,
        profit: 0,
        manualPayment: {
          create: {
            userId: user.id,
            proofUrl,
            notes,
            status: "pending_review",
          },
        },
      },
      include: {
        manualPayment: true,
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Payment submitted for approval",
    })
  } catch (error) {
    console.error("Manual payment upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

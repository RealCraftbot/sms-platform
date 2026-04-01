import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      const reference = event.data.reference
      const amount = event.data.amount / 100

      const transaction = await prisma.transaction.findFirst({
        where: { reference },
        include: { order: true },
      })

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "success", providerTxId: event.data.id.toString() },
        })

        const order = await prisma.order.findUnique({
          where: { id: transaction.orderId },
        })

        if (!order) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "completed" },
        })

        if (order.type === "deposit") {
          await prisma.user.update({
            where: { id: order.userId },
            data: { balance: { increment: order.amount } },
          })
          console.log(`Added ₦${order.amount} to user wallet`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
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
      const amount = event.data.amount / 100 // Paystack sends in kobo

      const transaction = await prisma.transaction.findFirst({
        where: { reference },
        include: { order: true },
      })

      if (transaction) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "success", providerTxId: event.data.id.toString() },
        })

        const order = await prisma.order.update({
          where: { id: transaction.orderId },
          data: { status: "paid" },
        })

        // Process the order based on type
        if (order.type === "sms") {
          const phoneNumber = "+234" + Math.floor(Math.random() * 900000000 + 100000000)
          await prisma.sMSOrder.update({
            where: { orderId: order.id },
            data: {
              phoneNumber,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            }
          })
        } else if (order.type === "log") {
          const logOrder = await prisma.logOrder.findUnique({
            where: { orderId: order.id },
          })
          if (logOrder) {
            const logIds = logOrder.items as string[]
            await prisma.socialLog.updateMany({
              where: { id: { in: logIds } },
              data: {
                status: "sold",
                soldToId: order.userId,
                soldAt: new Date(),
              }
            })
            await prisma.order.update({
              where: { id: order.id },
              data: { status: "completed" },
            })
          }
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
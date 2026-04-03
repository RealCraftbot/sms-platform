import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import crypto from "crypto"

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ""

function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex")
  return hash === signature
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature || !verifyPaystackSignature(body, signature)) {
      console.error("Invalid Paystack signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const eventType = event.event

    console.log(`[Paystack Webhook] Received event: ${eventType}`)

    if (eventType === "charge.success") {
      const data = event.data
      const reference = data.reference
      const amount = data.amount / 100

      const transaction = await prisma.transaction.findFirst({
        where: { reference },
        include: { order: true },
      })

      if (!transaction) {
        console.error(`[Paystack Webhook] Transaction not found: ${reference}`)
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }

      if (transaction.status === "success") {
        console.log(`[Paystack Webhook] Transaction already processed: ${reference}`)
        return NextResponse.json({ received: true })
      }

      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "success",
            providerTxId: data.id?.toString(),
          },
        })

        await tx.order.update({
          where: { id: transaction.orderId },
          data: {
            status: OrderStatus.APPROVED,
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        })
      })

      console.log(`[Paystack Webhook] Successfully processed payment: ${reference}`)
    }

    if (eventType === "charge.failed") {
      const data = event.data
      const reference = data.reference

      const transaction = await prisma.transaction.findFirst({
        where: { reference },
        include: { order: true },
      })

      if (transaction) {
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "failed",
            },
          })

          await tx.order.update({
            where: { id: transaction.orderId },
            data: {
              status: OrderStatus.FAILED,
              paymentStatus: PaymentStatus.FAILED,
            },
          })
        })

        console.log(`[Paystack Webhook] Payment failed: ${reference}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Paystack Webhook] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

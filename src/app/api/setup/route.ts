import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    
    // Create payment methods using Prisma client (safer than raw SQL)
    const existingMethods = await prisma.paymentMethod.findMany()
    
    if (existingMethods.length === 0) {
      await prisma.paymentMethod.createMany({
        data: [
          { id: "wallet", name: "Wallet", type: "wallet", isActive: true },
          { id: "paystack", name: "Paystack", type: "auto", isActive: true },
          { id: "manual", name: "Manual Transfer", type: "manual", isActive: true },
        ],
        skipDuplicates: true,
      })
    }
    
    return NextResponse.json({ 
      status: "success", 
      message: "Payment methods initialized",
      paymentMethods: await prisma.paymentMethod.findMany()
    })
  } catch (error: unknown) {
    console.error("Setup error:", error)
    const err = error as Error
    return NextResponse.json({ 
      status: "error", 
      error: err?.message || "Unknown error" 
    }, { status: 500 })
  }
}
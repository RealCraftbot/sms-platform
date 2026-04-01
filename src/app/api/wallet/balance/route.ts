import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ balance: 0 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ balance: 0 })
    }

    return NextResponse.json({ balance: user.balance.toString() })
  } catch (error) {
    console.error("Get balance error:", error)
    return NextResponse.json({ balance: 0 })
  }
}
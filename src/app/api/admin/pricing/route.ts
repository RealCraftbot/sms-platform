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

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!adminUser || adminUser.email !== "admin@smsreseller.com") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const rules = await prisma.pricingRule.findMany({
      orderBy: { service: "asc" },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Get pricing rules error:", error)
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

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!adminUser || adminUser.email !== "admin@smsreseller.com") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const body = await request.json()
    const { service, country, basePrice, markupType, markupValue } = body

    if (!service || !country || !basePrice || !markupType || !markupValue) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    let finalPrice: number
    if (markupType === "percentage") {
      finalPrice = Number(basePrice) * (1 + Number(markupValue) / 100)
    } else {
      finalPrice = Number(basePrice) + Number(markupValue)
    }

    const rule = await prisma.pricingRule.upsert({
      where: {
        service_country: {
          service,
          country,
        },
      },
      update: {
        basePrice,
        markupType,
        markupValue,
        finalPrice,
      },
      create: {
        service,
        country,
        basePrice,
        markupType,
        markupValue,
        finalPrice,
      },
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Create pricing rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
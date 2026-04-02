import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

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
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

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
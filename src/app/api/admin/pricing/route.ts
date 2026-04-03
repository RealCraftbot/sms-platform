import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"
import { ServiceType } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as ServiceType | null

    const where = type ? { type } : {}

    const rules = await prisma.pricingRule.findMany({
      where,
      include: {
        providerProduct: {
          include: { provider: true },
        },
        provider: true,
      },
      orderBy: [{ type: "asc" }, { service: "asc" }],
    })

    const serialized = rules.map(rule => ({
      ...rule,
      actualCost: rule.actualCost.toNumber(),
      sellingPriceNGN: rule.sellingPriceNGN.toNumber(),
      markupPercentage: rule.markupPercentage.toNumber(),
      profitPerUnit: rule.profitPerUnit.toNumber(),
      profitMargin: rule.profitMargin.toNumber(),
      minPriceNGN: rule.minPriceNGN?.toNumber() ?? null,
      maxPriceNGN: rule.maxPriceNGN?.toNumber() ?? null,
    }))

    return NextResponse.json(serialized)
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
    const {
      type,
      service,
      country,
      platform,
      subService,
      displayName,
      actualCost,
      sellingPriceNGN,
      stockQuantity,
      providerProductId,
      providerId,
    } = body

    if (!type || !service || !displayName || actualCost === undefined || sellingPriceNGN === undefined) {
      return NextResponse.json(
        { error: "Type, service, displayName, actualCost, and sellingPriceNGN are required" },
        { status: 400 }
      )
    }

    const profit = Number(sellingPriceNGN) - (Number(actualCost) * 1500)
    const margin = (profit / Number(sellingPriceNGN)) * 100
    const markupPct = margin

    const rule = await prisma.pricingRule.create({
      data: {
        type,
        service,
        country,
        platform,
        subService,
        displayName,
        description: body.description,
        actualCost,
        actualCurrency: "USD",
        sellingPriceNGN,
        markupPercentage: markupPct,
        profitPerUnit: profit,
        profitMargin: margin,
        stockQuantity: stockQuantity ?? 0,
        providerProductId,
        providerId,
        isActive: true,
        showStock: body.showStock ?? true,
      },
    })

    return NextResponse.json({
      ...rule,
      actualCost: rule.actualCost.toNumber(),
      sellingPriceNGN: rule.sellingPriceNGN.toNumber(),
      markupPercentage: rule.markupPercentage.toNumber(),
      profitPerUnit: rule.profitPerUnit.toNumber(),
      profitMargin: rule.profitMargin.toNumber(),
    })
  } catch (error) {
    console.error("Create pricing rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const body = await request.json()
    const {
      id,
      sellingPriceNGN,
      actualCost,
      isActive,
      stockQuantity,
      showStock,
    } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const existing = await prisma.pricingRule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    const newSellingPrice = sellingPriceNGN ?? Number(existing.sellingPriceNGN)
    const newCost = actualCost ?? Number(existing.actualCost)
    const profit = newSellingPrice - (newCost * 1500)
    const margin = (profit / newSellingPrice) * 100
    const markupPct = margin

    const rule = await prisma.pricingRule.update({
      where: { id },
      data: {
        sellingPriceNGN,
        actualCost,
        markupPercentage: markupPct,
        profitPerUnit: profit,
        profitMargin: margin,
        isActive,
        stockQuantity,
        showStock,
      },
    })

    return NextResponse.json({
      ...rule,
      actualCost: rule.actualCost.toNumber(),
      sellingPriceNGN: rule.sellingPriceNGN.toNumber(),
      markupPercentage: rule.markupPercentage.toNumber(),
      profitPerUnit: rule.profitPerUnit.toNumber(),
      profitMargin: rule.profitMargin.toNumber(),
    })
  } catch (error) {
    console.error("Update pricing rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await prisma.pricingRule.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete pricing rule error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

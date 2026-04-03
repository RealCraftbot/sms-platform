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
        supplierProduct: {
          include: { supplier: true },
        },
      },
      orderBy: [{ type: "asc" }, { service: "asc" }],
    })

    const serialized = rules.map(rule => ({
      ...rule,
      costPrice: rule.costPrice.toNumber(),
      sellingPriceNGN: rule.sellingPriceNGN.toNumber(),
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
      costPrice,
      sellingPriceNGN,
      stockQuantity,
      supplierProductId,
    } = body

    if (!type || !service || !displayName || costPrice === undefined || sellingPriceNGN === undefined) {
      return NextResponse.json(
        { error: "Type, service, displayName, costPrice, and sellingPriceNGN are required" },
        { status: 400 }
      )
    }

    const profit = Number(sellingPriceNGN) - (Number(costPrice) * 1500)
    const margin = (profit / Number(sellingPriceNGN)) * 100

    const rule = await prisma.pricingRule.create({
      data: {
        type,
        service,
        country,
        platform,
        subService,
        displayName,
        description: body.description,
        costPrice,
        costCurrency: "USD",
        sellingPriceNGN,
        profitPerUnit: profit,
        profitMargin: margin,
        stockQuantity: stockQuantity ?? 0,
        supplierProductId,
        isActive: true,
        showStock: body.showStock ?? true,
      },
    })

    return NextResponse.json({
      ...rule,
      costPrice: rule.costPrice.toNumber(),
      sellingPriceNGN: rule.sellingPriceNGN.toNumber(),
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

    const profit = Number(sellingPriceNGN ?? existing.sellingPriceNGN) - (Number(existing.costPrice) * 1500)
    const margin = (profit / Number(sellingPriceNGN ?? existing.sellingPriceNGN)) * 100

    const rule = await prisma.pricingRule.update({
      where: { id },
      data: {
        sellingPriceNGN,
        profitPerUnit: profit,
        profitMargin: margin,
        isActive,
        stockQuantity,
        showStock,
      },
    })

    return NextResponse.json({
      ...rule,
      costPrice: rule.costPrice.toNumber(),
      sellingPriceNGN: rule.sellingPriceNGN.toNumber(),
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

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@prisma/client"
import { getProviderBySlug } from "@/lib/providers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as ServiceType | null
    const providerId = searchParams.get("providerId")

    const where: Record<string, unknown> = { isActive: true }
    if (type) where.type = type
    if (providerId) where.providerId = providerId

    const products = await prisma.providerProduct.findMany({
      where,
      include: {
        provider: true,
        pricingRules: {
          where: { isActive: true },
        },
      },
      orderBy: [{ provider: { priority: "asc" } }],
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get provider products error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { providerId, sync } = body

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const manager = getProviderBySlug(provider.slug)
    if (!manager) {
      return NextResponse.json({ error: "Provider not initialized" }, { status: 400 })
    }

    const products = await manager.getProducts()

    let synced = 0
    for (const product of products) {
      await prisma.providerProduct.upsert({
        where: {
          providerId_externalId: {
            providerId: provider.id,
            externalId: product.externalId,
          },
        },
        create: {
          providerId: provider.id,
          externalId: product.externalId,
          type: product.service as ServiceType,
          service: product.service,
          subService: product.subService,
          country: product.country,
          countryCode: product.countryCode,
          platform: product.platform,
          costPrice: product.cost,
          costCurrency: product.currency,
          stockAvailable: product.stock,
          isAvailable: product.stock > 0,
          minQuantity: product.minQuantity,
          maxQuantity: product.maxQuantity,
        },
        update: {
          costPrice: product.cost,
          stockAvailable: product.stock,
          isAvailable: product.stock > 0,
          lastUpdated: new Date(),
        },
      })
      synced++
    }

    return NextResponse.json({
      message: `Synced ${synced} products from ${provider.name}`,
      count: synced,
    })
  } catch (error) {
    console.error("Sync provider products error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

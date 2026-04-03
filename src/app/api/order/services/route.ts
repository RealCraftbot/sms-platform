import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma, ServiceType } from "@prisma/client"
import { createSupplierManager } from "@/lib/suppliers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as ServiceType | null
    const supplierId = searchParams.get("supplierId")

    const where: Record<string, unknown> = { isActive: true }
    if (type) where.type = type
    if (supplierId) where.supplierId = supplierId

    const products = await prisma.supplierProduct.findMany({
      where,
      include: {
        supplier: true,
        pricingRules: {
          where: { isActive: true },
        },
      },
      orderBy: [{ supplier: { priority: "asc" } }],
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get supplier products error:", error)
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
    const { supplierId, sync } = body

    if (!supplierId) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 })
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    })

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    const manager = createSupplierManager(supplier)
    const products = await manager.getProducts()

    let synced = 0
    for (const product of products) {
      await prisma.supplierProduct.upsert({
        where: {
          supplierId_externalId: {
            supplierId: supplier.id,
            externalId: product.externalId,
          },
        },
        create: {
          supplierId: supplier.id,
          externalId: product.externalId,
          type: product.type,
          service: product.service,
          subService: product.subService,
          country: product.country,
          platform: product.platform,
          costPrice: product.costPrice,
          costCurrency: product.costCurrency,
          stockQuantity: product.stockQuantity,
          isAvailable: product.isAvailable,
          minOrder: product.minOrder,
          maxOrder: product.maxOrder,
          metadata: (product.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
        update: {
          costPrice: product.costPrice,
          stockQuantity: product.stockQuantity,
          isAvailable: product.isAvailable,
          lastUpdated: new Date(),
        },
      })
      synced++
    }

    return NextResponse.json({
      message: `Synced ${synced} products from ${supplier.name}`,
      count: synced,
    })
  } catch (error) {
    console.error("Sync supplier products error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

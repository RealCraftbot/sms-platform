import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { priority: "asc" },
    })

    const products = await prisma.supplierProduct.findMany({
      where: { isAvailable: true },
      include: { supplier: true },
      orderBy: { supplier: { priority: "asc" } },
    })

    const pricingRules = await prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { service: "asc" },
    })

    const servicesMap = new Map<string, {
      id: string
      name: string
      countries: Map<string, {
        id: string
        name: string
        code: string
        price: number | null
        stock: number | null
      }>
    }>()

    const serviceNames: Record<string, string> = {
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      telegram: "Telegram",
      facebook: "Facebook",
      google: "Google",
      twitter: "Twitter",
      tiktok: "TikTok",
      discord: "Discord",
      snapchat: "Snapchat",
      linkedin: "LinkedIn",
    }

    const countryNames: Record<string, { name: string; code: string }> = {
      ng: { name: "Nigeria", code: "+234" },
      us: { name: "United States", code: "+1" },
      uk: { name: "United Kingdom", code: "+44" },
      ca: { name: "Canada", code: "+1" },
      gh: { name: "Ghana", code: "+233" },
      ke: { name: "Kenya", code: "+254" },
      za: { name: "South Africa", code: "+27" },
      in: { name: "India", code: "+91" },
    }

    for (const rule of pricingRules) {
      if (!servicesMap.has(rule.service)) {
        servicesMap.set(rule.service, {
          id: rule.service,
          name: serviceNames[rule.service] || rule.service,
          countries: new Map(),
        })
      }

      const service = servicesMap.get(rule.service)!
      if (rule.country) {
        service.countries.set(rule.country, {
          id: rule.country,
          name: countryNames[rule.country]?.name || rule.country,
          code: countryNames[rule.country]?.code || "",
          price: Number(rule.sellingPriceNGN),
          stock: rule.stockQuantity,
        })
      }
    }

    const services = Array.from(servicesMap.values()).map(service => ({
      id: service.id,
      name: service.name,
      countries: Array.from(service.countries.values()),
    }))

    return NextResponse.json({
      services,
      suppliers: suppliers.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        status: s.status,
        priority: s.priority,
      })),
      products: products.length,
    })
  } catch (error) {
    console.error("Supplier services error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

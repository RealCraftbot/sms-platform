import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSMSPool } from "@/lib/smspool"

const SERVICE_NAMES: Record<string, string> = {
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

const COUNTRY_NAMES: Record<string, { name: string; code: string }> = {
  ng: { name: "Nigeria", code: "+234" },
  us: { name: "United States", code: "+1" },
  uk: { name: "United Kingdom", code: "+44" },
  ca: { name: "Canada", code: "+1" },
  gh: { name: "Ghana", code: "+233" },
  ke: { name: "Kenya", code: "+254" },
  za: { name: "South Africa", code: "+27" },
  in: { name: "India", code: "+91" },
  id: { name: "Indonesia", code: "+62" },
  ph: { name: "Philippines", code: "+63" },
  mx: { name: "Mexico", code: "+52" },
  br: { name: "Brazil", code: "+55" },
}

export async function GET() {
  try {
    const apiKey = process.env.SMSPOOL_API_KEY
    
    let supplierServices: { id: string; name: string }[] = []
    let supplierCountries: { id: string; name: string; code: string }[] = []
    let balance: number | null = null
    let error: string | null = null

    if (apiKey && !apiKey.startsWith("your-") && apiKey.length >= 10) {
      try {
        const smsPool = getSMSPool()
        supplierServices = await smsPool.getServices()
        supplierCountries = (await smsPool.getCountries()).map(c => ({
          id: c.id || c.code || "",
          name: c.name || c.id || "",
          code: c.code || "",
        }))
        balance = await smsPool.getBalance()
        error = null
      } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch from supplier"
      }
    } else {
      error = "SMSPOOL_API_KEY not configured"
    }

    const pricingRules = await prisma.pricingRule.findMany({
      where: { isActive: true, type: "SMS_NUMBER" },
    })

    const adminPrices = new Map<string, {
      sellingPriceNGN: number
      costPrice: number
      stockQuantity: number
    }>()
    
    for (const rule of pricingRules) {
      const key = `${rule.service}-${rule.country}`
      adminPrices.set(key, {
        sellingPriceNGN: Number(rule.sellingPriceNGN),
        costPrice: Number(rule.costPrice),
        stockQuantity: rule.stockQuantity,
      })
    }

    const servicesMap = new Map<string, {
      id: string
      name: string
      countries: Map<string, {
        id: string
        name: string
        code: string
        supplierPrice: number | null
        adminPrice: number | null
        costPrice: number | null
        stock: number | null
        available: boolean
      }>
    }>()

    for (const service of supplierServices) {
      const normalizedId = service.name.toLowerCase().replace(/\s+/g, "_")
      servicesMap.set(normalizedId, {
        id: normalizedId,
        name: service.name,
        countries: new Map(),
      })
    }

    for (const country of supplierCountries) {
      for (const [, service] of servicesMap) {
        const countryKey = country.code.replace("+", "").toLowerCase()
        const adminPriceKey = `${service.id}-${countryKey}`
        const adminData = adminPrices.get(adminPriceKey)
        
        service.countries.set(countryKey, {
          id: countryKey,
          name: country.name || COUNTRY_NAMES[countryKey]?.name || countryKey,
          code: country.code || COUNTRY_NAMES[countryKey]?.code || "",
          supplierPrice: null,
          adminPrice: adminData?.sellingPriceNGN ?? null,
          costPrice: adminData?.costPrice ?? null,
          stock: adminData?.stockQuantity ?? null,
          available: adminData?.sellingPriceNGN != null,
        })
      }
    }

    for (const [key, data] of adminPrices) {
      const [serviceId, countryId] = key.split("-")
      
      if (!servicesMap.has(serviceId)) {
        servicesMap.set(serviceId, {
          id: serviceId,
          name: SERVICE_NAMES[serviceId] || serviceId,
          countries: new Map(),
        })
      }
      
      const service = servicesMap.get(serviceId)!
      if (!service.countries.has(countryId)) {
        const countryInfo = COUNTRY_NAMES[countryId]
        service.countries.set(countryId, {
          id: countryId,
          name: countryInfo?.name || countryId,
          code: countryInfo?.code || "",
          supplierPrice: null,
          adminPrice: data.sellingPriceNGN,
          costPrice: data.costPrice,
          stock: data.stockQuantity,
          available: data.sellingPriceNGN > 0,
        })
      } else {
        const country = service.countries.get(countryId)!
        country.adminPrice = data.sellingPriceNGN
        country.costPrice = data.costPrice
        country.stock = data.stockQuantity
        country.available = data.sellingPriceNGN > 0
      }
    }

    const services = Array.from(servicesMap.values()).map(service => ({
      id: service.id,
      name: service.name,
      countries: Array.from(service.countries.values()),
    }))

    return NextResponse.json({
      services,
      supplier: {
        name: "SMSPool",
        balance,
        servicesCount: supplierServices.length,
        countriesCount: supplierCountries.length,
      },
      error,
    })
  } catch (error) {
    console.error("Supplier services error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

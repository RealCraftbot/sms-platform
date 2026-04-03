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

interface SupplierConfig {
  name: string
  apiUrl: string
  apiKey: string
  type: "sms" | "social_log" | "social_boost"
}

const getSupplierConfigs = (): SupplierConfig[] => {
  const configs: SupplierConfig[] = []

  if (process.env.SMSPOOL_API_KEY && !process.env.SMSPOOL_API_KEY.startsWith("your-") && process.env.SMSPOOL_API_KEY.length >= 5) {
    configs.push({
      name: "SMSPool",
      apiUrl: "https://api.smspool.net",
      apiKey: process.env.SMSPOOL_API_KEY,
      type: "sms",
    })
  }

  if (process.env.TUTADS_API_KEY && !process.env.TUTADS_API_KEY.startsWith("your-") && process.env.TUTADS_API_KEY.length >= 5) {
    configs.push({
      name: "Tutads",
      apiUrl: "https://tutads.net/api",
      apiKey: process.env.TUTADS_API_KEY,
      type: "social_log",
    })
  }

  if (process.env.ACCTSHOP_API_KEY && !process.env.ACCTSHOP_API_KEY.startsWith("your-") && process.env.ACCTSHOP_API_KEY.length >= 5) {
    configs.push({
      name: "AcctShop",
      apiUrl: "https://acctshop.com/api",
      apiKey: process.env.ACCTSHOP_API_KEY,
      type: "social_log",
    })
  }

  if (process.env.ACCSMTP_API_KEY && !process.env.ACCSMTP_API_KEY.startsWith("your-") && process.env.ACCSMTP_API_KEY.length >= 5) {
    configs.push({
      name: "AccSMTP",
      apiUrl: "https://accsmtp.com/api",
      apiKey: process.env.ACCSMTP_API_KEY,
      type: "social_log",
    })
  }

  if (process.env.SELLCLONE_API_KEY && !process.env.SELLCLONE_API_KEY.startsWith("your-") && process.env.SELLCLONE_API_KEY.length >= 5) {
    configs.push({
      name: "SellCloneGiare",
      apiUrl: "https://sellclonegiare.com/api",
      apiKey: process.env.SELLCLONE_API_KEY,
      type: "social_log",
    })
  }

  if (process.env.VIACLONE_API_KEY && !process.env.VIACLONE_API_KEY.startsWith("your-") && process.env.VIACLONE_API_KEY.length >= 5) {
    configs.push({
      name: "ViaClone",
      apiUrl: "https://viaclone.net/api",
      apiKey: process.env.VIACLONE_API_KEY,
      type: "social_log",
    })
  }

  return configs
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "sms"

    const configs = getSupplierConfigs()
    const relevantConfigs = configs.filter(c => c.type === type)

    if (relevantConfigs.length === 0) {
      return NextResponse.json({
        services: [],
        suppliers: configs.map(c => ({ name: c.name, type: c.type, configured: true })),
        error: type === "sms" ? "SMSPOOL_API_KEY not configured" : "No social log suppliers configured",
      })
    }

    let services: any[] = []
    let balance: number | null = null
    let error: string | null = null

    if (type === "sms") {
      try {
        const smsPool = getSMSPool()
        services = await smsPool.getServices()
        balance = await smsPool.getBalance()
      } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch from SMS supplier"
      }
    } else {
      for (const config of relevantConfigs) {
        try {
          const response = await fetch(`${config.apiUrl}/products`, {
            headers: {
              "Authorization": `Bearer ${config.apiKey}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(10000),
          })

          if (response.ok) {
            const data = await response.json()
            if (Array.isArray(data)) {
              services = [...services, ...data.map((p: any) => ({
                ...p,
                supplier: config.name,
              }))]
            } else if (data.products && Array.isArray(data.products)) {
              services = [...services, ...data.products.map((p: any) => ({
                ...p,
                supplier: config.name,
              }))]
            }
          }
        } catch (e) {
          console.error(`${config.name} API error:`, e)
        }
      }

      if (services.length === 0) {
        error = "Failed to fetch from social log suppliers"
      }
    }

    const pricingRules = await prisma.pricingRule.findMany({
      where: { isActive: true },
    })

    const adminPrices = new Map<string, {
      sellingPriceNGN: number
      costPrice: number
      stockQuantity: number
    }>()

    for (const rule of pricingRules as any[]) {
      const key = `${rule.type}-${rule.service}-${rule.country || ""}-${rule.platform || ""}`
      adminPrices.set(key, {
        sellingPriceNGN: Number(rule.sellingPriceNGN),
        costPrice: Number(rule.costPrice),
        stockQuantity: rule.stockQuantity,
      })
    }

    if (type === "sms") {
      const servicesMap = new Map<string, any>()

      for (const service of services) {
        const normalizedId = service.name?.toLowerCase().replace(/\s+/g, "_") || service.id
        servicesMap.set(normalizedId, {
          id: normalizedId,
          name: service.name || normalizedId,
          countries: new Map(),
        })
      }

      servicesMap.forEach((service, serviceId) => {
        Object.entries(COUNTRY_NAMES).forEach(([countryId, countryInfo]) => {
          const adminKey = `SMS_NUMBER-${serviceId}-${countryId}`
          const adminData = adminPrices.get(adminKey)

          service.countries.set(countryId, {
            id: countryId,
            name: countryInfo.name,
            code: countryInfo.code,
            supplierPrice: null,
            adminPrice: adminData?.sellingPriceNGN ?? null,
            costPrice: adminData?.costPrice ?? null,
            stock: adminData?.stockQuantity ?? null,
            available: adminData?.sellingPriceNGN != null && adminData.sellingPriceNGN > 0,
          })
        })
      })

      adminPrices.forEach((data, key) => {
        if (key.startsWith("SMS_NUMBER-")) {
          const parts = key.split("-")
          const serviceId = parts[1]
          const countryId = parts[2]

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
          }
        }
      })

      const finalServices = Array.from(servicesMap.values()).map(service => ({
        id: service.id,
        name: service.name,
        countries: Array.from(service.countries.values()),
      }))

      return NextResponse.json({
        services: finalServices,
        supplier: {
          name: "SMSPool",
          balance,
          servicesCount: services.length,
        },
        suppliers: configs.map(c => ({ name: c.name, type: c.type, configured: true })),
        error,
      })
    }

    return NextResponse.json({
      services: services.slice(0, 500),
      suppliers: configs.map(c => ({ name: c.name, type: c.type, configured: true })),
      error,
    })
  } catch (error) {
    console.error("Supplier services error:", error)
    return NextResponse.json(
      { error: "Internal server error", services: [], suppliers: [] },
      { status: 500 }
    )
  }
}

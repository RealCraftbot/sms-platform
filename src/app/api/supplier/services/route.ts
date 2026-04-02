import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSupplier, Supplier } from "@/lib/sms-supplier"

async function getActiveSupplier(): Promise<Supplier> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "smsSupplier" },
    })
    return (setting?.value as Supplier) || "smspool"
  } catch (error) {
    console.error("Database error getting supplier setting:", error)
    return "smspool"
  }
}

function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false
  if (key.startsWith("your-")) return false
  if (key.length < 10) return false
  return true
}

export async function GET() {
  try {
    const supplierType = await getActiveSupplier()
    
    // Check if API key is configured for the active supplier
    let apiKey: string | undefined
    if (supplierType === "smspool") {
      apiKey = process.env.SMSPOOL_API_KEY
    } else if (supplierType === "smspinverify") {
      apiKey = process.env.SMSPINVERIFY_API_KEY
    } else if (supplierType === "smsactivate") {
      apiKey = process.env.SMSACTIVATE_API_KEY
    } else if (supplierType === "acctshop") {
      apiKey = process.env.ACCTSHOP_API_KEY
    } else if (supplierType === "tutads") {
      apiKey = process.env.TUTADS_API_KEY
    }
    
    if (!isValidApiKey(apiKey)) {
      console.log("API key not configured for supplier:", supplierType)
      return NextResponse.json({
        services: getFallbackServices(),
        countries: getFallbackCountries(),
        supplier: supplierType,
        message: `${supplierType} API key not configured - showing default services`
      })
    }

    try {
      const supplier = getSupplier(supplierType)
      
      const [services, countries] = await Promise.all([
        supplier.getServices(),
        supplier.getCountries(),
      ])
      
      type PricingRule = {
        id: string
        service: string
        country: string
        basePrice: number | { toNumber: () => number }
        finalPrice: number | { toNumber: () => number }
        isActive: boolean
      }
      
      let pricingRules: PricingRule[] = []
      try {
        pricingRules = await prisma.pricingRule.findMany({
          where: { isActive: true }
        })
      } catch (e) {
        console.log("Could not fetch pricing rules:", e)
      }

      const servicesWithPricing = services.map(service => {
        const serviceRules = pricingRules.filter(r => r.service === service.id)
        const countriesWithPricing = countries.map(country => {
          const rule = serviceRules.find(r => r.country === country.id)
          return {
            ...country,
            price: rule ? Number(rule.finalPrice) : null,
            basePrice: rule ? Number(rule.basePrice) : null,
          }
        })
        return {
          ...service,
          countries: countriesWithPricing,
        }
      })

      return NextResponse.json({
        services: servicesWithPricing,
        countries,
        supplier: supplierType,
      })
    } catch (error) {
      console.error("Error fetching from supplier:", error)
      
      return NextResponse.json({
        services: getFallbackServices().map(service => ({
          ...service,
          countries: getFallbackCountries().map(country => ({
            ...country,
            price: null,
            basePrice: null,
          }))
        })),
        countries: getFallbackCountries(),
        supplier: supplierType,
        message: "Could not fetch from supplier - showing default services"
      })
    }
  } catch (error) {
    console.error("Supplier services error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function getFallbackServices() {
  return [
    { id: "whatsapp", name: "WhatsApp" },
    { id: "instagram", name: "Instagram" },
    { id: "telegram", name: "Telegram" },
    { id: "facebook", name: "Facebook" },
    { id: "google", name: "Google" },
    { id: "twitter", name: "Twitter" },
    { id: "tiktok", name: "TikTok" },
    { id: "discord", name: "Discord" },
    { id: "snapchat", name: "Snapchat" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "amazon", name: "Amazon" },
    { id: "netflix", name: "Netflix" },
    { id: "spotify", name: "Spotify" },
  ]
}

function getFallbackCountries() {
  return [
    { id: "ng", name: "Nigeria", code: "+234" },
    { id: "us", name: "United States", code: "+1" },
    { id: "uk", name: "United Kingdom", code: "+44" },
    { id: "ca", name: "Canada", code: "+1" },
    { id: "gh", name: "Ghana", code: "+233" },
    { id: "ke", name: "Kenya", code: "+254" },
    { id: "za", name: "South Africa", code: "+27" },
    { id: "in", name: "India", code: "+91" },
    { id: "id", name: "Indonesia", code: "+62" },
    { id: "ph", name: "Philippines", code: "+63" },
    { id: "de", name: "Germany", code: "+49" },
    { id: "fr", name: "France", code: "+33" },
    { id: "es", name: "Spain", code: "+34" },
    { id: "it", name: "Italy", code: "+39" },
    { id: "br", name: "Brazil", code: "+55" },
    { id: "mx", name: "Mexico", code: "+52" },
    { id: "ru", name: "Russia", code: "+7" },
    { id: "jp", name: "Japan", code: "+81" },
    { id: "kr", name: "South Korea", code: "+82" },
    { id: "au", name: "Australia", code: "+61" },
  ]
}
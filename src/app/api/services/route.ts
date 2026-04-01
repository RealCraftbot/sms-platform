import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SERVICES = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "instagram", name: "Instagram" },
  { id: "telegram", name: "Telegram" },
  { id: "facebook", name: "Facebook" },
  { id: "google", name: "Google" },
  { id: "twitter", name: "Twitter" },
  { id: "tiktok", name: "TikTok" },
]

const COUNTRIES = [
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
]

export async function GET() {
  const pricingRules = await prisma.pricingRule.findMany({
    where: { isActive: true }
  })

  const servicesWithPricing = SERVICES.map(service => {
    const serviceRules = pricingRules.filter(r => r.service === service.id)
    const countriesWithPricing = COUNTRIES.map(country => {
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
    countries: COUNTRIES,
  })
}
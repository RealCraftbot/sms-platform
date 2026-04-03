import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@prisma/client"

const SMS_SERVICES = [
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

const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter" },
  { id: "gmail", name: "Gmail" },
  { id: "tiktok", name: "TikTok" },
  { id: "youtube", name: "YouTube" },
]

const BOOST_SERVICES = [
  { id: "followers", name: "Followers" },
  { id: "likes", name: "Likes" },
  { id: "views", name: "Views" },
  { id: "subscribers", name: "Subscribers" },
  { id: "comments", name: "Comments" },
]

export async function GET() {
  const pricingRules = await prisma.pricingRule.findMany({
    where: { isActive: true },
    include: {
      supplierProduct: {
        select: {
          minOrder: true,
          maxOrder: true,
        },
      },
    },
  })

  const smsPricing = SMS_SERVICES.map((service) => {
    const serviceRules = pricingRules.filter(
      (r) => r.type === ServiceType.SMS_NUMBER && r.service === service.id
    )
    const countriesWithPricing = COUNTRIES.map((country) => {
      const rule = serviceRules.find((r) => r.country === country.id)
      return {
        ...country,
        price: rule ? Number(rule.sellingPriceNGN) : null,
        costPrice: rule ? Number(rule.costPrice) : null,
        stock: rule?.stockQuantity ?? null,
      }
    })
    return {
      ...service,
      countries: countriesWithPricing,
    }
  })

  const logsPricing = SOCIAL_PLATFORMS.map((platform) => {
    const platformRules = pricingRules.filter(
      (r) => r.type === ServiceType.SOCIAL_LOG && r.platform === platform.id
    )
    return {
      ...platform,
      products: platformRules.map((rule) => ({
        id: rule.id,
        name: rule.displayName,
        price: Number(rule.sellingPriceNGN),
        costPrice: Number(rule.costPrice),
        stock: rule.stockQuantity,
        description: rule.description,
      })),
    }
  })

  const boostPricing = SOCIAL_PLATFORMS.map((platform) => {
    const platformRules = pricingRules.filter(
      (r) => r.type === ServiceType.SOCIAL_BOOST && r.platform === platform.id
    )
    return {
      ...platform,
      services: BOOST_SERVICES.map((service) => {
        const serviceRules = platformRules.filter((r) => r.subService === service.id)
        return {
          ...service,
          products: serviceRules.map((rule) => ({
            id: rule.id,
            name: rule.displayName,
            price: Number(rule.sellingPriceNGN),
            costPrice: Number(rule.costPrice),
            minOrder: rule.supplierProduct?.minOrder ?? 1,
            maxOrder: rule.supplierProduct?.maxOrder ?? 10000,
          })),
        }
      }),
    }
  })

  return NextResponse.json({
    sms: {
      services: smsPricing,
      countries: COUNTRIES,
    },
    logs: {
      platforms: logsPricing,
    },
    boost: {
      platforms: boostPricing,
      services: BOOST_SERVICES,
    },
  })
}

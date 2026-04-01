import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSupplier, Supplier, getSocialSupplier, SocialSupplierType } from "@/lib/sms-supplier"

async function getActiveSMSSupplier(): Promise<Supplier> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "smsSupplier" },
    })
    return (setting?.value as Supplier) || "smspool"
  } catch {
    return "smspool"
  }
}

async function getActiveSocialSupplier(): Promise<SocialSupplierType> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "socialSupplier" },
    })
    return (setting?.value as SocialSupplierType) || "tutads"
  } catch {
    return "tutads"
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
    const smsSupplierType = await getActiveSMSSupplier()
    const socialSupplierType = await getActiveSocialSupplier()

    // Get SMS Services
    let smsServices: any[] = []
    let smsError: string | null = null
    
    try {
      const smsApiKey = process.env[`${smsSupplierType.toUpperCase()}_API_KEY`]
      
      if (isValidApiKey(smsApiKey)) {
        const supplier = getSupplier(smsSupplierType)
        smsServices = await supplier.getServices()
      } else {
        smsError = `${smsSupplierType} API key not configured`
      }
    } catch (error: any) {
      smsError = error.message || "Failed to fetch SMS services"
    }

    // Get Social Products
    let socialProducts: any[] = []
    let socialError: string | null = null
    
    try {
      if (socialSupplierType === "tutads") {
        const apiKey = process.env.TUTADS_API_KEY
        if (isValidApiKey(apiKey)) {
          const supplier = getSocialSupplier("tutads")
          const result = await supplier.getProducts()
          socialProducts = result.products || []
        } else {
          socialError = "TUTADS_API_KEY not configured"
        }
      } else if (socialSupplierType === "accsmtp") {
        const baseUrl = process.env.ACCSMTP_BASE_URL
        const username = process.env.ACCSMTP_USERNAME
        const password = process.env.ACCSMTP_PASSWORD
        
        if (baseUrl && username && password) {
          const supplier = getSocialSupplier("accsmtp")
          const result = await supplier.getProducts()
          socialProducts = Array.isArray(result) ? result : (result as any).products || []
        } else {
          socialError = "ACCSMTP credentials not configured"
        }
      }
    } catch (error: any) {
      socialError = error.message || "Failed to fetch social products"
    }

    // Get supplier balances
    let smsBalance: number | null = null
    let socialBalance: number | null = null

    try {
      if (isValidApiKey(process.env[`${smsSupplierType.toUpperCase()}_API_KEY`])) {
        const supplier = getSupplier(smsSupplierType)
        smsBalance = await supplier.getBalance!()
      }
    } catch {}

    try {
      if (socialSupplierType === "tutads" && isValidApiKey(process.env.TUTADS_API_KEY)) {
        const supplier = getSocialSupplier("tutads")
        socialBalance = await supplier.getBalance()
      }
    } catch {}

    return NextResponse.json({
      sms: {
        supplier: smsSupplierType,
        services: smsServices,
        balance: smsBalance,
        error: smsError,
      },
      social: {
        supplier: socialSupplierType,
        products: socialProducts.slice(0, 50), // Limit to 50 for display
        balance: socialBalance,
        error: socialError,
      },
    })
  } catch (error) {
    console.error("Admin services error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
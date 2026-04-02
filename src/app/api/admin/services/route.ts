import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"
import { getSupplier, getSocialSupplier } from "@/lib/sms-supplier"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    // Get active suppliers from settings
    const [smsSetting, socialSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "smsSupplier" } }),
      prisma.setting.findUnique({ where: { key: "socialSupplier" } }),
    ])

    const smsSupplierType = (smsSetting?.value || "smspool") as string
    const socialSupplierType = (socialSetting?.value || "tutads") as string

    // Get SMS Services
    const smsServices: unknown[] = []
    let smsError: string | null = null
    let smsBalance: number | null = null
    
    try {
      const smsApiKey = process.env[`${smsSupplierType.toUpperCase()}_API_KEY`]
      
      if (smsApiKey && !smsApiKey.startsWith("your-") && smsApiKey.length >= 10) {
        const supplier = getSupplier(smsSupplierType as "smspool" | "smspinverify" | "smsactivate" | "acctshop" | "tutads")
        const services = await supplier.getServices()
        smsServices.push(...services)
        if (supplier.getBalance) {
          smsBalance = await supplier.getBalance()
        }
      } else {
        smsError = `${smsSupplierType.toUpperCase()}_API_KEY not configured`
      }
    } catch (error: unknown) {
      smsError = error instanceof Error ? error.message : "Failed to fetch SMS services"
    }

    // Get Social Products
    const socialProducts: unknown[] = []
    let socialError: string | null = null
    let socialBalance: number | null = null
    
    try {
      if (socialSupplierType === "tutads") {
        const apiKey = process.env.TUTADS_API_KEY
        if (apiKey && !apiKey.startsWith("your-") && apiKey.length >= 10) {
          const supplier = getSocialSupplier("tutads")
          const result = await supplier.getProducts()
          const products = Array.isArray(result) ? result : (result as { products?: unknown[] }).products || []
          socialProducts.push(...products)
          socialBalance = await supplier.getBalance()
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
          const products = Array.isArray(result) ? result : (result as { products?: unknown[] }).products || []
          socialProducts.push(...products)
          socialBalance = await supplier.getBalance()
        } else {
          socialError = "ACCSMTP credentials not configured"
        }
      } else if (socialSupplierType === "acctshop") {
        const apiKey = process.env.ACCTSHOP_API_KEY
        if (apiKey && !apiKey.startsWith("your-") && apiKey.length >= 10) {
          const supplier = getSocialSupplier("acctshop")
          const result = await supplier.getProducts()
          const products = Array.isArray(result) ? result : (result as { products?: unknown[] }).products || []
          socialProducts.push(...products)
          if (supplier.getBalance) {
            socialBalance = await supplier.getBalance()
          }
        } else {
          socialError = "ACCTSHOP_API_KEY not configured"
        }
      }
    } catch (error: unknown) {
      socialError = error instanceof Error ? error.message : "Failed to fetch social products"
    }

    return NextResponse.json({
      sms: {
        supplier: smsSupplierType,
        services: smsServices,
        balance: smsBalance,
        error: smsError,
      },
      social: {
        supplier: socialSupplierType,
        products: socialProducts.slice(0, 100),
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
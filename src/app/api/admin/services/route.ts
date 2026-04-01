import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSupplier, getSocialSupplier } from "@/lib/sms-supplier"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    // Get active suppliers from settings
    const [smsSetting, socialSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "smsSupplier" } }),
      prisma.setting.findUnique({ where: { key: "socialSupplier" } }),
    ])

    const smsSupplierType = (smsSetting?.value || "smspool") as string
    const socialSupplierType = (socialSetting?.value || "tutads") as string

    // Get SMS Services
    let smsServices: any[] = []
    let smsError: string | null = null
    let smsBalance: number | null = null
    
    try {
      const smsApiKey = process.env[`${smsSupplierType.toUpperCase()}_API_KEY`]
      
      if (smsApiKey && !smsApiKey.startsWith("your-") && smsApiKey.length >= 10) {
        const supplier = getSupplier(smsSupplierType as any)
        smsServices = await supplier.getServices()
        if (supplier.getBalance) {
          smsBalance = await supplier.getBalance()
        }
      } else {
        smsError = `${smsSupplierType.toUpperCase()}_API_KEY not configured`
      }
    } catch (error: any) {
      smsError = error.message || "Failed to fetch SMS services"
    }

    // Get Social Products
    let socialProducts: any[] = []
    let socialError: string | null = null
    let socialBalance: number | null = null
    
    try {
      if (socialSupplierType === "tutads") {
        const apiKey = process.env.TUTADS_API_KEY
        if (apiKey && !apiKey.startsWith("your-") && apiKey.length >= 10) {
          const supplier = getSocialSupplier("tutads")
          const result = await supplier.getProducts()
          socialProducts = Array.isArray(result) ? result : (result as any).products || []
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
          socialProducts = Array.isArray(result) ? result : (result as any).products || []
          socialBalance = await supplier.getBalance()
        } else {
          socialError = "ACCSMTP credentials not configured"
        }
      }
    } catch (error: any) {
      socialError = error.message || "Failed to fetch social products"
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
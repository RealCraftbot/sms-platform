import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkAdminAuth } from "@/lib/admin-auth"

export async function GET(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const settings = await prisma.setting.findMany()
    const settingsMap: Record<string, string> = {}
    settings.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value
    })

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, response } = await checkAdminAuth(request)
    if (!authorized) return response

    const body = await request.json()
    const { smsSupplier, socialSupplier } = body

    const validSMSSuppliers = ["smspool", "smspinverify", "smsactivate"]
    const validSocialSuppliers = ["acctshop", "tutads"]

    if (smsSupplier && !validSMSSuppliers.includes(smsSupplier)) {
      return NextResponse.json({ error: "Invalid SMS supplier" }, { status: 400 })
    }

    if (socialSupplier && !validSocialSuppliers.includes(socialSupplier)) {
      return NextResponse.json({ error: "Invalid social supplier" }, { status: 400 })
    }

    if (smsSupplier) {
      await prisma.setting.upsert({
        where: { key: "smsSupplier" },
        update: { value: smsSupplier },
        create: { key: "smsSupplier", value: smsSupplier },
      })
    }

    if (socialSupplier) {
      await prisma.setting.upsert({
        where: { key: "socialSupplier" },
        update: { value: socialSupplier },
        create: { key: "socialSupplier", value: socialSupplier },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
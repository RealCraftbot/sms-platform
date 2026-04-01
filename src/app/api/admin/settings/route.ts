import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const settings = await prisma.setting.findMany()
    const settingsMap: Record<string, string> = {}
    settings.forEach(s => {
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email! },
    })

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { smsSupplier, socialSupplier } = body

    const validSMSSuppliers = ["smspool", "smspinverify", "smsactivate", "acctshop", "tutads"]
    const validSocialSuppliers = ["tutads", "accsmtp"]

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
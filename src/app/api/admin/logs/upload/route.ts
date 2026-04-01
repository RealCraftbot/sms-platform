import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!adminUser || adminUser.email !== "admin@smsreseller.com") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const formData = await request.formData()
    const categoryId = formData.get("categoryId") as string
    const file = formData.get("file") as File

    if (!categoryId || !file) {
      return NextResponse.json(
        { error: "Category and file are required" },
        { status: 400 }
      )
    }

    const text = await file.text()
    const lines = text.trim().split("\n")
    
    const logs = []
    for (const line of lines) {
      const parts = line.split(",").map(p => p.trim())
      if (parts.length >= 4) {
        logs.push({
          categoryId,
          platform: parts[0],
          username: parts[1],
          password: parts[2],
          email: parts[3] || null,
          age: parts[4] ? parseInt(parts[4]) : null,
          followers: parts[5] ? parseInt(parts[5]) : null,
          price: parts[6] ? parseFloat(parts[6]) : 0,
          costPrice: parts[7] ? parseFloat(parts[7]) : 0,
        })
      }
    }

    if (logs.length > 0) {
      await prisma.socialLog.createMany({
        data: logs,
      })
    }

    return NextResponse.json({
      success: true,
      count: logs.length,
    })
  } catch (error) {
    console.error("Upload logs error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
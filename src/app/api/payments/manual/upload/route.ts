import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const orderId = formData.get("orderId") as string
    const notes = formData.get("notes") as string
    const file = formData.get("screenshot") as File

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "Screenshot is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    
    const filename = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const manualPayment = await prisma.manualPayment.create({
      data: {
        orderId,
        userId: user.id,
        screenshotUrl: `/uploads/${filename}`,
        notes,
      },
    })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "awaiting_approval",
      },
    })

    return NextResponse.json(manualPayment)
  } catch (error) {
    console.error("Manual payment upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, secretKey } = body

    // Simple protection - require a secret key
    if (secretKey !== "setup-admin-2024") {
      return NextResponse.json(
        { error: "Invalid setup key" },
        { status: 403 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name: name || "Admin",
        role: "admin",
      },
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error: unknown) {
    console.error("Admin setup error:", error)
    
    // Check if it's a Prisma error (table doesn't exist)
    const err = error as { code?: string; message?: string }
    if (err?.code === "P2021" || err?.message?.includes("does not exist")) {
      return NextResponse.json(
        { error: "Database not ready. Please wait for deployment to complete and try again." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const count = await prisma.admin.count()
    
    return NextResponse.json({
      hasAdmin: count > 0,
      count,
    })
  } catch (error) {
    console.error("Check admin error:", error)
    return NextResponse.json({
      hasAdmin: false,
      count: 0,
    })
  }
}
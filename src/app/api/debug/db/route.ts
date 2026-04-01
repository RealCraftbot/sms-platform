import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    return NextResponse.json({ 
      status: "connected", 
      tables: tables,
      message: "Database connected successfully"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: "error", 
      error: error.message,
      code: error.code 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function getAdminFromHeader(request: Request) {
  const adminId = request.headers.get("x-admin-id")
  const adminEmail = request.headers.get("x-admin-email")
  
  if (!adminId && !adminEmail) {
    return null
  }
  
  if (adminId) {
    return prisma.admin.findUnique({
      where: { id: adminId },
    })
  }
  
  if (adminEmail) {
    return prisma.admin.findUnique({
      where: { email: adminEmail },
    })
  }
  
  return null
}

export async function checkAdminAuth(request: Request) {
  const admin = await getAdminFromHeader(request)
  if (!admin) {
    return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  }
  return { authorized: true, admin }
}
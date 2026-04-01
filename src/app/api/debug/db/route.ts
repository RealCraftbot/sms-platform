import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "phone" TEXT,
        "balance" DECIMAL(10,2) DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `.catch(() => {})

    // Create Admin table  
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `.catch(() => {})

    // Create PaymentMethod table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PaymentMethod" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true
      )
    `.catch(() => {})

    // Create PricingRule table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PricingRule" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "service" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "basePrice" DECIMAL(10,4) NOT NULL,
        "markupType" TEXT NOT NULL,
        "markupValue" DECIMAL(10,4) NOT NULL,
        "finalPrice" DECIMAL(10,2) NOT NULL,
        "minPrice" DECIMAL(10,2),
        "maxPrice" DECIMAL(10,2),
        "isActive" BOOLEAN DEFAULT true,
        UNIQUE("service", "country")
      )
    `.catch(() => {})

    // Create Order table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "paymentMethodId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "currency" TEXT DEFAULT 'NGN',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `.catch(() => {})

    // Create SMSOrder table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SMSOrder" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT UNIQUE NOT NULL,
        "service" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "phoneNumber" TEXT,
        "supplierOrderId" TEXT,
        "smsCode" TEXT,
        "smsText" TEXT,
        "expiresAt" TIMESTAMP
      )
    `.catch(() => {})

    // Create LogCategory table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "LogCategory" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "isActive" BOOLEAN DEFAULT true
      )
    `.catch(() => {})

    // Create SocialLog table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SocialLog" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "categoryId" TEXT NOT NULL,
        "platform" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "email" TEXT,
        "password" TEXT NOT NULL,
        "age" INTEGER,
        "followers" INTEGER,
        "price" DECIMAL(10,2) NOT NULL,
        "costPrice" DECIMAL(10,2) NOT NULL,
        "status" TEXT DEFAULT 'available',
        "soldToId" TEXT,
        "soldAt" TIMESTAMP
      )
    `.catch(() => {})

    // Create LogOrder table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "LogOrder" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT UNIQUE NOT NULL,
        "items" JSONB NOT NULL
      )
    `.catch(() => {})

    // Create Transaction table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerTxId" TEXT,
        "reference" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `.catch(() => {})

    // Create ManualPayment table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ManualPayment" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "screenshotUrl" TEXT NOT NULL,
        "notes" TEXT,
        "uploadedAt" TIMESTAMP DEFAULT NOW(),
        "reviewedBy" TEXT,
        "reviewedAt" TIMESTAMP,
        "reviewNotes" TEXT,
        "status" TEXT DEFAULT 'pending_review'
      )
    `.catch(() => {})

    // Insert default payment methods
    await prisma.$executeRaw`
      INSERT INTO "PaymentMethod" (id, name, type, isActive) 
      VALUES ('wallet', 'Wallet', 'wallet', true), ('paystack', 'Paystack', 'auto', true), ('manual', 'Manual Transfer', 'manual', true)
      ON CONFLICT (id) DO NOTHING
    `.catch(() => {})

    // Check tables now
    const tables = await prisma.$queryRaw<any[]>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`

    return NextResponse.json({ 
      success: true,
      tables: tables.map(t => t.table_name)
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
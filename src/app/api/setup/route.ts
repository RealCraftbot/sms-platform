import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test connection
    await prisma.$connect()
    
    // Try to create tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "phone" TEXT,
        "balance" DECIMAL(10,2) DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Admin" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PaymentMethod" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "PricingRule" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "paymentMethodId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "currency" TEXT DEFAULT 'NGN',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SMSOrder" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL UNIQUE,
        "service" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "phoneNumber" TEXT,
        "supplierOrderId" TEXT,
        "smsCode" TEXT,
        "smsText" TEXT,
        "expiresAt" TIMESTAMP
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "LogCategory" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "isActive" BOOLEAN DEFAULT true
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SocialLog" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "LogOrder" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL UNIQUE,
        "items" JSONB NOT NULL
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerTxId" TEXT,
        "reference" TEXT NOT NULL,
        "amount" DECIMAL(10,2) NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ManualPayment" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderId" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "screenshotUrl" TEXT NOT NULL,
        "notes" TEXT,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "reviewedBy" TEXT,
        "reviewedAt" TIMESTAMP,
        "reviewNotes" TEXT,
        "status" TEXT DEFAULT 'pending_review'
      )
    `
    
    // Insert default data
    await prisma.$executeRaw`
      INSERT INTO "PaymentMethod" (id, name, type, isActive) 
      VALUES ('wallet', 'Wallet', 'wallet', true), ('paystack', 'Paystack', 'auto', true), ('manual', 'Manual Transfer', 'manual', true)
      ON CONFLICT (id) DO NOTHING
    `
    
    return NextResponse.json({ 
      status: "success", 
      message: "Database tables created successfully"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      status: "error", 
      error: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
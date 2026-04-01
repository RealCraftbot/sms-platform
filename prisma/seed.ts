import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create payment methods
  await prisma.paymentMethod.upsert({
    where: { id: 'paystack' },
    update: {},
    create: { id: 'paystack', name: 'Paystack', type: 'auto', isActive: true },
  })

  await prisma.paymentMethod.upsert({
    where: { id: 'manual' },
    update: {},
    create: { id: 'manual', name: 'Manual Transfer', type: 'manual', isActive: true },
  })

  // Create default pricing rules
  const pricingRules = [
    { service: 'whatsapp', country: 'ng', basePrice: 500, markupType: 'percentage', markupValue: 20, finalPrice: 600 },
    { service: 'whatsapp', country: 'us', basePrice: 800, markupType: 'percentage', markupValue: 50, finalPrice: 1200 },
    { service: 'instagram', country: 'ng', basePrice: 500, markupType: 'percentage', markupValue: 20, finalPrice: 600 },
    { service: 'instagram', country: 'us', basePrice: 800, markupType: 'percentage', markupValue: 50, finalPrice: 1200 },
    { service: 'telegram', country: 'ng', basePrice: 400, markupType: 'percentage', markupValue: 25, finalPrice: 500 },
    { service: 'facebook', country: 'ng', basePrice: 450, markupType: 'percentage', markupValue: 22, finalPrice: 550 },
    { service: 'google', country: 'ng', basePrice: 500, markupType: 'percentage', markupValue: 20, finalPrice: 600 },
    { service: 'twitter', country: 'ng', basePrice: 500, markupType: 'percentage', markupValue: 20, finalPrice: 600 },
    { service: 'tiktok', country: 'ng', basePrice: 600, markupType: 'percentage', markupValue: 17, finalPrice: 700 },
  ]

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: { service_country: { service: rule.service, country: rule.country } },
      update: rule,
      create: { ...rule, id: `${rule.service}-${rule.country}` },
    })
  }

  // Create default log categories
  const categories = [
    { id: 'instagram', name: 'Instagram', slug: 'instagram' },
    { id: 'facebook', name: 'Facebook', slug: 'facebook' },
    { id: 'twitter', name: 'Twitter', slug: 'twitter' },
    { id: 'tiktok', name: 'TikTok', slug: 'tiktok' },
  ]

  for (const cat of categories) {
    await prisma.logCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    })
  }

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@smsreseller.com' },
    update: {},
    create: {
      email: 'admin@smsreseller.com',
      password: adminPassword,
      name: 'Admin',
    },
  })

  console.log('Database seeded!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
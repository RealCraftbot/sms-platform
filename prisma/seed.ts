import { PrismaClient, ServiceType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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

  await prisma.paymentMethod.upsert({
    where: { id: 'wallet' },
    update: {},
    create: { id: 'wallet', name: 'Wallet', type: 'wallet', isActive: true },
  })

  const smsRules = [
    { service: 'whatsapp', country: 'ng', costPrice: 0.06, price: 300, name: 'Nigeria WhatsApp' },
    { service: 'whatsapp', country: 'us', costPrice: 0.08, price: 500, name: 'USA WhatsApp' },
    { service: 'whatsapp', country: 'uk', costPrice: 0.07, price: 450, name: 'UK WhatsApp' },
    { service: 'instagram', country: 'ng', costPrice: 0.06, price: 300, name: 'Nigeria Instagram' },
    { service: 'instagram', country: 'us', costPrice: 0.08, price: 500, name: 'USA Instagram' },
    { service: 'telegram', country: 'ng', costPrice: 0.05, price: 250, name: 'Nigeria Telegram' },
    { service: 'telegram', country: 'us', costPrice: 0.07, price: 400, name: 'USA Telegram' },
    { service: 'facebook', country: 'ng', costPrice: 0.05, price: 250, name: 'Nigeria Facebook' },
    { service: 'google', country: 'ng', costPrice: 0.06, price: 300, name: 'Nigeria Google' },
    { service: 'twitter', country: 'ng', costPrice: 0.05, price: 250, name: 'Nigeria Twitter' },
    { service: 'tiktok', country: 'ng', costPrice: 0.07, price: 350, name: 'Nigeria TikTok' },
  ]

  for (const rule of smsRules) {
    const profit = rule.price - (rule.costPrice * 1500)
    const markupPct = ((rule.price - (rule.costPrice * 1500)) / rule.price) * 100
    await prisma.pricingRule.upsert({
      where: { id: `sms-${rule.service}-${rule.country}` },
      update: {},
      create: {
        id: `sms-${rule.service}-${rule.country}`,
        type: ServiceType.SMS_NUMBER,
        service: rule.service,
        country: rule.country,
        displayName: rule.name,
        actualCost: rule.costPrice,
        actualCurrency: 'USD',
        sellingPriceNGN: rule.price,
        markupPercentage: markupPct,
        profitPerUnit: profit,
        profitMargin: (profit / rule.price) * 100,
        isActive: true,
        showStock: true,
      },
    })
  }

  const logRules = [
    { platform: 'instagram', name: 'Instagram Aged Account (1 Year)', costPrice: 0.05, price: 5000 },
    { platform: 'facebook', name: 'Facebook Aged Account (1 Year)', costPrice: 0.05, price: 4500 },
    { platform: 'twitter', name: 'Twitter Aged Account (1 Year)', costPrice: 0.04, price: 4000 },
    { platform: 'gmail', name: 'Gmail Aged Account (1 Year)', costPrice: 0.03, price: 3000 },
  ]

  for (const rule of logRules) {
    const profit = rule.price - (rule.costPrice * 1500)
    const markupPct = ((rule.price - (rule.costPrice * 1500)) / rule.price) * 100
    await prisma.pricingRule.upsert({
      where: { id: `log-${rule.platform}-aged` },
      update: {},
      create: {
        id: `log-${rule.platform}-aged`,
        type: ServiceType.SOCIAL_LOG,
        platform: rule.platform,
        service: 'aged_account',
        displayName: rule.name,
        description: 'Pre-created aged social media account',
        actualCost: rule.costPrice,
        actualCurrency: 'USD',
        sellingPriceNGN: rule.price,
        markupPercentage: markupPct,
        profitPerUnit: profit,
        profitMargin: (profit / rule.price) * 100,
        stockQuantity: 50,
        isActive: true,
        showStock: true,
      },
    })
  }

  const boostRules = [
    { platform: 'instagram', subService: 'followers', costPrice: 0.02, price: 500, name: 'Instagram 100 Followers' },
    { platform: 'instagram', subService: 'likes', costPrice: 0.01, price: 300, name: 'Instagram 100 Likes' },
    { platform: 'facebook', subService: 'followers', costPrice: 0.02, price: 500, name: 'Facebook 100 Followers' },
    { platform: 'tiktok', subService: 'followers', costPrice: 0.02, price: 400, name: 'TikTok 100 Followers' },
    { platform: 'youtube', subService: 'subscribers', costPrice: 0.05, price: 1000, name: 'YouTube 100 Subscribers' },
  ]

  for (const rule of boostRules) {
    const profit = rule.price - (rule.costPrice * 1500)
    const markupPct = ((rule.price - (rule.costPrice * 1500)) / rule.price) * 100
    await prisma.pricingRule.upsert({
      where: { id: `boost-${rule.platform}-${rule.subService}` },
      update: {},
      create: {
        id: `boost-${rule.platform}-${rule.subService}`,
        type: ServiceType.SOCIAL_BOOST,
        platform: rule.platform,
        service: rule.subService,
        subService: rule.subService,
        displayName: rule.name,
        actualCost: rule.costPrice,
        actualCurrency: 'USD',
        sellingPriceNGN: rule.price,
        markupPercentage: markupPct,
        profitPerUnit: profit,
        profitMargin: (profit / rule.price) * 100,
        isActive: true,
        showStock: false,
      },
    })
  }

  await prisma.logCategory.upsert({
    where: { id: 'instagram' },
    update: {},
    create: { id: 'instagram', name: 'Instagram', slug: 'instagram' },
  })
  await prisma.logCategory.upsert({
    where: { id: 'facebook' },
    update: {},
    create: { id: 'facebook', name: 'Facebook', slug: 'facebook' },
  })
  await prisma.logCategory.upsert({
    where: { id: 'twitter' },
    update: {},
    create: { id: 'twitter', name: 'Twitter', slug: 'twitter' },
  })
  await prisma.logCategory.upsert({
    where: { id: 'tiktok' },
    update: {},
    create: { id: 'tiktok', name: 'TikTok', slug: 'tiktok' },
  })

  const adminPassword = await hash('admin123', 12)
  await prisma.admin.upsert({
    where: { email: 'admin@smsreseller.com' },
    update: {},
    create: {
      email: 'admin@smsreseller.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('Database seeded with unified schema!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

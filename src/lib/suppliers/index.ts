import { SMSPoolWrapper } from './smspool'
import { SMSPinVerifyWrapper } from './smspinverify'
import { SMSActivateWrapper } from './smsactivate'
import { AcctShopWrapper } from './acctshop'
import { TutAdsWrapper } from './tutads'
import { AccSMTPWrapper } from './accsmtp'

export type SupplierName = 'smspool' | 'smspinverify' | 'smsactivate' | 'acctshop' | 'tutads'
export type SocialSupplierName = 'tutads' | 'accsmtp'

export interface SMSSupplier {
  getServices(): Promise<any[]>
  getBalance(): Promise<number>
  orderNumber(service: string, country: string): Promise<any>
  getCode(orderId: string): Promise<string | null>
  cancelOrder?(orderId: string): Promise<boolean>
}

export interface SocialSupplier {
  getProducts(): Promise<any>
  getProduct?(productId: number): Promise<any>
  buyProduct(productId: number, quantity: number): Promise<any>
  getOrder?(orderId: string): Promise<any>
  getBalance(): Promise<number>
}

const getEnvKey = (name: string): string => {
  return process.env[`${name.toUpperCase()}_API_KEY`] || process.env[name] || ''
}

export function getSupplier(name: SupplierName): SMSSupplier {
  switch (name) {
    case 'smspool':
      return new SMSPoolWrapper(getEnvKey('SMSPOOL'))
    case 'smspinverify':
      return new SMSPinVerifyWrapper(getEnvKey('SMSPINVERIFY'))
    case 'smsactivate':
      return new SMSActivateWrapper(getEnvKey('SMSACTIVATE'))
    case 'acctshop':
      return new AcctShopWrapper(getEnvKey('ACCTSHOP'))
    case 'tutads':
      return new TutAdsWrapper(getEnvKey('TUTADS'))
    default:
      throw new Error(`Unknown supplier: ${name}`)
  }
}

export function getSocialSupplier(name: SocialSupplierName): SocialSupplier {
  switch (name) {
    case 'tutads':
      return new TutAdsWrapper(getEnvKey('TUTADS'))
    case 'accsmtp':
      return new AccSMTPWrapper(
        process.env.ACCSMTP_BASE_URL || '',
        process.env.ACCSMTP_USERNAME || '',
        process.env.ACCSMTP_PASSWORD || ''
      )
    default:
      throw new Error(`Unknown social supplier: ${name}`)
  }
}

export async function getActiveSupplierFromSettings(): Promise<SMSSupplier> {
  const { prisma } = await import('./prisma')
  const setting = await prisma.setting.findUnique({
    where: { key: 'smsSupplier' },
  })
  const supplierName = (setting?.value || 'smspool') as SupplierName
  return getSupplier(supplierName)
}
import { getSMSPool } from "./smspool"
import { getSMSPinVerify } from "./smspinverify"
import { getSMSActivate } from "./smsactivate"
import { getAcctShop } from "./acctshop"
import { getTutAds } from "./tutads"
import { getAccSMTP } from "./accsmtp"

export type Supplier = "smspool" | "smspinverify" | "smsactivate" | "acctshop" | "tutads"
export type SocialSupplier = "tutads" | "accsmtp"

export interface SMSResult {
  success: boolean
  orderId?: string
  phoneNumber?: string
  message?: string
}

export interface SMSCheckResult {
  success: boolean
  sms?: string
  code?: string
  message?: string
}

export interface ServiceInfo {
  id: string
  name: string
}

export interface CountryInfo {
  id: string
  name: string
  code?: string
}

export interface SMSSupplier {
  getServices(): Promise<ServiceInfo[]>
  getCountries(): Promise<CountryInfo[]>
  buyNumber(service: string, country: string): Promise<SMSResult>
  getSms(orderId: string): Promise<SMSCheckResult>
  cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }>
  getBalance?(): Promise<number>
}

export interface SocialSupplier {
  getProducts(): Promise<{ categories: any[]; products: any[] }>
  getProduct?(productId: number): Promise<any>
  buyProduct(productId: number, amount: number): Promise<{ success: boolean; accounts?: string[]; message?: string }>
  getOrder?(orderId: string): Promise<any>
  getBalance(): Promise<number>
}

export function getSupplier(type: Supplier): SMSSupplier {
  switch (type) {
    case "smspool":
      return getSMSPool()
    case "smspinverify":
      return getSMSPinVerify()
    case "smsactivate":
      return getSMSActivate()
    case "acctshop":
      return getAcctShop()
    case "tutads":
      return getTutAds() as unknown as SMSSupplier
    default:
      return getSMSPool()
  }
}

export function getSocialSupplier(type: SocialSupplier): SocialSupplier {
  switch (type) {
    case "tutads":
      return getTutAds() as unknown as SocialSupplier
    case "accsmtp":
      return getAccSMTP() as unknown as SocialSupplier
    default:
      return getTutAds() as unknown as SocialSupplier
  }
}
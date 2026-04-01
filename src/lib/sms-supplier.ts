import { getSMSPool } from "./smspool"
import { getSMSPinVerify } from "./smspinverify"
import { getSMSActivate } from "./smsactivate"
import { getAcctShop } from "./acctshop"
import { getTutAds } from "./tutads"

export type Supplier = "smspool" | "smspinverify" | "smsactivate" | "acctshop" | "tutads"

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

export interface SMSSupplier {
  buyNumber(service: string, country: string): Promise<SMSResult>
  getSms(orderId: string): Promise<SMSCheckResult>
  cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }>
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
      return getTutAds()
    default:
      throw new Error(`Unknown SMS supplier: ${type}`)
  }
}
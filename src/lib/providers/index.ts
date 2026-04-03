export { BaseProvider, ProviderManager, providerManager as managers, type ProviderProduct, type OrderResult, type BalanceResult, type CostResult } from "./base"
export { SMSPoolProvider } from "./smspool"
export { FiveSimProvider } from "./fivesim"
export { SmspinverifyProvider } from "./smspinverify"
export { AutoficationsProvider } from "./autofications"
export { NaijaboostProvider } from "./naijaboost"
export { FullsmmProvider } from "./fullsmm"
export { FortunesmmProvider } from "./fortunesmm"
export { TutadsProvider } from "./tutads"
export { AcctshopProvider } from "./acctshop"
export { AccsmtpProvider } from "./accsmtp"
export { SellcloneProvider } from "./sellclone"
export { SellclonegiareProvider } from "./sellclonegiare"
export { ViacloneProvider } from "./viaclone"

import { SMSPoolProvider } from "./smspool"
import { FiveSimProvider } from "./fivesim"
import { SmspinverifyProvider } from "./smspinverify"
import { AutoficationsProvider } from "./autofications"
import { NaijaboostProvider } from "./naijaboost"
import { FullsmmProvider } from "./fullsmm"
import { FortunesmmProvider } from "./fortunesmm"
import { TutadsProvider } from "./tutads"
import { AcctshopProvider } from "./acctshop"
import { AccsmtpProvider } from "./accsmtp"
import { SellcloneProvider } from "./sellclone"
import { SellclonegiareProvider } from "./sellclonegiare"
import { ViacloneProvider } from "./viaclone"
import { providerManager, BaseProvider } from "./base"

interface ProviderConfig {
  name: string
  envKey: string
  ProviderClass: new (apiKey: string) => BaseProvider
  category: "SMS" | "BOOSTING" | "ACCOUNTS"
}

const providerConfigs: ProviderConfig[] = [
  { name: "SMSPool", envKey: "SMSPOOL_API_KEY", ProviderClass: SMSPoolProvider, category: "SMS" },
  { name: "5Sim", envKey: "FIVESIM_API_KEY", ProviderClass: FiveSimProvider, category: "SMS" },
  { name: "SmsPinVerify", envKey: "SMSPINVERIFY_API_KEY", ProviderClass: SmspinverifyProvider, category: "SMS" },
  { name: "Autofications", envKey: "AUTOFICICATIONS_API_KEY", ProviderClass: AutoficationsProvider, category: "SMS" },
  { name: "NaijaBoost", envKey: "NAIJABOOST_API_KEY", ProviderClass: NaijaboostProvider, category: "BOOSTING" },
  { name: "FullSMM", envKey: "FULLSMM_API_KEY", ProviderClass: FullsmmProvider, category: "BOOSTING" },
  { name: "FortuneSMM", envKey: "FORTUNESMM_API_KEY", ProviderClass: FortunesmmProvider, category: "BOOSTING" },
  { name: "Tutads", envKey: "TUTADS_API_KEY", ProviderClass: TutadsProvider, category: "ACCOUNTS" },
  { name: "AcctShop", envKey: "ACCTSHOP_API_KEY", ProviderClass: AcctshopProvider, category: "ACCOUNTS" },
  { name: "AccSMTP", envKey: "ACCSMTP_API_KEY", ProviderClass: AccsmtpProvider, category: "ACCOUNTS" },
  { name: "SellClone", envKey: "SELLCLONE_API_KEY", ProviderClass: SellcloneProvider, category: "ACCOUNTS" },
  { name: "SellCloneGiare", envKey: "SELLCLONEGIARE_API_KEY", ProviderClass: SellclonegiareProvider, category: "ACCOUNTS" },
  { name: "Viaclone", envKey: "VIACLONE_API_KEY", ProviderClass: ViacloneProvider, category: "ACCOUNTS" },
]

const missingProviders: string[] = []

for (const config of providerConfigs) {
  const apiKey = process.env[config.envKey]
  
  if (!apiKey) {
    missingProviders.push(config.name)
    console.warn(`[Provider] ${config.name}: Configuration Missing (${config.envKey} not found in environment)`)
    continue
  }
  
  if (apiKey.startsWith("your-")) {
    console.warn(`[Provider] ${config.name}: Configuration Missing (${config.envKey} is placeholder)`)
    missingProviders.push(config.name)
    continue
  }
  
  try {
    const provider = new config.ProviderClass(apiKey)
    providerManager.register(provider)
    console.log(`[Provider] ${config.name} registered successfully`)
  } catch (error) {
    console.error(`[Provider] ${config.name}: Failed to initialize`, error)
    missingProviders.push(config.name)
  }
}

export { providerManager }

export function getProviderBySlug(slug: string): BaseProvider | undefined {
  return providerManager.get(slug)
}

export function getProvidersByCategory(category: "SMS" | "BOOSTING" | "ACCOUNTS"): BaseProvider[] {
  return providerManager.getByCategory(category)
}

export async function getBestAvailableProvider(category: "SMS" | "BOOSTING" | "ACCOUNTS"): Promise<BaseProvider | null> {
  return providerManager.getBestProvider(category)
}

export function getMissingProviders(): string[] {
  return missingProviders
}

export function getConfiguredProviders(): { name: string; slug: string; category: string }[] {
  return providerManager.listAll()
}

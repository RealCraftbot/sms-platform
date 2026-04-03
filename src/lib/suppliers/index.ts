import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "../providers/base"

export interface ProviderStatus {
  name: string
  slug: string
  category: "SMS" | "BOOSTING" | "ACCOUNTS"
  enabled: boolean
  configured: boolean
  health: {
    status: "healthy" | "unhealthy" | "unknown"
    latency?: number
    message?: string
  }
}

export type ServiceCategory = "SMS" | "BOOSTING" | "LOGS"

class UnifiedSupplierManager {
  private providers: Map<string, BaseProvider> = new Map()
  private enabledProviders: Set<string> = new Set()
  private missingProviders: string[] = []

  register(slug: string, provider: BaseProvider, enabled: boolean = true): void {
    this.providers.set(slug, provider)
    if (enabled) {
      this.enabledProviders.add(slug)
    }
  }

  disable(slug: string): void {
    this.enabledProviders.delete(slug)
  }

  enable(slug: string): void {
    if (this.providers.has(slug)) {
      this.enabledProviders.add(slug)
    }
  }

  isEnabled(slug: string): boolean {
    return this.enabledProviders.has(slug)
  }

  isConfigured(slug: string): boolean {
    return this.providers.has(slug)
  }

  get(slug: string): BaseProvider | undefined {
    return this.providers.get(slug)
  }

  listConfigured(): { name: string; slug: string; category: string }[] {
    return Array.from(this.providers.values()).map(p => ({
      name: p.name,
      slug: p.slug,
      category: p.category,
    }))
  }

  listEnabled(): { name: string; slug: string; category: string }[] {
    return Array.from(this.enabledProviders).map(slug => {
      const provider = this.providers.get(slug)
      return provider ? {
        name: provider.name,
        slug: provider.slug,
        category: provider.category,
      } : null
    }).filter(Boolean) as { name: string; slug: string; category: string }[]
  }

  getByCategory(category: "SMS" | "BOOSTING" | "ACCOUNTS"): BaseProvider[] {
    return Array.from(this.providers.values()).filter(
      p => p.category === category && this.enabledProviders.has(p.slug)
    )
  }

  async getStatus(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = []

    for (const [slug, provider] of this.providers) {
      const health = await provider.healthCheck().catch(() => ({
        status: "unknown" as const,
        latency: undefined,
        message: "Provider check failed"
      }))

      statuses.push({
        name: provider.name,
        slug,
        category: provider.category,
        enabled: this.enabledProviders.has(slug),
        configured: true,
        health: {
          status: health.status === "healthy" ? "healthy" : "unhealthy",
          latency: health.latency,
          message: health.message,
        },
      })
    }

    return statuses
  }

  async getBestProvider(category: "SMS" | "BOOSTING" | "ACCOUNTS"): Promise<BaseProvider | null> {
    const providers = this.getByCategory(category)
    
    for (const provider of providers) {
      try {
        const health = await provider.healthCheck()
        if (health.status === "healthy") {
          return provider
        }
      } catch {
        continue
      }
    }
    
    return null
  }

  getMissingProviders(): string[] {
    return this.missingProviders
  }

  logMissingProvider(name: string, envKey: string): void {
    if (!this.missingProviders.includes(name)) {
      this.missingProviders.push(name)
      console.warn(`[Supplier] ${name}: Configuration Missing (${envKey} not found in environment)`)
    }
  }
}

export const supplierManager = new UnifiedSupplierManager()

export function getSupplier(slug: string): BaseProvider | undefined {
  return supplierManager.get(slug)
}

export function getSuppliersByCategory(category: "SMS" | "BOOSTING" | "ACCOUNTS"): BaseProvider[] {
  return supplierManager.getByCategory(category)
}

export async function getBestSupplier(category: "SMS" | "BOOSTING" | "ACCOUNTS"): Promise<BaseProvider | null> {
  return supplierManager.getBestProvider(category)
}

export function isSupplierEnabled(slug: string): boolean {
  return supplierManager.isEnabled(slug)
}

export function enableSupplier(slug: string): void {
  supplierManager.enable(slug)
}

export function disableSupplier(slug: string): void {
  supplierManager.disable(slug)
}

export async function getSupplierStatuses(): Promise<ProviderStatus[]> {
  return supplierManager.getStatus()
}

export { BaseProvider, type ProviderProduct, type BalanceResult, type CostResult, type OrderResult }

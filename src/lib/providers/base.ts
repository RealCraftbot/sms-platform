import { ServiceType } from "@prisma/client"

export interface ProviderProduct {
  id: string
  externalId: string
  service: string
  subService?: string
  country?: string
  countryCode?: string
  platform?: string
  cost: number
  currency: string
  stock: number
  minQuantity: number
  maxQuantity: number
}

export interface OrderResult {
  success: boolean
  externalOrderId?: string
  phoneNumber?: string
  message?: string
  status?: string
}

export interface BalanceResult {
  success: boolean
  balance?: number
  currency?: string
  message?: string
}

export interface CostResult {
  success: boolean
  cost?: number
  currency?: string
  stock?: number
  message?: string
}

export abstract class BaseProvider {
  abstract readonly name: string
  abstract readonly slug: string
  abstract readonly category: "SMS" | "BOOSTING" | "ACCOUNTS"
  abstract readonly baseUrl: string
  abstract readonly apiKey: string

  protected timeout = 30000

  protected async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: Record<string, unknown>
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeout)
      const data = await response.json()
      return data as T
    } catch (error) {
      clearTimeout(timeout)
      throw error
    }
  }

  abstract getBalance(): Promise<BalanceResult>
  abstract getProducts(): Promise<ProviderProduct[]>
  abstract getCost(service: string, country?: string): Promise<CostResult>
  abstract placeOrder(service: string, quantity: number, options?: Record<string, unknown>): Promise<OrderResult>
  abstract checkOrderStatus(externalOrderId: string): Promise<OrderResult>
  abstract cancelOrder(externalOrderId: string): Promise<OrderResult>

  async healthCheck(): Promise<{ status: string; latency?: number; message?: string }> {
    const start = Date.now()
    try {
      const balance = await this.getBalance()
      const latency = Date.now() - start
      return {
        status: balance.success ? "healthy" : "error",
        latency,
        message: balance.message,
      }
    } catch (error) {
      return {
        status: "error",
        latency: Date.now() - start,
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export class ProviderManager {
  private providers: Map<string, BaseProvider> = new Map()

  register(provider: BaseProvider): void {
    this.providers.set(provider.slug, provider)
  }

  get(slug: string): BaseProvider | undefined {
    return this.providers.get(slug)
  }

  getByCategory(category: "SMS" | "BOOSTING" | "ACCOUNTS"): BaseProvider[] {
    return Array.from(this.providers.values()).filter(p => p.category === category)
  }

  listAll(): { name: string; slug: string; category: string }[] {
    return Array.from(this.providers.values()).map(p => ({
      name: p.name,
      slug: p.slug,
      category: p.category,
    }))
  }

  async getBestProvider(category: "SMS" | "BOOSTING" | "ACCOUNTS"): Promise<BaseProvider | null> {
    const providers = this.getByCategory(category)
    for (const provider of providers) {
      const health = await provider.healthCheck()
      if (health.status === "healthy") {
        return provider
      }
    }
    return null
  }
}

export const providerManager = new ProviderManager()

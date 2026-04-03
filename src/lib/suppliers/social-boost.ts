import { ServiceType } from "@prisma/client"
import { BaseSupplier, SupplierProduct, PurchaseResult, HealthCheckResult, BoostStatus } from "./base"

interface NinjaBoostService {
  id: number
  platform: string
  type: string
  subtype?: string
  quantity: number
  price: number
  min: number
  max: number
  description?: string
}

interface NinjaBoostOrderResult {
  success?: boolean
  order_id?: string
  status?: string
  estimated_time?: string
  message?: string
  error?: string
}

interface NinjaBoostStatusResult {
  status?: string
  progress?: number
  completed?: number
  remaining?: number
  start_count?: number
}

export class SocialBoostSupplier extends BaseSupplier {
  async getProducts(): Promise<SupplierProduct[]> {
    try {
      const result = await this.request<{ services?: NinjaBoostService[] }>(
        `/api/services?key=${this.config.apiKey}`
      )

      const products: SupplierProduct[] = []
      
      for (const service of result.services || []) {
        products.push({
          id: `${this.config.name}-${service.id}`,
          supplierId: this.config.id || "",
          externalId: String(service.id),
          type: ServiceType.SOCIAL_BOOST,
          service: service.type.toLowerCase(),
          subService: service.subtype?.toLowerCase(),
          platform: service.platform.toLowerCase(),
          costPrice: service.price,
          costCurrency: "USD",
          stockQuantity: -1,
          isAvailable: true,
          minOrder: service.min,
          maxOrder: service.max,
          metadata: {
            description: service.description,
            quantity: service.quantity,
          },
        })
      }

      return products
    } catch (error) {
      console.error("SocialBoostSupplier getProducts error:", error)
      return []
    }
  }

  async purchase(
    productId: string,
    quantity: number,
    options?: Record<string, string>
  ): Promise<PurchaseResult> {
    try {
      const externalId = productId.split("-").pop()
      const targetUrl = options?.targetUrl || options?.link

      const body: Record<string, string> = {
        key: this.config.apiKey,
        service_id: externalId!,
        quantity: String(quantity),
      }

      if (targetUrl) {
        body.link = targetUrl
      }

      const result = await this.request<NinjaBoostOrderResult>("/api/order", {
        method: "POST",
        body: JSON.stringify(body),
      })

      if (result.success || result.order_id) {
        return {
          success: true,
          externalOrderId: String(result.order_id),
          boostStatus: result.status || "pending",
          estimatedDelivery: result.estimated_time,
        }
      }

      return {
        success: false,
        message: String(result.message || result.error || "Failed to place order"),
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: (error as Error)?.message || "Failed to place order",
      }
    }
  }

  async checkStatus(orderId: string): Promise<BoostStatus> {
    try {
      const result = await this.request<NinjaBoostStatusResult>(
        `/api/status/${orderId}?key=${this.config.apiKey}`
      )

      return {
        status: result.status || "unknown",
        progress: result.progress || 0,
        delivered: result.completed || 0,
        remaining: result.remaining || 0,
      }
    } catch {
      return {
        status: "error",
        progress: 0,
        delivered: 0,
        remaining: 0,
      }
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const start = Date.now()
      const products = await this.getProducts()
      return {
        online: true,
        latencyMs: Date.now() - start,
        balance: undefined,
      }
    } catch (error: unknown) {
      return {
        online: false,
        error: (error as Error)?.message,
      }
    }
  }

  async getBalance(): Promise<number> {
    try {
      const result = await this.request<{ balance?: number }>(
        `/api/balance?key=${this.config.apiKey}`
      )
      return result.balance || 0
    } catch {
      return 0
    }
  }

  canCancel(): boolean {
    return false
  }
}

export function createSocialBoostSupplier(config: {
  baseUrl: string
  apiKey: string
  id?: string
}): SocialBoostSupplier {
  return new SocialBoostSupplier({
    ...config,
    name: "ninjaboost",
    type: ServiceType.SOCIAL_BOOST,
  })
}

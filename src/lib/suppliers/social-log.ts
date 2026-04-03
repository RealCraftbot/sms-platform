import { ServiceType } from "@prisma/client"
import { BaseSupplier, SupplierProduct, PurchaseResult, HealthCheckResult, AccountData } from "./base"

interface AccSMTPProduct {
  id: number
  name: string
  category?: string
  price: number
  stock?: number
  description?: string
}

interface AccSMTPOrderResult {
  success?: boolean
  status?: string
  order_id?: string
  id?: string
  accounts?: Array<{ email: string; password: string; details?: unknown }>
  data?: string[]
  message?: string
  error?: string
}

export class SocialLogSupplier extends BaseSupplier {
  async getProducts(): Promise<SupplierProduct[]> {
    try {
      const result = await this.request<{
        categories?: Array<{ id: number; name: string }>
        products?: AccSMTPProduct[]
      }>(`/api/ListResource.php?username=${this.config.apiKey}&password=${this.config.apiSecret}`)

      const products: SupplierProduct[] = []
      
      for (const product of result.products || []) {
        const platform = this.detectPlatform(product.name)
        
        products.push({
          id: `${this.config.name}-${product.id}`,
          supplierId: this.config.id || "",
          externalId: String(product.id),
          type: ServiceType.SOCIAL_LOG,
          service: "aged_account",
          platform,
          costPrice: product.price,
          costCurrency: "USD",
          stockQuantity: product.stock ?? -1,
          isAvailable: (product.stock ?? 0) > 0,
          minOrder: 1,
          maxOrder: product.stock ?? 10,
          metadata: {
            category: product.category,
            description: product.description,
          },
        })
      }

      return products
    } catch (error) {
      console.error("SocialLogSupplier getProducts error:", error)
      return []
    }
  }

  private detectPlatform(name: string): string {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("instagram") || lowerName.includes("ig")) return "instagram"
    if (lowerName.includes("facebook") || lowerName.includes("fb")) return "facebook"
    if (lowerName.includes("twitter") || lowerName.includes("x.com")) return "twitter"
    if (lowerName.includes("gmail") || lowerName.includes("google")) return "gmail"
    if (lowerName.includes("tiktok")) return "tiktok"
    if (lowerName.includes("youtube")) return "youtube"
    if (lowerName.includes("telegram")) return "telegram"
    if (lowerName.includes("whatsapp")) return "whatsapp"
    return "other"
  }

  async purchase(
    productId: string,
    quantity: number,
    _options?: Record<string, string>
  ): Promise<PurchaseResult> {
    try {
      const externalId = productId.split("-").pop()
      
      const result = await this.request<AccSMTPOrderResult>(
        `/api/BResource.php?username=${this.config.apiKey}&password=${this.config.apiSecret}&id=${externalId}&amount=${quantity}`
      )

      if (result.success || result.status === "success") {
        const accounts: AccountData[] = []
        
        if (Array.isArray(result.accounts)) {
          for (const acc of result.accounts) {
            accounts.push({
              id: acc.email || String(Math.random()),
              email: acc.email,
              password: acc.password,
              meta: acc.details as Record<string, unknown>,
            })
          }
        } else if (Array.isArray(result.data)) {
          for (const item of result.data) {
            const parts = String(item).split("|")
            accounts.push({
              id: parts[0] || String(Math.random()),
              password: parts[1],
              cookies: parts[2],
            })
          }
        }

        return {
          success: true,
          externalOrderId: String(result.order_id || result.id),
          accounts,
        }
      }

      return {
        success: false,
        message: String(result.message || result.error || "Failed to purchase account"),
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: (error as Error)?.message || "Failed to purchase account",
      }
    }
  }

  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const start = Date.now()
      const balance = await this.getBalance()
      return {
        online: true,
        latencyMs: Date.now() - start,
        balance,
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
        `/api/GetBalance.php?username=${this.config.apiKey}&password=${this.config.apiSecret}`
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

export function createSocialLogSupplier(config: {
  baseUrl: string
  apiKey: string
  apiSecret: string
  id?: string
}): SocialLogSupplier {
  return new SocialLogSupplier({
    ...config,
    name: "accsmtp",
    type: ServiceType.SOCIAL_LOG,
  })
}

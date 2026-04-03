import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class ViacloneProvider extends BaseProvider {
  readonly name = "ViaClone"
  readonly slug = "viaclone"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "ACCOUNTS"
  readonly baseUrl = "https://viaclone.net/client/api"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  private authHeaders() {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    }
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: true,
        balance: data.balance || data.wallet || 0,
        currency: data.currency ?? "USD",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get balance",
      }
    }
  }

  async getProducts(): Promise<ProviderProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      if (Array.isArray(data)) {
        return data.map((p: any) => ({
          id: String(p.id),
          externalId: String(p.id),
          service: p.name || p.category || "accounts",
          platform: p.platform || p.category,
          cost: parseFloat(p.price) || 0,
          currency: "USD",
          stock: p.stock || p.quantity || -1,
          minQuantity: 1,
          maxQuantity: p.max_quantity || 100,
        }))
      }
      
      return []
    } catch {
      return []
    }
  }

  async getCost(service: string, country?: string): Promise<CostResult> {
    try {
      const response = await fetch(`${this.baseUrl}/product/${service}/price`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: true,
        cost: parseFloat(data.price) || 0,
        currency: "USD",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get cost",
      }
    }
  }

  async placeOrder(productId: string, quantity: number, options?: Record<string, unknown>): Promise<OrderResult> {
    try {
      const response = await fetch(`${this.baseUrl}/order`, {
        method: "POST",
        headers: this.authHeaders(),
        body: JSON.stringify({
          product_id: productId,
          quantity,
          ...options,
        }),
      })
      const data = await response.json()
      
      return {
        success: data.success || data.status === "completed",
        externalOrderId: data.order_id || data.id,
        message: data.message || "Order placed",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to place order",
      }
    }
  }

  async checkOrderStatus(externalOrderId: string): Promise<OrderResult> {
    try {
      const response = await fetch(`${this.baseUrl}/order/${externalOrderId}`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: true,
        externalOrderId,
        message: data.status || data.state,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to check order",
      }
    }
  }

  async cancelOrder(externalOrderId: string): Promise<OrderResult> {
    return {
      success: false,
      externalOrderId,
      message: "Cancellation not supported",
    }
  }
}

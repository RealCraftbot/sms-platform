import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class FiveSimProvider extends BaseProvider {
  readonly name = "5Sim"
  readonly slug = "fivesim"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "SMS"
  readonly baseUrl = "https://5sim.net/v1"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  private authHeaders() {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Accept": "application/json",
    }
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: true,
        balance: data.balance || 0,
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
      const response = await fetch(`${this.baseUrl}/guest/prices`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      const products: ProviderProduct[] = []
      
      for (const [country, services] of Object.entries(data as Record<string, Record<string, { cost: number }>>)) {
        for (const [service, details] of Object.entries(services)) {
          products.push({
            id: `${country}_${service}`,
            externalId: `${country}_${service}`,
            service,
            country,
            cost: details.cost,
            currency: "USD",
            stock: -1,
            minQuantity: 1,
            maxQuantity: 10,
          })
        }
      }
      
      return products
    } catch {
      return []
    }
  }

  async getCost(service: string, country?: string): Promise<CostResult> {
    try {
      const response = await fetch(`${this.baseUrl}/guest/prices?country=${country || "any"}&product=${service}`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: true,
        cost: data.cost || 0,
        currency: "USD",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get cost",
      }
    }
  }

  async placeOrder(service: string, quantity: number, options?: Record<string, unknown>): Promise<OrderResult> {
    try {
      const response = await fetch(`${this.baseUrl}/user/buy/activation/${options?.country || "any"}/${service}`, {
        method: "GET",
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: data.id > 0,
        externalOrderId: String(data.id),
        phoneNumber: data.phone,
        message: data.status || "Order placed",
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
      const response = await fetch(`${this.baseUrl}/user/check/${externalOrderId}`, {
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: true,
        externalOrderId,
        phoneNumber: data.phone,
        message: data.status,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to check order",
      }
    }
  }

  async cancelOrder(externalOrderId: string): Promise<OrderResult> {
    try {
      const response = await fetch(`${this.baseUrl}/user/cancel/${externalOrderId}`, {
        method: "GET",
        headers: this.authHeaders(),
      })
      const data = await response.json()
      
      return {
        success: data === "OK",
        externalOrderId,
        message: data === "OK" ? "Order cancelled" : "Cannot cancel order",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel order",
      }
    }
  }
}

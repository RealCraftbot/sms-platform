import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class FullsmmProvider extends BaseProvider {
  readonly name = "FullSMM"
  readonly slug = "fullsmm"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "BOOSTING"
  readonly baseUrl = "https://fullsmm.com/api"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const data = await this.request<{ balance: string; currency: string }>("/balance", "POST", {
        key: this.apiKey,
      })
      return {
        success: true,
        balance: parseFloat(data.balance),
        currency: data.currency || "USD",
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
      const data = await this.request<Record<string, { name: string; price: number; min: number; max: number }>>("/services", "POST", {
        key: this.apiKey,
      })
      const products: ProviderProduct[] = []

      for (const [id, service] of Object.entries(data)) {
        products.push({
          id,
          externalId: id,
          service: service.name.toLowerCase().replace(/\s+/g, "_"),
          cost: service.price,
          currency: "USD",
          stock: -1,
          minQuantity: service.min,
          maxQuantity: service.max,
        })
      }

      return products
    } catch {
      return []
    }
  }

  async getCost(service: string, country?: string): Promise<CostResult> {
    try {
      const data = await this.request<{ price: number; amount: number }>("/price", "POST", {
        key: this.apiKey,
        service,
        country: country || "global",
      })
      return {
        success: true,
        cost: data.price,
        currency: "USD",
        stock: -1,
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
      const data = await this.request<{ order_id: string; status: string; charge: number }>("/order", "POST", {
        key: this.apiKey,
        service,
        link: options?.link as string,
        quantity,
      })
      return {
        success: data.status === "completed",
        externalOrderId: data.order_id,
        message: data.status,
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
      const data = await this.request<{ status: string; remains: number }>("/order/status", "POST", {
        key: this.apiKey,
        order_id: externalOrderId,
      })
      return {
        success: true,
        externalOrderId,
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
      const data = await this.request<{ status: string }>("/order/cancel", "POST", {
        key: this.apiKey,
        order_id: externalOrderId,
      })
      return {
        success: data.status === "cancelled",
        externalOrderId,
        message: data.status,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel order",
      }
    }
  }
}

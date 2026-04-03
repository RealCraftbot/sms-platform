import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class FortunesmmProvider extends BaseProvider {
  readonly name = "FortuneSMM"
  readonly slug = "fortunesmm"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "BOOSTING"
  readonly baseUrl = "https://fortunesmm.com/api/v1"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const data = await this.request<{ balance: number; currency: string }>("/user/balance", "GET")
      return {
        success: true,
        balance: data.balance,
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
      const data = await this.request<{ services: Array<{ id: string; name: string; price: number; min: number; max: number }> }>("/services", "GET")
      const products: ProviderProduct[] = []

      for (const service of data.services || []) {
        products.push({
          id: service.id,
          externalId: service.id,
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
      const data = await this.request<{ price: number; min: number; max: number }>(`/price/${service}`, "GET")
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
      const data = await this.request<{ order_id: string; status: string }>("/order/create", "POST", {
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
      const data = await this.request<{ status: string; progress: number }>(`/order/${externalOrderId}`, "GET")
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
      const data = await this.request<{ status: string }>(`/order/${externalOrderId}/cancel`, "POST")
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

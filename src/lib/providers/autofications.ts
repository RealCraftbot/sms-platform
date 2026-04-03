import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class AutoficationsProvider extends BaseProvider {
  readonly name = "Autofications"
  readonly slug = "autofications"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "SMS"
  readonly baseUrl = "https://autofications.com/api/v1"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const data = await this.request<{ balance: number; currency: string }>("/balance", "GET")
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
      const data = await this.request<{ services: Record<string, { id: string; name: string; cost: number }> }>("/services", "GET")
      const products: ProviderProduct[] = []

      for (const [id, service] of Object.entries(data.services || {})) {
        products.push({
          id,
          externalId: id,
          service: service.name.toLowerCase().replace(/\s+/g, "_"),
          cost: service.cost,
          currency: "USD",
          stock: -1,
          minQuantity: 1,
          maxQuantity: 100,
        })
      }

      return products
    } catch {
      return []
    }
  }

  async getCost(service: string, country?: string): Promise<CostResult> {
    try {
      const data = await this.request<{ cost: number; stock: number }>(`/cost/${service}`, "GET", {
        country: country || "ng",
      })
      return {
        success: true,
        cost: data.cost,
        currency: "USD",
        stock: data.stock,
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
      const data = await this.request<{ order_id: string; phone: string; status: string }>("/order", "POST", {
        service,
        country: (options?.country as string) || "ng",
        quantity,
      })
      return {
        success: data.status === "completed",
        externalOrderId: data.order_id,
        phoneNumber: data.phone,
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
      const data = await this.request<{ status: string; sms?: string }>(`/order/${externalOrderId}`, "GET")
      return {
        success: true,
        externalOrderId,
        phoneNumber: data.sms,
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

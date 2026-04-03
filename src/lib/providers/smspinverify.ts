import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class SmspinverifyProvider extends BaseProvider {
  readonly name = "SmsPinVerify"
  readonly slug = "smspinverify"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "SMS"
  readonly baseUrl = "https://smspinverify.com/api"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const data = await this.request<{ balance: string; status: string }>("/balance", "POST", {
        api_key: this.apiKey,
      })
      return {
        success: true,
        balance: parseFloat(data.balance),
        currency: "USD",
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
      const data = await this.request<Record<string, { name: string; price: number }>>("/services", "POST", {
        api_key: this.apiKey,
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
      const data = await this.request<{ price: number; availability: number }>("/price", "POST", {
        api_key: this.apiKey,
        service,
        country: country || "ng",
      })
      return {
        success: true,
        cost: data.price,
        currency: "USD",
        stock: data.availability,
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
        api_key: this.apiKey,
        service,
        country: (options?.country as string) || "ng",
        quantity,
      })
      return {
        success: data.status === "success",
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
      const data = await this.request<{ status: string; sms?: string }>("/status", "POST", {
        api_key: this.apiKey,
        order_id: externalOrderId,
      })
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
      const data = await this.request<{ status: string }>("/cancel", "POST", {
        api_key: this.apiKey,
        order_id: externalOrderId,
      })
      return {
        success: data.status === "success",
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

import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

export class SellclonegiareProvider extends BaseProvider {
  readonly name = "SellCloneGiare"
  readonly slug = "sellclonegiare"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "ACCOUNTS"
  readonly baseUrl = "https://sellclonegiare.com/api"
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
      const data = await this.request<{ products: Array<{ id: string; name: string; price: number; stock: number; category: string }> }>("/products", "GET")
      const products: ProviderProduct[] = []

      for (const product of data.products || []) {
        products.push({
          id: product.id,
          externalId: product.id,
          service: product.name.toLowerCase().replace(/\s+/g, "_"),
          platform: product.category.toLowerCase(),
          cost: product.price,
          currency: "USD",
          stock: product.stock,
          minQuantity: 1,
          maxQuantity: product.stock,
        })
      }

      return products
    } catch {
      return []
    }
  }

  async getCost(service: string, country?: string): Promise<CostResult> {
    try {
      const data = await this.request<{ price: number; stock: number }>(`/price/${service}`, "GET")
      return {
        success: true,
        cost: data.price,
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
      const data = await this.request<{ order_id: string; account_details: string; status: string }>("/order", "POST", {
        product_id: service,
        quantity,
      })
      return {
        success: data.status === "delivered",
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
      const data = await this.request<{ status: string; account_details?: string }>(`/order/${externalOrderId}`, "GET")
      return {
        success: true,
        externalOrderId,
        phoneNumber: data.account_details,
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

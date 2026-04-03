import { BaseProvider, ProviderProduct, BalanceResult, CostResult, OrderResult } from "./base"

interface SMSPoolService {
  id: string
  name: string
}

interface SMSPoolCountry {
  id: string
  name: string
  code: string
}

export class SMSPoolProvider extends BaseProvider {
  readonly name = "SMSPool"
  readonly slug = "smspool"
  readonly category: "SMS" | "BOOSTING" | "ACCOUNTS" = "SMS"
  readonly baseUrl = "https://api.smspool.net"
  readonly apiKey: string

  constructor(apiKey: string) {
    super()
    this.apiKey = apiKey
  }

  async getBalance(): Promise<BalanceResult> {
    try {
      const data = await this.request<{ balance: string }>("/balance", "POST", { key: this.apiKey })
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
      const data = await this.request<Record<string, string>>("/service/retrieve_all")
      const products: ProviderProduct[] = []
      
      for (const [id, name] of Object.entries(data)) {
        if (id !== "success" && id !== "message") {
          products.push({
            id,
            externalId: id,
            service: name.toLowerCase().replace(/\s+/g, "_"),
            cost: 0,
            currency: "USD",
            stock: -1,
            minQuantity: 1,
            maxQuantity: 100,
          })
        }
      }
      
      return products
    } catch {
      return []
    }
  }

  async getCost(serviceId: string, country?: string): Promise<CostResult> {
    try {
      const data = await this.request<Record<string, unknown>>("/price/retrieve", "POST", {
        key: this.apiKey,
        service: serviceId,
        country: country || "ng",
      })
      
      return {
        success: true,
        cost: typeof data.price === "number" ? data.price : parseFloat(String(data.price)) || 0,
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

  async placeOrder(serviceId: string, quantity: number, options?: Record<string, unknown>): Promise<OrderResult> {
    try {
      const data = await this.request<{ order_id: string; number: string; status: number }>("/purchase/create", "POST", {
        key: this.apiKey,
        service: serviceId,
        country: (options?.country as string) || "ng",
        quantity,
      })
      
      return {
        success: data.status === 1 || data.status === 200,
        externalOrderId: data.order_id,
        phoneNumber: data.number,
        message: data.status === 1 ? "Order placed successfully" : "Order pending",
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
      const data = await this.request<{ status: string; sms?: string; code?: string }>("/order/status", "POST", {
        key: this.apiKey,
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
      const data = await this.request<{ status: number }>("/order/cancel", "POST", {
        key: this.apiKey,
        order_id: externalOrderId,
      })
      
      return {
        success: data.status === 1,
        externalOrderId,
        message: data.status === 1 ? "Order cancelled" : "Cannot cancel order",
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to cancel order",
      }
    }
  }
}

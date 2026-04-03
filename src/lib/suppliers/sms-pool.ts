import { ServiceType } from "@prisma/client"
import { BaseSupplier, SupplierProduct, PurchaseResult, SMSCheckResult, HealthCheckResult } from "./base"

interface SMSPoolProduct {
  id: string
  name: string
  price: number
  country?: string
  country_name?: string
}

interface SMSPoolCountry {
  id: string
  name: string
  code: string
}

export class SMSPoolSupplier extends BaseSupplier {
  async getProducts(): Promise<SupplierProduct[]> {
    try {
      const [servicesResult, countriesResult] = await Promise.all([
        this.requestFormData<{ services?: SMSPoolProduct[] }>("/service/retrieve_all", {}),
        this.requestFormData<{ countries?: SMSPoolCountry[] }>("/country/retrieve_all", {}),
      ])

      const countries = new Map(
        (countriesResult.countries || []).map((c) => [c.id, c])
      )

      const products: SupplierProduct[] = []
      
      for (const service of servicesResult.services || []) {
        products.push({
          id: `${this.config.name}-${service.country || "global"}-${service.id}`,
          supplierId: this.config.id || "",
          externalId: String(service.id),
          type: ServiceType.SMS_NUMBER,
          service: service.name.toLowerCase(),
          country: service.country || service.country_name,
          costPrice: service.price,
          costCurrency: "USD",
          stockQuantity: -1,
          isAvailable: service.price > 0,
          minOrder: 1,
          maxOrder: 1,
        })
      }

      return products
    } catch (error) {
      console.error("SMSPool getProducts error:", error)
      return []
    }
  }

  async purchase(
    productId: string,
    _quantity: number,
    options?: Record<string, string>
  ): Promise<PurchaseResult> {
    try {
      const [service, country] = productId.split("-").slice(1)
      
      const result = await this.requestFormData<{
        success?: number | boolean
        orderid?: string
        order_id?: string
        phonenumber?: string
        phone?: string
        number?: string
        message?: string
        error?: string
      }>("/purchase/sms", {
        service,
        country,
        ...options,
      })

      if (result.success === 1 || result.success === true || result.orderid) {
        return {
          success: true,
          externalOrderId: String(result.orderid || result.order_id),
          phoneNumber: String(result.phonenumber || result.phone || result.number),
          expiresAt: new Date(Date.now() + 20 * 60 * 1000),
        }
      }

      return {
        success: false,
        message: String(result.message || result.error || "Failed to purchase number"),
      }
    } catch (error: unknown) {
      const err = error as Error
      return {
        success: false,
        message: err?.message || "Failed to purchase number",
      }
    }
  }

  async checkSms(orderId: string): Promise<SMSCheckResult> {
    try {
      const result = await this.requestFormData<{
        success?: number | boolean
        code?: string
        sms?: string
        full_code?: string
        message?: string
      }>("/sms/check", { orderid: orderId })

      if (result.success === 1 || result.success === true || result.code) {
        return {
          success: true,
          code: String(result.code || result.sms || ""),
          text: String(result.full_code || result.sms || ""),
        }
      }

      return {
        success: false,
        message: String(result.message || "SMS not received yet"),
      }
    } catch (error: unknown) {
      const err = error as Error
      return {
        success: false,
        message: err?.message || "Failed to check SMS",
      }
    }
  }

  async cancel(orderId: string): Promise<boolean> {
    try {
      const result = await this.requestFormData<{ success?: number }>("/sms/cancel", {
        orderid: orderId,
      })
      return result.success === 1
    } catch {
      return false
    }
  }

  canCancel(): boolean {
    return true
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
      const result = await this.requestFormData<{ balance?: string }>("/request/balance", {})
      return parseFloat(result.balance || "0")
    } catch {
      return 0
    }
  }
}

export function createSMSPoolSupplier(config: { apiKey: string; id?: string }): SMSPoolSupplier {
  return new SMSPoolSupplier({
    ...config,
    name: "smspool",
    type: ServiceType.SMS_NUMBER,
    baseUrl: "https://api.smspool.net",
  })
}

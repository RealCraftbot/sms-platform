const SMSPOOL_BASE_URL = "https://api.smspool.net"

interface SMSPoolConfig {
  apiKey: string
}

interface ServiceInfo {
  id: string
  name: string
}

interface CountryInfo {
  id: string
  name: string
  code?: string
}

interface PoolInfo {
  id: string
  name: string
}

interface SMSResult {
  success: boolean
  orderId?: string
  phoneNumber?: string
  message?: string
}

interface SMSCheckResult {
  success: boolean
  sms?: string
  code?: string
  message?: string
}

export class SMSPool {
  private apiKey: string

  constructor(config: SMSPoolConfig) {
    this.apiKey = config.apiKey
  }

  private async post<T>(endpoint: string, data: Record<string, string | number | undefined> = {}): Promise<T> {
    const formData = new URLSearchParams()
    formData.append("key", this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        formData.append(key, String(value))
      }
    }

    const response = await fetch(`${SMSPOOL_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`SMSPool API error: ${response.status}`)
    }

    return response.json()
  }

  async getServices(): Promise<ServiceInfo[]> {
    try {
      const result = await this.post<Record<string, string>>("/service/retrieve_all", {})
      const services: ServiceInfo[] = []
      
      for (const [id, name] of Object.entries(result)) {
        if (id !== "success" && id !== "message") {
          services.push({ id, name })
        }
      }
      
      return services
    } catch (error) {
      console.error("SMSPool getServices error:", error)
      return []
    }
  }

  async getCountries(): Promise<CountryInfo[]> {
    try {
      const result = await this.post<Record<string, unknown>>("/country/retrieve_all", {})
      const countries = (result.countries || result) as unknown[]
      if (Array.isArray(countries)) {
        return countries.map((c) => {
          const country = c as Record<string, unknown>
          return {
            id: String(country.id || country.code || c),
            name: String(country.name || country.country || c),
            code: String(country.code || country.iso || ""),
          }
        })
      }
      return []
    } catch (error) {
      console.error("SMSPool getCountries error:", error)
      return []
    }
  }

  async getPools(): Promise<PoolInfo[]> {
    try {
      const result = await this.post<Record<string, unknown>>("/pool/retrieve_all", {})
      return (result.pools || result || []) as PoolInfo[]
    } catch (error) {
      console.error("SMSPool getPools error:", error)
      return []
    }
  }

  async getBalance(): Promise<number> {
    try {
      const result = await this.post<{ balance?: string }>("/request/balance", {})
      return parseFloat(result.balance || "0")
    } catch (error) {
      console.error("SMSPool getBalance error:", error)
      return 0
    }
  }

  async getPricing(): Promise<unknown[]> {
    try {
      const result = await this.post<Record<string, unknown>>("/request/pricing", {})
      return (result.pricing || result || []) as unknown[]
    } catch (error) {
      console.error("SMSPool getPricing error:", error)
      return []
    }
  }

  async getPrice(country: string, service: string, pool?: string): Promise<{ price: number; success_rate: number }> {
    try {
      const data: Record<string, string | number | undefined> = { country, service }
      if (pool) data.pool = pool
      const result = await this.post<Record<string, unknown>>("/request/price", data)
      return {
        price: parseFloat(String(result.price || 0)),
        success_rate: parseFloat(String(result.success_rate || 0)),
      }
    } catch (error) {
      console.error("SMSPool getPrice error:", error)
      return { price: 0, success_rate: 0 }
    }
  }

  async buyNumber(service: string, country: string, options?: {
    pool?: string
    max_price?: number
    pricing_option?: number
    quantity?: number
  }): Promise<SMSResult> {
    try {
      const data: Record<string, string | number | undefined> = {
        service,
        country,
      }
      if (options?.pool) data.pool = options.pool
      if (options?.max_price) data.max_price = options.max_price
      if (options?.pricing_option) data.pricing_option = options.pricing_option
      if (options?.quantity) data.quantity = options.quantity

      const result = await this.post<Record<string, unknown>>("/purchase/sms", data)

      if (result.success === 1 || result.success === true || result.orderid || result.phonenumber) {
        return {
          success: true,
          orderId: String(result.orderid || result.order_id || ""),
          phoneNumber: String(result.phonenumber || result.phone || result.number || ""),
          message: String(result.message || ""),
        }
      }

      return {
        success: false,
        message: String(result.message || result.error || "Failed to purchase number"),
      }
    } catch (error: unknown) {
      console.error("SMSPool buyNumber error:", error)
      const err = error as Error
      return {
        success: false,
        message: err?.message || "Failed to purchase number",
      }
    }
  }

  async getSms(orderId: string): Promise<SMSCheckResult> {
    try {
      const result = await this.post<Record<string, unknown>>("/sms/check", { orderid: orderId })

      if (result.success === 1 || result.code || result.sms) {
        return {
          success: true,
          code: String(result.code || result.sms || ""),
          sms: String(result.sms || result.full_code || ""),
        }
      }

      return {
        success: false,
        message: String(result.message || "SMS not received yet"),
      }
    } catch (error: unknown) {
      console.error("SMSPool getSms error:", error)
      const err = error as Error
      return {
        success: false,
        message: err?.message || "Failed to check SMS",
      }
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await this.post<{ success: number; message?: string }>("/sms/cancel", { orderid: orderId })
      return {
        success: result.success === 1,
        message: result.message,
      }
    } catch (error: unknown) {
      console.error("SMSPool cancelOrder error:", error)
      const err = error as Error
      return {
        success: false,
        message: err?.message,
      }
    }
  }

  async getActiveOrders(): Promise<unknown[]> {
    try {
      const result = await this.post<Record<string, unknown>>("/request/active", {})
      return (result.orders || result || []) as unknown[]
    } catch (error) {
      console.error("SMSPool getActiveOrders error:", error)
      return []
    }
  }

  async getOrderHistory(start: number = 0, length: number = 100): Promise<unknown[]> {
    try {
      const result = await this.post<Record<string, unknown>>("/request/history", { start, length })
      return (result.orders || result || []) as unknown[]
    } catch (error) {
      console.error("SMSPool getOrderHistory error:", error)
      return []
    }
  }

  async resendSms(orderId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await this.post<{ success: number; message?: string }>("/sms/resend", { orderid: orderId })
      return {
        success: result.success === 1,
        message: result.message,
      }
    } catch (error: unknown) {
      console.error("SMSPool resendSms error:", error)
      const err = error as Error
      return {
        success: false,
        message: err?.message,
      }
    }
  }
}

export function getSMSPool(): SMSPool {
  const apiKey = process.env.SMSPOOL_API_KEY
  if (!apiKey) {
    throw new Error("SMSPOOL_API_KEY is not set")
  }
  return new SMSPool({ apiKey })
}
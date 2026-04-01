const ACCTSHOP_BASE_URL = "https://acctshop.com/api"

interface AcctShopConfig {
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

export class AcctShop {
  private apiKey: string

  constructor(config: AcctShopConfig) {
    this.apiKey = config.apiKey
  }

  private async request<T>(endpoint: string, data: Record<string, string> = {}): Promise<T> {
    const formData = new URLSearchParams()
    formData.append("key", this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }

    const response = await fetch(`${ACCTSHOP_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`AcctShop API error: ${response.status}`)
    }

    return response.json()
  }

  async getServices(): Promise<ServiceInfo[]> {
    try {
      const result = await this.request<any[]>("/services", {})
      return result.map(s => ({
        id: s.id || s.service || s,
        name: s.name || s.service || s,
      }))
    } catch (error) {
      console.error("AcctShop getServices error:", error)
      return this.getFallbackServices()
    }
  }

  async getCountries(): Promise<CountryInfo[]> {
    try {
      const result = await this.request<any[]>("/countries", {})
      return result.map(c => ({
        id: c.id || c.code || c.country || c,
        name: c.name || c.country || c,
        code: c.code || c.id,
      }))
    } catch (error) {
      console.error("AcctShop getCountries error:", error)
      return this.getFallbackCountries()
    }
  }

  private getFallbackServices(): ServiceInfo[] {
    return [
      { id: "instagram", name: "Instagram" },
      { id: "facebook", name: "Facebook" },
      { id: "twitter", name: "Twitter" },
      { id: "tiktok", name: "TikTok" },
      { id: "snapchat", name: "Snapchat" },
      { id: "linkedin", name: "LinkedIn" },
    ]
  }

  private getFallbackCountries(): CountryInfo[] {
    return [
      { id: "ng", name: "Nigeria", code: "+234" },
      { id: "us", name: "United States", code: "+1" },
      { id: "uk", name: "United Kingdom", code: "+44" },
      { id: "ca", name: "Canada", code: "+1" },
      { id: "gh", name: "Ghana", code: "+233" },
    ]
  }

  async buyNumber(service: string, country: string): Promise<{
    success: boolean
    orderId?: string
    phoneNumber?: string
    message?: string
  }> {
    const data = {
      service,
      country,
    }

    const result = await this.request<BuyResponse>("/buy", data)

    return {
      success: result.success === true || Number(result.success) === 1,
      orderId: result.order_id,
      phoneNumber: result.phone,
      message: result.message,
    }
  }

  async getSms(orderId: string): Promise<{
    success: boolean
    sms?: string
    code?: string
    message?: string
  }> {
    const data = {
      order_id: orderId,
    }

    const result = await this.request<GetSmsResponse>("/sms", data)

    return {
      success: result.success === true || Number(result.success) === 1,
      sms: result.sms,
      code: result.code,
      message: result.message,
    }
  }

  async cancelOrder(orderId: string): Promise<{
    success: boolean
    message?: string
  }> {
    const data = {
      order_id: orderId,
    }

    const result = await this.request<{ success: boolean | number; message?: string }>("/cancel", data)

    return {
      success: result.success === true || Number(result.success) === 1,
      message: result.message,
    }
  }
}

interface BuyResponse {
  success: boolean | number
  order_id?: string
  phone?: string
  message?: string
}

interface GetSmsResponse {
  success: boolean | number
  sms?: string
  code?: string
  message?: string
}

let acctshopInstance: AcctShop | null = null

export function getAcctShop(): AcctShop {
  if (!acctshopInstance) {
    const apiKey = process.env.ACCTSHOP_API_KEY
    if (!apiKey || apiKey === "your-acctshop-api-key") {
      throw new Error("AcctShop API key not configured")
    }
    acctshopInstance = new AcctShop({ apiKey })
  }
  return acctshopInstance
}
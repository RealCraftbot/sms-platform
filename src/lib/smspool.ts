const SMSPOOL_BASE_URL = "https://smspool.net/api"

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

interface ServicePrice {
  service: string
  country: string
  price: number
}

export class SMSPool {
  private apiKey: string

  constructor(config: SMSPoolConfig) {
    this.apiKey = config.apiKey
  }

  private async request<T>(endpoint: string, data: Record<string, string> = {}): Promise<T> {
    const formData = new URLSearchParams()
    formData.append("key", this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }

    const response = await fetch(`${SMSPOOL_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`SMSPool API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getServices(): Promise<ServiceInfo[]> {
    try {
      const result = await this.request<any[]>("/services/", {})
      return result.map(s => ({
        id: s.id || s.service || s,
        name: s.name || s.service || s,
      }))
    } catch (error) {
      console.error("SMSPool getServices error:", error)
      return this.getFallbackServices()
    }
  }

  async getCountries(): Promise<CountryInfo[]> {
    try {
      const result = await this.request<any[]>("/countries/", {})
      return result.map(c => ({
        id: c.id || c.code || c.country || c,
        name: c.name || c.country || c,
        code: c.code || c.id,
      }))
    } catch (error) {
      console.error("SMSPool getCountries error:", error)
      return this.getFallbackCountries()
    }
  }

  async getServicePrices(service: string): Promise<ServicePrice[]> {
    try {
      const result = await this.request<any[]>(`/prices/`, { service })
      return result.map(p => ({
        service,
        country: p.country || p.country_code,
        price: p.price || p.cost || 0,
      }))
    } catch (error) {
      console.error("SMSPool getServicePrices error:", error)
      return []
    }
  }

  private getFallbackServices(): ServiceInfo[] {
    return [
      { id: "whatsapp", name: "WhatsApp" },
      { id: "instagram", name: "Instagram" },
      { id: "telegram", name: "Telegram" },
      { id: "facebook", name: "Facebook" },
      { id: "google", name: "Google" },
      { id: "twitter", name: "Twitter" },
      { id: "tiktok", name: "TikTok" },
      { id: "discord", name: "Discord" },
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
      { id: "ke", name: "Kenya", code: "+254" },
      { id: "za", name: "South Africa", code: "+27" },
      { id: "in", name: "India", code: "+91" },
      { id: "id", name: "Indonesia", code: "+62" },
      { id: "ph", name: "Philippines", code: "+63" },
      { id: "de", name: "Germany", code: "+49" },
      { id: "fr", name: "France", code: "+33" },
      { id: "es", name: "Spain", code: "+34" },
      { id: "it", name: "Italy", code: "+39" },
      { id: "br", name: "Brazil", code: "+55" },
      { id: "mx", name: "Mexico", code: "+52" },
      { id: "ru", name: "Russia", code: "+7" },
      { id: "jp", name: "Japan", code: "+81" },
      { id: "kr", name: "South Korea", code: "+82" },
      { id: "au", name: "Australia", code: "+61" },
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

    const result = await this.request<BuyNumberResponse>("/buy/", data)

    return {
      success: result.success === 1,
      orderId: result.order_id,
      phoneNumber: result.phone_number,
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

    const result = await this.request<GetSmsResponse>("/sms/", data)

    return {
      success: !!result.sms,
      sms: result.sms,
      code: result.code,
      message: result.status,
    }
  }

  async cancelOrder(orderId: string): Promise<{
    success: boolean
    message?: string
  }> {
    const data = {
      order_id: orderId,
    }

    const result = await this.request<{ success: number; message?: string }>("/cancel/", data)

    return {
      success: result.success === 1,
      message: result.message,
    }
  }

  async getStatus(orderId: string): Promise<{
    success: boolean
    status?: string
    phone_number?: string
  }> {
    const data = {
      order_id: orderId,
    }

    const result = await this.request<{ success: number; status?: string; phone_number?: string }>("/status/", data)

    return {
      success: result.success === 1,
      status: result.status,
      phone_number: result.phone_number,
    }
  }
}

interface BuyNumberResponse {
  success: number
  order_id?: string
  phone_number?: string
  message?: string
}

interface GetSmsResponse {
  sms?: string
  code?: string
  status?: string
}

let smspoolInstance: SMSPool | null = null

export function getSMSPool(): SMSPool {
  if (!smspoolInstance) {
    const apiKey = process.env.SMSPOOL_API_KEY
    if (!apiKey || apiKey === "your-smspool-api-key") {
      throw new Error("SMSPool API key not configured. Please set SMSPOOL_API_KEY in .env")
    }
    smspoolInstance = new SMSPool({ apiKey })
  }
  return smspoolInstance
}
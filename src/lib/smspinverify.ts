const SMSPINVERIFY_BASE_URL = "https://smspinverify.com/api"

interface SMSPinVerifyConfig {
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

export class SMSPinVerify {
  private apiKey: string

  constructor(config: SMSPinVerifyConfig) {
    this.apiKey = config.apiKey
  }

  private async request<T>(endpoint: string, data: Record<string, string>): Promise<T> {
    const formData = new URLSearchParams()
    formData.append("api_key", this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }

    const response = await fetch(`${SMSPINVERIFY_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`SMSPinVerify API error: ${response.status}`)
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
      console.error("SMSPinVerify getServices error:", error)
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
      console.error("SMSPinVerify getCountries error:", error)
      return this.getFallbackCountries()
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

    const result = await this.request<BuyNumberResponse>("/buy_number", data)

    return {
      success: result.status === "success",
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

    const result = await this.request<GetSmsResponse>("/get_sms", data)

    return {
      success: result.status === "success",
      sms: result.sms,
      code: result.code,
    }
  }

  async cancelOrder(orderId: string): Promise<{
    success: boolean
    message?: string
  }> {
    const data = {
      order_id: orderId,
    }

    const result = await this.request<{ status: string; message?: string }>("/cancel_number", data)

    return {
      success: result.status === "success",
      message: result.message,
    }
  }
}

interface BuyNumberResponse {
  status: string
  phone?: string
  order_id?: string
  message?: string
}

interface GetSmsResponse {
  status: string
  sms?: string
  code?: string
}

let smspinverifyInstance: SMSPinVerify | null = null

export function getSMSPinVerify(): SMSPinVerify {
  if (!smspinverifyInstance) {
    const apiKey = process.env.SMSPINVERIFY_API_KEY
    if (!apiKey || apiKey === "your-smspinverify-api-key") {
      throw new Error("SMSPinVerify API key not configured")
    }
    smspinverifyInstance = new SMSPinVerify({ apiKey })
  }
  return smspinverifyInstance
}
const TUTADS_BASE_URL = "https://tutads.net/api"

interface TutAdsConfig {
  apiKey: string
}

interface BuyResponse {
  status: string
  order_id?: string
  phone?: string
  message?: string
}

interface GetSmsResponse {
  status: string
  sms?: string
  code?: string
  message?: string
}

export class TutAds {
  private apiKey: string

  constructor(config: TutAdsConfig) {
    this.apiKey = config.apiKey
  }

  private async request<T>(endpoint: string, data: Record<string, string>): Promise<T> {
    const formData = new URLSearchParams()
    formData.append("key", this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value)
    }

    const response = await fetch(`${TUTADS_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`TutAds API error: ${response.status}`)
    }

    return response.json()
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
      success: result.status === "success" || result.status === "1",
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
      success: result.status === "success",
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

    const result = await this.request<{ status: string; message?: string }>("/cancel", data)

    return {
      success: result.status === "success",
      message: result.message,
    }
  }
}

let tutadsInstance: TutAds | null = null

export function getTutAds(): TutAds {
  if (!tutadsInstance) {
    const apiKey = process.env.TUTADS_API_KEY
    if (!apiKey || apiKey === "your-tutads-api-key") {
      throw new Error("TutAds API key not configured")
    }
    tutadsInstance = new TutAds({ apiKey })
  }
  return tutadsInstance
}
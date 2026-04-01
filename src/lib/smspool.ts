import crypto from "crypto"

const SMSPOOL_BASE_URL = "https://smspool.net/api"

interface SMSPoolConfig {
  apiKey: string
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

export class SMSPool {
  private apiKey: string

  constructor(config: SMSPoolConfig) {
    this.apiKey = config.apiKey
  }

  private async request<T>(endpoint: string, data: Record<string, string>): Promise<T> {
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
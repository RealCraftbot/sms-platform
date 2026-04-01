const SMSPINVERIFY_BASE_URL = "https://smspinverify.com/api"

interface SMSPinVerifyConfig {
  apiKey: string
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
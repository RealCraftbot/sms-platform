const SMSACTIVATE_BASE_URL = "https://sms-activate.org/stubs/handler_api"

interface SMSActivateConfig {
  apiKey: string
}

interface BuyNumberResponse {
  activation?: {
    id: number
    phone: string
  }
  refund?: number
  message?: string
}

interface GetSmsResponse {
  code?: string
  status: string
}

export class SMSActivate {
  private apiKey: string

  constructor(config: SMSActivateConfig) {
    this.apiKey = config.apiKey
  }

  private async request<T>(action: string, params: Record<string, string | number> = {}): Promise<T> {
    const urlParams = new URLSearchParams()
    urlParams.append("api_key", this.apiKey)
    urlParams.append("action", action)
    
    for (const [key, value] of Object.entries(params)) {
      urlParams.append(key, value.toString())
    }

    const response = await fetch(`${SMSACTIVATE_BASE_URL}?${urlParams.toString()}`)

    if (!response.ok) {
      throw new Error(`SMS-Activate API error: ${response.status}`)
    }

    const text = await response.text()
    
    if (text.includes("NO_ACTIVATION") || text.includes("BAD_KEY") || text.includes("ERROR")) {
      throw new Error(`SMS-Activate API error: ${text}`)
    }

    return JSON.parse(text)
  }

  async buyNumber(service: string, country: string): Promise<{
    success: boolean
    orderId?: string
    phoneNumber?: string
    message?: string
  }> {
    try {
      const result = await this.request<BuyNumberResponse>("getNumber", {
        service,
        country,
        ref: "platform",
      })

      if (result.activation) {
        return {
          success: true,
          orderId: result.activation.id.toString(),
          phoneNumber: result.activation.phone,
        }
      }

      return {
        success: false,
        message: result.message || "Failed to get number",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  async getSms(orderId: string): Promise<{
    success: boolean
    sms?: string
    code?: string
    message?: string
  }> {
    try {
      const result = await this.request<{ code?: string; status: string }>("getStatus", {
        id: parseInt(orderId),
      })

      if (result.code) {
        return {
          success: true,
          code: result.code,
          sms: result.code,
        }
      }

      return {
        success: false,
        message: result.status,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      }
    }
  }

  async cancelOrder(orderId: string): Promise<{
    success: boolean
    message?: string
  }> {
    try {
      const result = await this.request<{ status: string }>("setStatus", {
        id: parseInt(orderId),
        status: -1,
      })

      return {
        success: result.status === "OK",
        message: result.status,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      }
    }
  }
}

let smsactivateInstance: SMSActivate | null = null

export function getSMSActivate(): SMSActivate {
  if (!smsactivateInstance) {
    const apiKey = process.env.SMSACTIVATE_API_KEY
    if (!apiKey || apiKey === "your-smsactivate-api-key") {
      throw new Error("SMS-Activate API key not configured")
    }
    smsactivateInstance = new SMSActivate({ apiKey })
  }
  return smsactivateInstance
}
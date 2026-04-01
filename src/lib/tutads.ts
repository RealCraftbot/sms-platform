const TUTADS_BASE_URL = "https://tutads.net/api"

interface TutAdsConfig {
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

interface TutAdsCategory {
  id: number
  name: string
  image?: string
}

interface TutAdsProduct {
  id: number
  name: string
  category_id?: number
  price: number
  stock?: number
  description?: string
}

interface TutAdsOrder {
  id?: string
  status?: string
  trans_id?: string
  data?: string[]
}

interface TutAdsProfile {
  balance: number
  email?: string
  name?: string
}

interface BuyResult {
  success: boolean
  transId?: string
  accounts?: string[]
  message?: string
}

export class TutAds {
  private apiKey: string

  constructor(config: TutAdsConfig) {
    this.apiKey = config.apiKey
  }

  private async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const urlParams = new URLSearchParams()
    urlParams.append("api_key", this.apiKey)
    
    for (const [key, value] of Object.entries(params)) {
      urlParams.append(key, String(value))
    }

    const url = `${TUTADS_BASE_URL}${endpoint}?${urlParams.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`TutAds API error: ${response.status}`)
    }

    return response.json()
  }

  private async post<T>(endpoint: string, data: Record<string, string | number>): Promise<T> {
    const formData = new URLSearchParams()
    formData.append("api_key", this.apiKey)
    
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, String(value))
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

  async getProfile(): Promise<TutAdsProfile> {
    try {
      const result = await this.get<any>("/profile.php", {})
      return {
        balance: parseFloat(result.balance || 0),
        email: result.email,
        name: result.name,
      }
    } catch (error) {
      console.error("TutAds getProfile error:", error)
      return { balance: 0 }
    }
  }

  async getBalance(): Promise<number> {
    const profile = await this.getProfile()
    return profile.balance
  }

  async getProducts(): Promise<{ categories: TutAdsCategory[]; products: TutAdsProduct[] }> {
    try {
      const result = await this.get<any>("/products.php", {})
      return {
        categories: result.categories || [],
        products: result.products || [],
      }
    } catch (error) {
      console.error("TutAds getProducts error:", error)
      return { categories: [], products: [] }
    }
  }

  async getProduct(productId: number): Promise<TutAdsProduct | null> {
    try {
      const result = await this.get<any>("/product.php", { product: productId })
      return result.product || result || null
    } catch (error) {
      console.error("TutAds getProduct error:", error)
      return null
    }
  }

  async getOrder(orderId: string): Promise<TutAdsOrder | null> {
    try {
      const result = await this.get<any>("/order.php", { order: orderId })
      return result.order || result || null
    } catch (error) {
      console.error("TutAds getOrder error:", error)
      return null
    }
  }

  async buyProduct(productId: number, amount: number = 1, coupon?: string): Promise<BuyResult> {
    try {
      const data: Record<string, string | number> = {
        action: "buyProduct",
        id: productId,
        amount: amount,
      }
      if (coupon) {
        data.coupon = coupon
      }

      const result = await this.get<any>("/buy_product", data)

      if (result.status === "success") {
        return {
          success: true,
          transId: result.trans_id,
          accounts: result.data,
          message: result.msg,
        }
      }

      return {
        success: false,
        message: result.msg || result.message || "Failed to purchase product",
      }
    } catch (error: any) {
      console.error("TutAds buyProduct error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  // SMS functions - TutAds uses SMS-activate compatible endpoints
  async getServices(): Promise<ServiceInfo[]> {
    try {
      // TutAds may have SMS services via different endpoint
      return []
    } catch (error) {
      console.error("TutAds getServices error:", error)
      return []
    }
  }

  async getCountries(): Promise<CountryInfo[]> {
    return []
  }

  async buyNumber(service: string, country: string): Promise<SMSResult> {
    return {
      success: false,
      message: "TutAds is primarily for social accounts. Use buyProduct method instead.",
    }
  }

  async getSms(orderId: string): Promise<SMSCheckResult> {
    return {
      success: false,
      message: "TutAds does not support SMS verification.",
    }
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean; message?: string }> {
    return {
      success: false,
      message: "TutAds does not support order cancellation via API.",
    }
  }
}

export function getTutAds(): TutAds {
  const apiKey = process.env.TUTADS_API_KEY
  if (!apiKey) {
    throw new Error("TUTADS_API_KEY is not set")
  }
  return new TutAds({ apiKey })
}
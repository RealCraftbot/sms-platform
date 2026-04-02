/* eslint-disable @typescript-eslint/no-explicit-any */
interface AccSMTPConfig {
  baseUrl: string
  username: string
  password: string
}

interface AccSMTPProduct {
  id: number
  name: string
  category?: string
  price: number
  stock?: number
  description?: string
}

interface AccSMTPCategory {
  id: number
  name: string
  description?: string
}

interface AccSMTPOrder {
  id?: string
  status?: string
  accounts?: { email: string; password: string; details?: any }[]
}

interface AccSMTPBalance {
  balance: number
}

interface BuyResult {
  success: boolean
  orderId?: string
  accounts?: string[]
  message?: string
}

export class AccSMTP {
  private baseUrl: string
  private username: string
  private password: string

  constructor(config: AccSMTPConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "")
    this.username = config.username
    this.password = config.password
  }

  private async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const urlParams = new URLSearchParams()
    urlParams.append("username", this.username)
    urlParams.append("password", this.password)
    
    for (const [key, value] of Object.entries(params)) {
      urlParams.append(key, String(value))
    }

    const url = `${this.baseUrl}/api/${endpoint}?${urlParams.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`AccSMTP API error: ${response.status}`)
    }

    return response.json()
  }

  async getBalance(): Promise<number> {
    try {
      const result = await this.get<AccSMTPBalance>("/GetBalance.php", {})
      return result.balance || 0
    } catch (error) {
      console.error("AccSMTP getBalance error:", error)
      return 0
    }
  }

  async getProducts(): Promise<{ categories: AccSMTPCategory[]; products: AccSMTPProduct[] }> {
    try {
      const result = await this.get<any>("/ListResource.php", {})
      return {
        categories: result.categories || [],
        products: result.products || result || [],
      }
    } catch (error) {
      console.error("AccSMTP getProducts error:", error)
      return { categories: [], products: [] }
    }
  }

  async getProduct(productId: number): Promise<AccSMTPProduct | null> {
    try {
      const result = await this.get<any>("/InfoResource.php", { id: productId })
      return result.product || result || null
    } catch (error) {
      console.error("AccSMTP getProduct error:", error)
      return null
    }
  }

  async buyProduct(productId: number, amount: number = 1): Promise<BuyResult> {
    try {
      const result = await this.get<any>("/BResource.php", { 
        id: productId, 
        amount: amount 
      })

      if (result.status === "success" || result.success === true) {
        return {
          success: true,
          orderId: result.order_id || result.id,
          accounts: result.accounts || result.data,
          message: result.message || result.msg,
        }
      }

      return {
        success: false,
        message: result.message || result.error || "Failed to purchase product",
      }
    } catch (error: any) {
      console.error("AccSMTP buyProduct error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }

  async getOrder(orderId: string): Promise<AccSMTPOrder | null> {
    try {
      const result = await this.get<any>("/order.php", { order: orderId })
      return result.order || result || null
    } catch (error) {
      console.error("AccSMTP getOrder error:", error)
      return null
    }
  }

  async importAccount(productId: number, account: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await this.get<any>("/importAccount.php", { 
        product: productId, 
        account: account 
      })

      return {
        success: result.status === "success" || result.success === true,
        message: result.message || result.msg,
      }
    } catch (error: any) {
      console.error("AccSMTP importAccount error:", error)
      return {
        success: false,
        message: error.message,
      }
    }
  }
}

export function getAccSMTP(): AccSMTP {
  const baseUrl = process.env.ACCSMTP_BASE_URL
  const username = process.env.ACCSMTP_USERNAME
  const password = process.env.ACCSMTP_PASSWORD

  if (!baseUrl || !username || !password) {
    throw new Error("ACCSMTP_BASE_URL, ACCSMTP_USERNAME and ACCSMTP_PASSWORD must be set")
  }

  return new AccSMTP({ baseUrl, username, password })
}
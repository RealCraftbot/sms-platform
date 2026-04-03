import { ServiceType } from "@prisma/client"

export interface SupplierProduct {
  id: string
  supplierId: string
  externalId: string
  type: ServiceType
  service: string
  subService?: string
  country?: string
  platform?: string
  costPrice: number
  costCurrency: string
  stockQuantity: number
  isAvailable: boolean
  minOrder: number
  maxOrder: number
  metadata?: Record<string, unknown>
}

export interface PurchaseResult {
  success: boolean
  externalOrderId?: string
  phoneNumber?: string
  countryCode?: string
  expiresAt?: Date
  accounts?: AccountData[]
  boostStatus?: string
  estimatedDelivery?: string
  message?: string
}

export interface AccountData {
  id: string
  email?: string
  password?: string
  cookies?: string
  meta?: Record<string, unknown>
}

export interface SMSCheckResult {
  success: boolean
  code?: string
  text?: string
  message?: string
}

export interface BoostStatus {
  status: string
  progress: number
  delivered: number
  remaining: number
}

export interface HealthCheckResult {
  online: boolean
  latencyMs?: number
  balance?: number
  error?: string
}

export interface SupplierConfig {
  id?: string
  name: string
  type: ServiceType
  baseUrl: string
  apiKey: string
  apiSecret?: string
}

export abstract class BaseSupplier {
  protected config: SupplierConfig
  protected startTime: number = 0

  constructor(config: SupplierConfig) {
    this.config = config
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    this.startTime = Date.now()
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`${this.config.name} API error: ${response.status}`)
    }

    return response.json()
  }

  protected async requestFormData<T>(
    endpoint: string,
    data: Record<string, string | number | undefined>
  ): Promise<T> {
    this.startTime = Date.now()
    const formData = new URLSearchParams()
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        formData.append(key, String(value))
      }
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      throw new Error(`${this.config.name} API error: ${response.status}`)
    }

    return response.json()
  }

  getDuration(): number {
    return Date.now() - this.startTime
  }

  abstract getProducts(): Promise<SupplierProduct[]>
  abstract purchase(productId: string, quantity: number, options?: Record<string, string>): Promise<PurchaseResult>
  abstract healthCheck(): Promise<HealthCheckResult>
  abstract getBalance(): Promise<number>

  canCancel?(): boolean
  cancel?(orderId: string): Promise<boolean>
}

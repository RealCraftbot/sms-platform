import { ServiceType, Supplier } from "@prisma/client"
import { SupplierProduct, PurchaseResult, HealthCheckResult, BoostStatus, SMSCheckResult } from "./base"
import { createSMSPoolSupplier, SMSPoolSupplier } from "./sms-pool"
import { createSocialLogSupplier, SocialLogSupplier } from "./social-log"
import { createSocialBoostSupplier, SocialBoostSupplier } from "./social-boost"

export type SupplierInstance = SMSPoolSupplier | SocialLogSupplier | SocialBoostSupplier

export interface SupplierManagerConfig {
  supplier: Supplier
}

export class SupplierManager {
  private instance: SupplierInstance | null = null
  private supplierConfig: Supplier

  constructor(config: SupplierManagerConfig) {
    this.supplierConfig = config.supplier
  }

  private getInstance(): SupplierInstance {
    if (this.instance) {
      return this.instance
    }

    switch (this.supplierConfig.type) {
      case ServiceType.SMS_NUMBER:
        this.instance = createSMSPoolSupplier({
          apiKey: this.supplierConfig.apiKey,
          id: this.supplierConfig.id,
        })
        break
      case ServiceType.SOCIAL_LOG:
        this.instance = createSocialLogSupplier({
          baseUrl: this.supplierConfig.baseUrl,
          apiKey: this.supplierConfig.apiKey,
          apiSecret: this.supplierConfig.apiSecret || "",
          id: this.supplierConfig.id,
        })
        break
      case ServiceType.SOCIAL_BOOST:
        this.instance = createSocialBoostSupplier({
          baseUrl: this.supplierConfig.baseUrl,
          apiKey: this.supplierConfig.apiKey,
          id: this.supplierConfig.id,
        })
        break
      default:
        throw new Error(`Unsupported supplier type: ${this.supplierConfig.type}`)
    }

    return this.instance
  }

  async getProducts(): Promise<SupplierProduct[]> {
    return this.getInstance().getProducts()
  }

  async purchase(
    productId: string,
    quantity: number,
    options?: Record<string, string>
  ): Promise<PurchaseResult> {
    return this.getInstance().purchase(productId, quantity, options)
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return this.getInstance().healthCheck()
  }

  async getBalance(): Promise<number> {
    return this.getInstance().getBalance()
  }

  canCancel(): boolean {
    return this.getInstance().canCancel?.() ?? false
  }

  async cancel(orderId: string): Promise<boolean> {
    if (!this.canCancel()) {
      return false
    }
    return this.getInstance().cancel?.(orderId) ?? false
  }

  async checkStatus(orderId: string): Promise<BoostStatus> {
    const instance = this.getInstance() as SocialBoostSupplier
    if (instance.checkStatus) {
      return instance.checkStatus(orderId)
    }
    return { status: "unknown", progress: 0, delivered: 0, remaining: 0 }
  }

  async checkSms(orderId: string): Promise<SMSCheckResult> {
    const instance = this.getInstance() as SMSPoolSupplier
    if (instance.checkSms) {
      return instance.checkSms(orderId)
    }
    return { success: false, message: "Not supported" }
  }

  getConfig(): Supplier {
    return this.supplierConfig
  }
}

export function createSupplierManager(supplier: Supplier): SupplierManager {
  return new SupplierManager({ supplier })
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface SMSService {
  id: string
  name: string
}

interface SocialProduct {
  id: number
  name: string
  category?: string
  price?: number
  stock?: number
}

interface ServicesData {
  sms: {
    supplier: string
    services: SMSService[]
    balance: number | null
    error: string | null
  }
  social: {
    supplier: string
    products: SocialProduct[]
    balance: number | null
    error: string | null
  }
}

export default function AdminServicesPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [data, setData] = useState<ServicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"sms" | "social">("sms")
  const [mounted, setMounted] = useState(() => typeof window !== "undefined")

  useEffect(() => {
    setMounted(true)
    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")
    
    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }
    
    setIsAdmin(true)
    
    const headers: Record<string, string> = { "x-admin-id": adminId }

    const fetchServices = async () => {
      try {
        const res = await fetch("/api/admin/services", { headers })
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/admin-login")
            return
          }
          throw new Error(`HTTP error: ${res.status}`)
        }
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch services:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [router])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Services & Products</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("sms")}
          className={`px-4 py-2 rounded ${
            activeTab === "sms"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          SMS Services
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2 rounded ${
            activeTab === "social"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Social Media Products
        </button>
      </div>

      {data?.sms.error && activeTab === "sms" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
          {data.sms.error}
        </div>
      )}

      {data?.social.error && activeTab === "social" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
          {data.social.error}
        </div>
      )}

      {activeTab === "sms" && data?.sms && (
        <div>
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">SMS Supplier: {data.sms.supplier}</h2>
            {data.sms.balance !== null && (
              <p className="text-gray-600">Balance: ${data.sms.balance.toFixed(2)}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Total Services: {data.sms.services?.length || 0}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.sms.services?.slice(0, 100).map((service, index) => (
                  <tr key={service.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "social" && data?.social && (
        <div>
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Social Supplier: {data.social.supplier}</h2>
            {data.social.balance !== null && (
              <p className="text-gray-600">Balance: ${data.social.balance.toFixed(2)}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Total Products: {data.social.products?.length || 0}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.social.products?.map((product, index) => (
                  <tr key={product.id || index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.category || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.price !== undefined ? `$${product.price}` : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {product.stock !== undefined ? product.stock : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
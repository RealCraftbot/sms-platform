"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface ServiceItem {
  id: string
  name: string
}

interface ServicesData {
  sms: {
    supplier: string
    services: ServiceItem[]
    balance: number | null
    error: string | null
  }
  social: {
    supplier: string
    products: ServiceItem[]
    balance: number | null
    error: string | null
  }
}

export default function AdminServicesPage() {
  const router = useRouter()
  const [data, setData] = useState<ServicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  useEffect(() => {
    setMounted(true)
    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")

    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    const headers = { "x-admin-id": adminId }

    fetch("/api/admin/services", { headers })
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const filteredServices = useMemo(() => {
    if (!data?.sms.services) return []
    const term = searchTerm.toLowerCase()
    return data.sms.services.filter(s =>
      s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  const filteredProducts = useMemo(() => {
    if (!data?.social.products) return []
    const term = searchTerm.toLowerCase()
    return data.social.products.filter(p =>
      p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services & Products</h1>
        <p className="text-muted-foreground">View and select from supplier services</p>
      </div>

      <Tabs defaultValue="sms">
        <TabsList>
          <TabsTrigger value="sms">SMS Services</TabsTrigger>
          <TabsTrigger value="social">Social Products</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Supplier: {data?.sms.supplier}</CardTitle>
              {data?.sms.balance !== null && data?.sms?.balance !== undefined && (
                <p className="text-muted-foreground">Balance: ${data.sms.balance.toFixed(2)}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Services</Label>
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Service</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const service = data?.sms?.services?.find(s => s.id === e.target.value)
                    setSelectedService(service || null)
                  }}
                >
                  <option value="">Select a service...</option>
                  {filteredServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
              {selectedService && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {selectedService.id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All SMS Services ({filteredServices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Service Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredServices.slice(0, 200).map(service => (
                      <tr key={service.id} className="border-b hover:bg-muted cursor-pointer" onClick={() => setSelectedService(service)}>
                        <td className="p-2 font-mono">{service.id}</td>
                        <td className="p-2">{service.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Supplier: {data?.social.supplier}</CardTitle>
              {data?.social?.balance !== null && data?.social?.balance !== undefined && (
                <p className="text-muted-foreground">Balance: ${data.social.balance.toFixed(2)}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Products</Label>
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Product Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 200).map(product => (
                      <tr key={product.id} className="border-b hover:bg-muted">
                        <td className="p-2 font-mono">{product.id}</td>
                        <td className="p-2">{product.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

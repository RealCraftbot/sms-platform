"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServiceItem {
  id: string
  name: string
  countries: {
    id: string
    name: string
    code: string
    supplierPrice: number | null
    adminPrice: number | null
    costPrice: number | null
    stock: number | null
    available: boolean
  }[]
}

interface ServicesData {
  services: ServiceItem[]
  supplier: {
    name: string
    balance: number | null
    servicesCount: number
    countriesCount: number
  }
  error: string | null
}

export default function AdminServicesPage() {
  const router = useRouter()
  const [data, setData] = useState<ServicesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [editPrice, setEditPrice] = useState("")
  const [editCost, setEditCost] = useState("")
  const [editStock, setEditStock] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")

    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    fetch("/api/supplier/services")
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const filteredServices = useMemo(() => {
    if (!data?.services) return []
    const term = searchTerm.toLowerCase()
    return data.services.filter(s =>
      s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  const currentService = data?.services.find(s => s.id === selectedService)
  const currentCountry = currentService?.countries.find(c => c.id === selectedCountry)

  useEffect(() => {
    if (currentCountry) {
      setEditPrice(currentCountry.adminPrice?.toString() || "")
      setEditCost(currentCountry.costPrice?.toString() || "")
      setEditStock(currentCountry.stock?.toString() || "")
    } else {
      setEditPrice("")
      setEditCost("")
      setEditStock("")
    }
  }, [currentCountry])

  const handleSavePrice = async () => {
    if (!selectedService || !selectedCountry) return
    setSaving(true)
    setSaveSuccess(false)

    const adminId = localStorage.getItem("adminId")
    const price = parseFloat(editPrice) || 0
    const cost = parseFloat(editCost) || 0
    const stock = parseInt(editStock) || 0
    const profit = price - (cost * 1500)
    const margin = price > 0 ? (profit / price) * 100 : 0

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId || ""
        },
        body: JSON.stringify({
          type: "SMS_NUMBER",
          service: selectedService,
          country: selectedCountry,
          displayName: `${currentCountry?.name || selectedCountry} ${currentService?.name || selectedService}`,
          sellingPriceNGN: price,
          costPrice: cost,
          profitPerUnit: profit,
          profitMargin: margin,
          stockQuantity: stock,
          isActive: price > 0,
        }),
      })

      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        fetch("/api/supplier/services")
          .then(res => res.json())
          .then(json => setData(json))
      }
    } catch {
      alert("Failed to save price")
    }

    setSaving(false)
  }

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
        <h1 className="text-3xl font-bold">Services Management</h1>
        <p className="text-muted-foreground">Set prices for supplier services</p>
      </div>

      {data?.error && (
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <p className="text-yellow-500">{data.error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supplier Info: {data?.supplier.name}</CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Services: {data?.supplier.servicesCount}</span>
            <span>Countries: {data?.supplier.countriesCount}</span>
            {data?.supplier?.balance !== null && data?.supplier?.balance !== undefined && (
              <span>Balance: ${data.supplier.balance.toFixed(2)}</span>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Price for Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={selectedService} onValueChange={(v) => { setSelectedService(v); setSelectedCountry(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={!selectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {currentService?.countries.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your Selling Price (NGN)</Label>
              <Input
                type="number"
                placeholder="e.g., 300"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Cost Price (USD)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g., 0.06"
                value={editCost}
                onChange={(e) => setEditCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                placeholder="e.g., 100"
                value={editStock}
                onChange={(e) => setEditStock(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button
                onClick={handleSavePrice}
                disabled={!selectedService || !selectedCountry || saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Price"}
              </Button>
            </div>
          </div>
          {saveSuccess && (
            <div className="p-2 bg-green-500/20 text-green-500 rounded text-center">
              Price saved successfully!
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Services with Pricing</CardTitle>
          <div className="space-y-2 mt-2">
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Country</th>
                  <th className="text-left p-2">Code</th>
                  <th className="text-right p-2">Supplier Price</th>
                  <th className="text-right p-2">Your Price</th>
                  <th className="text-right p-2">Cost</th>
                  <th className="text-right p-2">Stock</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.flatMap(service =>
                  service.countries
                    .filter(c => c.available || searchTerm)
                    .slice(0, 500)
                    .map(country => (
                      <tr
                        key={`${service.id}-${country.id}`}
                        className="border-b hover:bg-muted cursor-pointer"
                        onClick={() => {
                          setSelectedService(service.id)
                          setSelectedCountry(country.id)
                        }}
                      >
                        <td className="p-2">{service.name}</td>
                        <td className="p-2">{country.name}</td>
                        <td className="p-2 font-mono">{country.code}</td>
                        <td className="p-2 text-right">
                          {country.supplierPrice ? `$${country.supplierPrice.toFixed(4)}` : "-"}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {country.adminPrice ? `₦${country.adminPrice}` : "-"}
                        </td>
                        <td className="p-2 text-right">
                          {country.costPrice ? `$${country.costPrice}` : "-"}
                        </td>
                        <td className="p-2 text-right">{country.stock ?? "-"}</td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            country.adminPrice ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                          }`}>
                            {country.adminPrice ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

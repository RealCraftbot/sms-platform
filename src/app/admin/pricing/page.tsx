"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus } from "lucide-react"

interface PricingRule {
  id: string
  type: string
  service?: string
  platform?: string
  subService?: string
  displayName: string
  sellingPriceNGN: number
  profitPerUnit: number
  profitMargin: number
  stockQuantity?: number
  isActive: boolean
}

const SERVICE_TYPES = [
  { id: "SMS_NUMBER", name: "SMS Numbers" },
  { id: "SOCIAL_LOG", name: "Social Logs" },
  { id: "SOCIAL_BOOST", name: "Social Boost" },
]

const SMS_SERVICES = ["whatsapp", "instagram", "telegram", "facebook", "google", "twitter", "tiktok"]
const PLATFORMS = ["instagram", "facebook", "twitter", "tiktok", "youtube", "gmail"]
const BOOST_SERVICES = ["followers", "likes", "views", "comments", "subscribers"]
const COUNTRIES = ["ng", "us", "uk", "ca", "gh", "ke"]

export default function PricingPage() {
  const router = useRouter()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("SMS_NUMBER")
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({
    type: "SMS_NUMBER",
    service: "",
    platform: "",
    subService: "",
    country: "",
    displayName: "",
    sellingPriceNGN: "",
    costPrice: "",
    stockQuantity: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")

    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    fetch("/api/admin/pricing", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/admin-login")
            return []
          }
          throw new Error(`HTTP error: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setRules(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setForm({
      type: activeTab,
      service: "",
      platform: "",
      subService: "",
      country: "",
      displayName: "",
      sellingPriceNGN: "",
      costPrice: "",
      stockQuantity: "",
    })
  }

  useEffect(() => {
    setForm(prev => ({ ...prev, type: activeTab }))
    resetForm()
  }, [activeTab])

  const handleSave = async () => {
    if (!form.displayName || !form.sellingPriceNGN) {
      alert("Please fill in required fields")
      return
    }
    setSaving(true)

    const adminId = localStorage.getItem("adminId")
    const price = parseFloat(form.sellingPriceNGN)
    const costPrice = parseFloat(form.costPrice || "0")
    const profit = price - (costPrice * 1550)
    const margin = (profit / price) * 100

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId || "",
        },
        body: JSON.stringify({
          type: form.type,
          service: form.service || undefined,
          platform: form.platform || undefined,
          subService: form.subService || undefined,
          country: form.country || undefined,
          displayName: form.displayName,
          sellingPriceNGN: price,
          costPrice: costPrice,
          costCurrency: costPrice > 0 ? "USD" : undefined,
          profitPerUnit: profit,
          profitMargin: margin,
          stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
          isActive: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save pricing rule")
        setSaving(false)
        return
      }

      const rulesRes = await fetch("/api/admin/pricing", {
        headers: { "x-admin-id": adminId || "" },
      })
      const rulesData = await rulesRes.json()
      setRules(rulesData)
      resetForm()
      alert("Pricing rule saved!")
    } catch {
      alert("Something went wrong")
    }

    setSaving(false)
  }

  const filteredRules = rules.filter(r => r.type === activeTab)

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
        <h1 className="text-3xl font-bold">Pricing Management</h1>
        <p className="text-muted-foreground">Set pricing rules for all services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {SERVICE_TYPES.map(st => (
            <TabsTrigger key={st.id} value={st.id}>{st.name}</TabsTrigger>
          ))}
        </TabsList>

        {SERVICE_TYPES.map(st => (
          <TabsContent key={st.id} value={st.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add {st.name} Pricing Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Display Name *</Label>
                    <Input
                      placeholder="e.g., Nigeria WhatsApp"
                      value={form.displayName}
                      onChange={(e) => handleFormChange("displayName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Selling Price (NGN) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 300"
                      value={form.sellingPriceNGN}
                      onChange={(e) => handleFormChange("sellingPriceNGN", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 0.06"
                      value={form.costPrice}
                      onChange={(e) => handleFormChange("costPrice", e.target.value)}
                    />
                  </div>

                  {st.id === "SMS_NUMBER" && (
                    <>
                      <div className="space-y-2">
                        <Label>Service</Label>
                        <Select value={form.service} onValueChange={(v) => handleFormChange("service", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {SMS_SERVICES.map(s => (
                              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={form.country} onValueChange={(v) => handleFormChange("country", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map(c => (
                              <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {(st.id === "SOCIAL_LOG" || st.id === "SOCIAL_BOOST") && (
                    <>
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={form.platform} onValueChange={(v) => handleFormChange("platform", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLATFORMS.map(p => (
                              <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {st.id === "SOCIAL_BOOST" && (
                        <div className="space-y-2">
                          <Label>Service Type</Label>
                          <Select value={form.subService} onValueChange={(v) => handleFormChange("subService", v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {BOOST_SERVICES.map(s => (
                                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {(st.id === "SOCIAL_LOG") && (
                    <div className="space-y-2">
                      <Label>Stock Quantity</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        value={form.stockQuantity}
                        onChange={(e) => handleFormChange("stockQuantity", e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Pricing Rule"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{st.name} Pricing Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Platform/Service</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.displayName}</TableCell>
                        <TableCell className="capitalize">
                          {[rule.platform, rule.service, rule.subService].filter(Boolean).join(" / ") || "-"}
                        </TableCell>
                        <TableCell>₦{rule.sellingPriceNGN}</TableCell>
                        <TableCell className={rule.profitPerUnit >= 0 ? "text-green-500" : "text-red-500"}>
                          ₦{rule.profitPerUnit.toFixed(0)}
                        </TableCell>
                        <TableCell>{rule.profitMargin.toFixed(1)}%</TableCell>
                        <TableCell>{rule.stockQuantity ?? "∞"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredRules.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No pricing rules for {st.name}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

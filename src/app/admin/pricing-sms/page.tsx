"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, DollarSign, Share2, FileText, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PricingRule {
  id: string
  type: string
  service?: string
  platform?: string
  subService?: string
  displayName: string
  actualCost?: number
  sellingPriceNGN: number
  profitPerUnit: number
  profitMargin: number
  stockQuantity?: number
  isActive: boolean
}

const SMS_SERVICES = ["whatsapp", "instagram", "telegram", "facebook", "google", "twitter", "tiktok"]
const PLATFORMS = ["instagram", "facebook", "twitter", "tiktok", "youtube", "gmail"]
const BOOST_SERVICES = ["followers", "likes", "views", "comments", "subscribers"]
const COUNTRIES = ["ng", "us", "uk", "ca", "gh", "ke"]

export default function PricingSmsPage() {
  const router = useRouter()
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("SMS_NUMBER")
  const [providerCost, setProviderCost] = useState<string>("")
  const [costCurrency, setCostCurrency] = useState<string>("RUB")
  const [form, setForm] = useState({
    service: "",
    platform: "",
    subService: "",
    country: "",
    displayName: "",
    sellingPriceNGN: "",
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
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setRules(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const fetchProviderCost = async (type: string, service: string, country?: string) => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId || !service) return

    try {
      const params = new URLSearchParams({ type, service })
      if (country) params.append("country", country)

      const res = await fetch(`/api/admin/provider-cost?${params}`, {
        headers: { "x-admin-id": adminId }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.cost) {
          setProviderCost(data.cost.toString())
          setCostCurrency(data.currency || "RUB")
        }
      }
    } catch {
      // Ignore errors, cost is optional
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    if (field === "service" || field === "country") {
      fetchProviderCost(activeTab, field === "service" ? value : form.service, field === "country" ? value : form.country)
    }
  }

  const resetForm = () => {
    setForm({
      service: "",
      platform: "",
      subService: "",
      country: "",
      displayName: "",
      sellingPriceNGN: "",
      stockQuantity: "",
    })
    setProviderCost("")
    setCostCurrency("RUB")
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
    const costPrice = parseFloat(providerCost || "0")

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId || "",
        },
        body: JSON.stringify({
          type: activeTab,
          service: form.service || undefined,
          platform: form.platform || undefined,
          subService: form.subService || undefined,
          country: form.country || undefined,
          displayName: form.displayName,
          sellingPriceNGN: price,
          actualCost: costPrice,
          costCurrency: costCurrency,
          profitPerUnit: 0,
          profitMargin: 0,
          stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
          isActive: true,
        }),
      })

      if (!res.ok) throw new Error("Failed to save")

      const rulesRes = await fetch("/api/admin/pricing", {
        headers: { "x-admin-id": adminId || "" },
      })
      const rulesData = await rulesRes.json()
      setRules(Array.isArray(rulesData) ? rulesData : [])
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Pricing (SMS)</h1>
          <p className="text-white/60">Set SMS service prices for customers</p>
        </div>
        <DollarSign className="h-8 w-8 text-emerald-500" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-navy/50">
          <TabsTrigger value="SMS_NUMBER" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Phone className="h-4 w-4 mr-2" />
            SMS Numbers
          </TabsTrigger>
          <TabsTrigger value="SOCIAL_BOOST" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Share2 className="h-4 w-4 mr-2" />
            Social Boost
          </TabsTrigger>
          <TabsTrigger value="SOCIAL_LOG" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Social Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="SMS_NUMBER" className="space-y-6">
          <Card className="bg-navy/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-emerald-500" />
                Add SMS Pricing Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-white/80">Display Name *</Label>
                  <Input
                    placeholder="e.g., Nigeria WhatsApp"
                    value={form.displayName}
                    onChange={(e) => handleFormChange("displayName", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Final User Price (NGN) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 300"
                    value={form.sellingPriceNGN}
                    onChange={(e) => handleFormChange("sellingPriceNGN", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Provider Cost (Reference)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Auto-fetched from provider"
                      value={providerCost}
                      readOnly
                      className="bg-navy/50 border-white/10 text-emerald-400"
                    />
                    <span className="text-white/60 text-sm">{costCurrency}</span>
                  </div>
                  <p className="text-xs text-white/40">Live cost from supplier API</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Service</Label>
                  <Select value={form.service} onValueChange={(v) => handleFormChange("service", v)}>
                    <SelectTrigger className="bg-navy border-white/10 text-white">
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
                  <Label className="text-white/80">Country</Label>
                  <Select value={form.country} onValueChange={(v) => handleFormChange("country", v)}>
                    <SelectTrigger className="bg-navy border-white/10 text-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {saving ? "Saving..." : "Save Pricing Rule"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="SOCIAL_BOOST" className="space-y-6">
          <Card className="bg-navy/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-emerald-500" />
                Add Social Boost Pricing Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-white/80">Display Name *</Label>
                  <Input
                    placeholder="e.g., Instagram Followers"
                    value={form.displayName}
                    onChange={(e) => handleFormChange("displayName", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Final User Price (NGN) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={form.sellingPriceNGN}
                    onChange={(e) => handleFormChange("sellingPriceNGN", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Provider Cost (Reference)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Auto-fetched from provider"
                      value={providerCost}
                      readOnly
                      className="bg-navy/50 border-white/10 text-emerald-400"
                    />
                    <span className="text-white/60 text-sm">USD</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => handleFormChange("platform", v)}>
                    <SelectTrigger className="bg-navy border-white/10 text-white">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Service Type</Label>
                  <Select value={form.subService} onValueChange={(v) => handleFormChange("subService", v)}>
                    <SelectTrigger className="bg-navy border-white/10 text-white">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOST_SERVICES.map(s => (
                        <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {saving ? "Saving..." : "Save Pricing Rule"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="SOCIAL_LOG" className="space-y-6">
          <Card className="bg-navy/50 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Plus className="h-5 w-5 text-emerald-500" />
                Add Social Log Pricing Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-white/80">Display Name *</Label>
                  <Input
                    placeholder="e.g., Aged Instagram Account"
                    value={form.displayName}
                    onChange={(e) => handleFormChange("displayName", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Final User Price (NGN) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 15000"
                    value={form.sellingPriceNGN}
                    onChange={(e) => handleFormChange("sellingPriceNGN", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Provider Cost (Reference)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Auto-fetched from provider"
                      value={providerCost}
                      readOnly
                      className="bg-navy/50 border-white/10 text-emerald-400"
                    />
                    <span className="text-white/60 text-sm">USD</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => handleFormChange("platform", v)}>
                    <SelectTrigger className="bg-navy border-white/10 text-white">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Stock Quantity</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={form.stockQuantity}
                    onChange={(e) => handleFormChange("stockQuantity", e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {saving ? "Saving..." : "Save Pricing Rule"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Active Pricing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/60">Name</TableHead>
                <TableHead className="text-white/60">Platform/Service</TableHead>
                <TableHead className="text-white/60">Provider Cost</TableHead>
                <TableHead className="text-white/60">Price (NGN)</TableHead>
                <TableHead className="text-white/60">Stock</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map(rule => (
                <TableRow key={rule.id} className="border-white/10">
                  <TableCell className="text-white font-medium">{rule.displayName}</TableCell>
                  <TableCell className="text-white/80 capitalize">
                    {[rule.platform, rule.service, rule.subService].filter(Boolean).join(" / ") || "-"}
                  </TableCell>
                  <TableCell className="text-emerald-400/60">
                    {rule.actualCost ? `${rule.actualCost} ${rule.type === "SMS_NUMBER" ? "RUB" : "USD"}` : "-"}
                  </TableCell>
                  <TableCell className="text-white font-bold">₦{rule.sellingPriceNGN.toLocaleString()}</TableCell>
                  <TableCell className="text-white/60">{rule.stockQuantity ?? "∞"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRules.length === 0 && (
            <p className="text-center py-8 text-white/40">No pricing rules configured</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

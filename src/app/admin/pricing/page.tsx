"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PricingRule {
  id: string
  service: string
  country: string
  basePrice: number
  markupType: string
  markupValue: number
  finalPrice: number
}

const SERVICES = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "instagram", name: "Instagram" },
  { id: "telegram", name: "Telegram" },
  { id: "facebook", name: "Facebook" },
  { id: "google", name: "Google" },
  { id: "twitter", name: "Twitter" },
  { id: "tiktok", name: "TikTok" },
]

const COUNTRIES = [
  { id: "ng", name: "Nigeria" },
  { id: "us", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "ca", name: "Canada" },
  { id: "gh", name: "Ghana" },
  { id: "ke", name: "Kenya" },
]

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [service, setService] = useState("")
  const [country, setCountry] = useState("")
  const [basePrice, setBasePrice] = useState("")
  const [markupType, setMarkupType] = useState("percentage")
  const [markupValue, setMarkupValue] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then(res => res.json())
      .then(data => {
        setRules(data)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!service || !country || !basePrice || !markupValue) return
    setSaving(true)

    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          country,
          basePrice: parseFloat(basePrice),
          markupType,
          markupValue: parseFloat(markupValue),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save pricing rule")
        setSaving(false)
        return
      }

      // Refresh rules
      const rulesRes = await fetch("/api/admin/pricing")
      const rulesData = await rulesRes.json()
      setRules(rulesData)

      // Reset form
      setService("")
      setCountry("")
      setBasePrice("")
      setMarkupValue("")
      alert("Pricing rule saved!")
    } catch (err) {
      alert("Something went wrong")
    }

    setSaving(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pricing Management</h1>
        <p className="text-muted-foreground">Set pricing rules for SMS services</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Pricing Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Base Price (NGN)</Label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Markup Type</Label>
              <Select value={markupType} onValueChange={setMarkupType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Markup Value</Label>
              <Input
                type="number"
                placeholder={markupType === "percentage" ? "e.g., 20" : "e.g., 100"}
                value={markupValue}
                onChange={(e) => setMarkupValue(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Pricing Rule"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Pricing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Markup</TableHead>
                <TableHead>Final Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map(rule => (
                <TableRow key={rule.id}>
                  <TableCell className="capitalize">{rule.service}</TableCell>
                  <TableCell className="uppercase">{rule.country}</TableCell>
                  <TableCell>₦{rule.basePrice}</TableCell>
                  <TableCell>
                    {rule.markupType === "percentage" 
                      ? `${rule.markupValue}%` 
                      : `₦${rule.markupValue}`}
                  </TableCell>
                  <TableCell className="font-semibold">₦{rule.finalPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rules.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No pricing rules yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingCart, Globe, Server } from "lucide-react"

const suppliers = [
  { id: "smspool", name: "SMSPool", description: "SMS & Verification", category: "sms" },
  { id: "smspinverify", name: "SMSPinVerify", description: "SMS & Verification", category: "sms" },
  { id: "smsactivate", name: "SMS-Activate", description: "SMS & Verification", category: "sms" },
  { id: "acctshop", name: "AcctShop", description: "Social Media Accounts", category: "social" },
  { id: "tutads", name: "TutAds", description: "Social Media & Services", category: "social" },
]

const externalServices = [
  { 
    name: "BabyMaker VPN & Entertainment", 
    url: "https://babymaker.sellpass.io", 
    description: "VPN and entertainment services (no API integration)",
    category: "vpn"
  },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState("smspool")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.smsSupplier) {
          setCurrentSupplier(data.smsSupplier)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smsSupplier: currentSupplier }),
      })
      
      if (res.ok) {
        alert("Settings saved successfully")
      } else {
        alert("Failed to save settings")
      }
    } catch (err) {
      alert("Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const smsSuppliers = suppliers.filter(s => s.category === "sms")
  const socialSuppliers = suppliers.filter(s => s.category === "social")

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Service Settings</h1>
        <p className="text-light-lavender">Configure API suppliers and external services</p>
      </div>

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary-blue" />
            <CardTitle className="text-white">SMS & Verification Suppliers</CardTitle>
          </div>
          <CardDescription className="text-light-lavender">
            Select which SMS provider to use for phone numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={currentSupplier} 
            onValueChange={setCurrentSupplier}
            className="space-y-4"
          >
            {smsSuppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center space-x-4 p-4 border border-light-lavender/20 rounded-lg bg-white/5">
                <RadioGroupItem value={supplier.id} id={supplier.id} className="border-light-lavender" />
                <Label htmlFor={supplier.id} className="flex-1 cursor-pointer">
                  <span className="font-medium text-white">{supplier.name}</span>
                  <span className="text-light-lavender text-sm ml-2">- {supplier.description}</span>
                </Label>
                {currentSupplier === supplier.id && (
                  <Badge variant="default" className="bg-mint-green text-navy">Active</Badge>
                )}
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="mt-6 bg-mint-green text-navy hover:bg-mint-green/80"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-mint-green" />
            <CardTitle className="text-white">Social Media Suppliers</CardTitle>
          </div>
          <CardDescription className="text-light-lavender">
            Select which social media API to use for accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={currentSupplier} 
            onValueChange={setCurrentSupplier}
            className="space-y-4"
          >
            {socialSuppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center space-x-4 p-4 border border-light-lavender/20 rounded-lg bg-white/5">
                <RadioGroupItem value={supplier.id} id={supplier.id} className="border-light-lavender" />
                <Label htmlFor={supplier.id} className="flex-1 cursor-pointer">
                  <span className="font-medium text-white">{supplier.name}</span>
                  <span className="text-light-lavender text-sm ml-2">- {supplier.description}</span>
                </Label>
                {currentSupplier === supplier.id && (
                  <Badge variant="default" className="bg-mint-green text-navy">Active</Badge>
                )}
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="mt-6 bg-mint-green text-navy hover:bg-mint-green/80"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-lime-yellow" />
            <CardTitle className="text-white">External Services</CardTitle>
          </div>
          <CardDescription className="text-light-lavender">
            Services without API integration - open in new tab
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {externalServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-light-lavender/20 rounded-lg bg-white/5">
              <div>
                <span className="font-medium text-white">{service.name}</span>
                <span className="text-light-lavender text-sm ml-2">- {service.description}</span>
              </div>
              <a 
                href={service.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-mint-green hover:underline"
              >
                Visit <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <CardTitle className="text-white">All Active Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-white/5 rounded">
                <span className="font-medium text-white text-sm">{supplier.name}</span>
                <Badge variant={currentSupplier === supplier.id ? "default" : "secondary"} className={currentSupplier === supplier.id ? "bg-mint-green text-navy" : ""}>
                  {currentSupplier === supplier.id ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
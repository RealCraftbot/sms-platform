"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShoppingCart, Globe, Server, Loader2 } from "lucide-react"

const smsSuppliersList = [
  { id: "smspool", name: "SMSPool", description: "SMS & Verification" },
  { id: "smspinverify", name: "SMSPinVerify", description: "SMS & Verification" },
  { id: "smsactivate", name: "SMS-Activate", description: "SMS & Verification" },
]

const socialSuppliersList = [
  { id: "acctshop", name: "AcctShop", description: "Social Media Accounts" },
  { id: "tutads", name: "TutAds", description: "Social Media & Services" },
]

const externalServices = [
  { 
    name: "BabyMaker VPN & Entertainment", 
    url: "https://babymaker.sellpass.io", 
    description: "VPN and entertainment services (no API integration)",
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentSmsSupplier, setCurrentSmsSupplier] = useState("smspool")
  const [currentSocialSupplier, setCurrentSocialSupplier] = useState("acctshop")
  const [mounted, setMounted] = useState(() => typeof window !== "undefined")

  useEffect(() => {
    setMounted(true)
    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")
    
    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    const headers: Record<string, string> = { "x-admin-id": adminId }
    
    fetch("/api/admin/settings", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.smsSupplier) setCurrentSmsSupplier(data.smsSupplier)
        if (data.socialSupplier) setCurrentSocialSupplier(data.socialSupplier)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const saveSettings = async () => {
    setSaving(true)
    const adminId = localStorage.getItem("adminId")
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "x-admin-id": adminId || ""
    }
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          smsSupplier: currentSmsSupplier,
          socialSupplier: currentSocialSupplier
        }),
      })
      
      if (res.ok) {
        alert("Settings saved successfully")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save settings")
      }
    } catch {
      alert("Error saving settings")
    } finally {
      setSaving(false)
    }
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
            value={currentSmsSupplier} 
            onValueChange={setCurrentSmsSupplier}
            className="space-y-4"
          >
            {smsSuppliersList.map(supplier => (
              <div key={supplier.id} className="flex items-center space-x-4 p-4 border border-light-lavender/20 rounded-lg bg-white/5">
                <RadioGroupItem value={supplier.id} id={supplier.id} className="border-light-lavender" />
                <Label htmlFor={supplier.id} className="flex-1 cursor-pointer">
                  <span className="font-medium text-white">{supplier.name}</span>
                  <span className="text-light-lavender text-sm ml-2">- {supplier.description}</span>
                </Label>
                {currentSmsSupplier === supplier.id && (
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
            value={currentSocialSupplier} 
            onValueChange={setCurrentSocialSupplier}
            className="space-y-4"
          >
            {socialSuppliersList.map(supplier => (
              <div key={supplier.id} className="flex items-center space-x-4 p-4 border border-light-lavender/20 rounded-lg bg-white/5">
                <RadioGroupItem value={supplier.id} id={`social-${supplier.id}`} className="border-light-lavender" />
                <Label htmlFor={`social-${supplier.id}`} className="flex-1 cursor-pointer">
                  <span className="font-medium text-white">{supplier.name}</span>
                  <span className="text-light-lavender text-sm ml-2">- {supplier.description}</span>
                </Label>
                {currentSocialSupplier === supplier.id && (
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
          <CardTitle className="text-white">Current Active Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-light-lavender text-sm mb-2">SMS Supplier</p>
              <p className="text-white font-medium">{smsSuppliersList.find(s => s.id === currentSmsSupplier)?.name}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-light-lavender text-sm mb-2">Social Media Supplier</p>
              <p className="text-white font-medium">{socialSuppliersList.find(s => s.id === currentSocialSupplier)?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
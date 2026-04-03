"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Globe, Check, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface GatewayConfig {
  name: string
  enabled: boolean
  configured: boolean
  fields: { key: string; value: string; placeholder: string }[]
}

export default function GatewayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [gateways, setGateways] = useState<Record<string, GatewayConfig>>({
    paystack: {
      name: "Paystack",
      enabled: false,
      configured: false,
      fields: [
        { key: "PAYSTACK_SECRET_KEY", value: "", placeholder: "sk_live_..." },
        { key: "PAYSTACK_PUBLIC_KEY", value: "", placeholder: "pk_live_..." },
      ]
    },
    bank_transfer: {
      name: "Bank Transfer",
      enabled: true,
      configured: true,
      fields: [
        { key: "BANK_NAME", value: "", placeholder: "First Bank of Nigeria" },
        { key: "BANK_ACCOUNT_NUMBER", value: "", placeholder: "1234567890" },
        { key: "BANK_ACCOUNT_NAME", value: "", placeholder: "SMSReseller Ltd" },
      ]
    }
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

    fetch("/api/admin/gateway", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setGateways(prev => {
            const updated = { ...prev }
            Object.keys(data).forEach(key => {
              if (updated[key]) {
                updated[key] = { ...updated[key], ...data[key] }
              }
            })
            return updated
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleFieldChange = (gateway: string, fieldKey: string, value: string) => {
    setGateways(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        fields: prev[gateway].fields.map(f =>
          f.key === fieldKey ? { ...f, value } : f
        )
      }
    }))
  }

  const handleToggle = (gateway: string) => {
    setGateways(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        enabled: !prev[gateway].enabled
      }
    }))
  }

  const handleSave = async () => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    setSaving(true)
    try {
      const res = await fetch("/api/admin/gateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId
        },
        body: JSON.stringify(gateways)
      })

      if (res.ok) {
        alert("Gateway settings saved!")
      } else {
        throw new Error("Failed to save")
      }
    } catch {
      alert("Failed to save gateway settings")
    }
    setSaving(false)
  }

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
          <h1 className="text-3xl font-bold text-white">Gateway Settings</h1>
          <p className="text-white/60">Configure payment gateways</p>
        </div>
        <Globe className="h-8 w-8 text-emerald-500" />
      </div>

      <div className="space-y-6">
        {Object.entries(gateways).map(([key, gateway]) => (
          <Card key={key} className="bg-navy/50 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-3">
                  {gateway.name}
                  {gateway.configured ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">Configured</Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant={gateway.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggle(key)}
                  className={gateway.enabled ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                >
                  {gateway.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gateway.fields.map(field => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-white/80">{field.key}</Label>
                  <Input
                    type="password"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => handleFieldChange(key, field.key, e.target.value)}
                    className="bg-navy border-white/10 text-white"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-emerald-500 hover:bg-emerald-600"
      >
        {saving ? "Saving..." : "Save Gateway Settings"}
      </Button>
    </div>
  )
}

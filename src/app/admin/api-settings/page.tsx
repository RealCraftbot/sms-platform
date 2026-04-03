"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Code, Check, X, AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ApiProvider {
  name: string
  enabled: boolean
  configured: boolean
  envKey: string
  docsUrl?: string
}

interface ApiSettings {
  providers: Record<string, ApiProvider>
  rateLimit: {
    enabled: boolean
    requestsPerMinute: number
  }
  webhook: {
    url: string
    secret: string
  }
}

export default function ApiSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<ApiSettings>({
    providers: {
      smspool: { name: "SMSPool", enabled: true, configured: false, envKey: "SMSPOOL_API_KEY" },
      smspinverify: { name: "SmsPinVerify", enabled: true, configured: false, envKey: "SMSPINVERIFY_API_KEY" },
      autofications: { name: "Autofications", enabled: true, configured: false, envKey: "AUTOFICICATIONS_API_KEY" },
      fivesim: { name: "5Sim", enabled: true, configured: false, envKey: "FIVESIM_API_KEY" },
      naijaboost: { name: "NaijaBoost", enabled: true, configured: false, envKey: "NAIJABOOST_API_KEY" },
      fullsmm: { name: "FullSMM", enabled: true, configured: false, envKey: "FULLSMM_API_KEY" },
      fortunesmm: { name: "FortuneSMM", enabled: true, configured: false, envKey: "FORTUNESMM_API_KEY" },
      tutads: { name: "Tutads", enabled: true, configured: false, envKey: "TUTADS_API_KEY" },
      acctshop: { name: "AcctShop", enabled: true, configured: false, envKey: "ACCTSHOP_API_KEY" },
      accsmtp: { name: "AccSMTP", enabled: true, configured: false, envKey: "ACCSSMTP_API_KEY" },
      sellclonegiare: { name: "SellCloneGiare", enabled: true, configured: false, envKey: "SELLCLONEGIARE_API_KEY" },
      viaclone: { name: "Viaclone", enabled: true, configured: false, envKey: "VIACLONE_API_KEY" },
    },
    rateLimit: {
      enabled: true,
      requestsPerMinute: 60
    },
    webhook: {
      url: "",
      secret: ""
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

    fetch("/api/admin/api-settings", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        if (data && data.providers) {
          setSettings(prev => ({
            ...prev,
            providers: { ...prev.providers, ...data.providers }
          }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleToggleProvider = (key: string) => {
    setSettings(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [key]: {
          ...prev.providers[key],
          enabled: !prev.providers[key].enabled
        }
      }
    }))
  }

  const handleRateLimitChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      rateLimit: {
        ...prev.rateLimit,
        [field]: field === "enabled" ? value : parseInt(value as string)
      }
    }))
  }

  const handleWebhookChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      webhook: {
        ...prev.webhook,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    setSaving(true)
    try {
      const res = await fetch("/api/admin/api-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId
        },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        alert("API settings saved!")
      } else {
        throw new Error("Failed to save")
      }
    } catch {
      alert("Failed to save API settings")
    }
    setSaving(false)
  }

  const providerCategories = {
    "SMS": ["smspool", "smspinverify", "autofications", "fivesim"],
    "BOOSTING (SMM)": ["naijaboost", "fullsmm", "fortunesmm"],
    "LOGS (ACCOUNTS)": ["tutads", "acctshop", "accsmtp", "sellclonegiare", "viaclone"]
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
          <h1 className="text-3xl font-bold text-white">API Settings</h1>
          <p className="text-white/60">Configure API providers and access</p>
        </div>
        <Code className="h-8 w-8 text-emerald-500" />
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Provider Configuration</CardTitle>
          <p className="text-white/60 text-sm">Enable/disable API providers. Missing API keys are logged in Admin Panel.</p>
        </CardHeader>
        <CardContent>
          {Object.entries(providerCategories).map(([category, keys]) => (
            <div key={category} className="mb-6">
              <h3 className="text-emerald-500 text-sm font-bold mb-3">{category}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {keys.map(key => {
                  const provider = settings.providers[key]
                  if (!provider) return null
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        provider.configured
                          ? "bg-navy/30 border-white/10"
                          : "bg-yellow-500/5 border-yellow-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {provider.configured ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-white font-medium">{provider.name}</p>
                          <p className="text-white/40 text-xs">{provider.envKey}</p>
                        </div>
                      </div>
                      <Button
                        variant={provider.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleProvider(key)}
                        className={provider.enabled ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                      >
                        {provider.enabled ? "ON" : "OFF"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Enable Rate Limiting</p>
              <p className="text-white/60 text-sm">Protect API from abuse</p>
            </div>
            <Button
              variant={settings.rateLimit.enabled ? "default" : "outline"}
              size="sm"
              onClick={() => handleRateLimitChange("enabled", !settings.rateLimit.enabled)}
              className={settings.rateLimit.enabled ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
            >
              {settings.rateLimit.enabled ? "ON" : "OFF"}
            </Button>
          </div>
          {settings.rateLimit.enabled && (
            <div className="space-y-2">
              <Label className="text-white/80">Requests Per Minute</Label>
              <Input
                type="number"
                value={settings.rateLimit.requestsPerMinute}
                onChange={(e) => handleRateLimitChange("requestsPerMinute", e.target.value)}
                className="bg-navy border-white/10 text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/80">Webhook URL</Label>
            <Input
              placeholder="https://your-app.com/api/webhooks/provider"
              value={settings.webhook.url}
              onChange={(e) => handleWebhookChange("url", e.target.value)}
              className="bg-navy border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Webhook Secret</Label>
            <Input
              type="password"
              placeholder="Secret for verifying webhook authenticity"
              value={settings.webhook.secret}
              onChange={(e) => handleWebhookChange("secret", e.target.value)}
              className="bg-navy border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-emerald-500 hover:bg-emerald-600"
      >
        {saving ? "Saving..." : "Save API Settings"}
      </Button>
    </div>
  )
}

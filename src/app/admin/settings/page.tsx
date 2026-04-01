"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Settings {
  smsSupplier: string
}

const suppliers = [
  { id: "smspool", name: "SMSPool", status: "active" },
  { id: "smspinverify", name: "SMSPinVerify", status: "active" },
  { id: "smsactivate", name: "SMS-Activate", status: "active" },
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

  if (loading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SMS Supplier Settings</h1>
        <p className="text-muted-foreground">Configure which SMS provider to use</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active SMS Supplier</CardTitle>
          <CardDescription>
            Select which SMS supplier to use for phone numbers. Switch if one is down.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={currentSupplier} 
            onValueChange={setCurrentSupplier}
            className="space-y-4"
          >
            {suppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <RadioGroupItem value={supplier.id} id={supplier.id} />
                <Label htmlFor={supplier.id} className="flex-1 cursor-pointer">
                  <span className="font-medium">{supplier.name}</span>
                </Label>
                {currentSupplier === supplier.id && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="mt-6"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Status</CardTitle>
          <CardDescription>Current status of all SMS suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">{supplier.name}</span>
                <Badge variant={currentSupplier === supplier.id ? "success" : "secondary"}>
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
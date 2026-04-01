"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Service {
  id: string
  name: string
  countries: {
    id: string
    name: string
    price: number | null
  }[]
}

export default function SMSOrderPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("wallet")
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then(res => res.json()),
      fetch("/api/wallet/balance").then(res => res.json()),
    ]).then(([servicesData, balanceData]) => {
      setServices(servicesData.services)
      setBalance(parseFloat(balanceData.balance) || 0)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const selectedServiceData = services.find(s => s.id === selectedService)
  const selectedCountryData = selectedServiceData?.countries.find(c => c.id === selectedCountry)
  const orderPrice = selectedCountryData?.price || 0
  const hasSufficientFunds = balance >= orderPrice

  const handleOrder = async () => {
    if (!selectedService || !selectedCountry) return
    setOrdering(true)

    try {
      const res = await fetch("/api/sms/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService,
          country: selectedCountry,
          paymentMethodId: paymentMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Order failed")
        setOrdering(false)
        return
      }

      if (data.remainingBalance !== undefined) {
        setBalance(parseFloat(data.remainingBalance))
      }

      alert("Order placed successfully!")
      router.push("/dashboard/orders")
    } catch (err) {
      alert("Something went wrong")
      setOrdering(false)
    }
  }

  if (loading) {
    return <div>Loading services...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order SMS Verification</h1>
        <p className="text-muted-foreground">Get a temporary phone number for OTP verification</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">₦{balance.toLocaleString()}</span>
            <Button variant="outline" onClick={() => router.push("/dashboard/wallet")}>
              Add Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Service & Country</CardTitle>
          <CardDescription>Choose the service you need verification for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select 
                value={selectedCountry} 
                onValueChange={setSelectedCountry}
                disabled={!selectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {selectedServiceData?.countries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name} {country.price ? `₦${country.price}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCountryData?.price && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Price: ₦{selectedCountryData.price}</span>
                {paymentMethod === "wallet" && (
                  hasSufficientFunds ? (
                    <Badge variant="success">Sufficient funds</Badge>
                  ) : (
                    <Badge variant="destructive">Insufficient funds</Badge>
                  )
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Payment will be deducted from your wallet balance
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet">Wallet Balance (₦{balance.toLocaleString()})</SelectItem>
                <SelectItem value="manual" disabled>Manual Transfer (Coming Soon)</SelectItem>
                <SelectItem value="paystack" disabled>Paystack (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleOrder} 
            disabled={!selectedService || !selectedCountry || !selectedCountryData?.price || ordering || (paymentMethod === "wallet" && !hasSufficientFunds)}
            className="w-full"
          >
            {ordering ? "Processing..." : paymentMethod === "wallet" && !hasSufficientFunds ? "Insufficient Funds" : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
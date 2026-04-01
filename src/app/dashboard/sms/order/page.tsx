"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data.services)
        setLoading(false)
      })
  }, [])

  const selectedServiceData = services.find(s => s.id === selectedService)
  const selectedCountryData = selectedServiceData?.countries.find(c => c.id === selectedCountry)

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
          paymentMethodId: "paystack", // Default to paystack
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Order failed")
        setOrdering(false)
        return
      }

      router.push(`/dashboard/orders?order=${data.id}`)
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
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">Price: ₦{selectedCountryData.price}</p>
              <p className="text-sm text-muted-foreground">Payment required to receive phone number</p>
            </div>
          )}

          <Button 
            onClick={handleOrder} 
            disabled={!selectedService || !selectedCountry || !selectedCountryData?.price || ordering}
            className="w-full"
          >
            {ordering ? "Processing..." : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Country {
  id: string
  name: string
  code?: string
  price: number | null
  basePrice: number | null
}

interface Service {
  id: string
  name: string
  countries: Country[]
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
  const [serviceSearch, setServiceSearch] = useState("")
  const [countrySearch, setCountrySearch] = useState("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    Promise.all([
      fetch("/api/supplier/services").then(res => res.json()),
      fetch("/api/wallet/balance").then(res => res.json()),
    ]).then(([servicesData, balanceData]) => {
      if (servicesData.services) {
        setServices(servicesData.services)
        if (servicesData.message) {
          console.log(servicesData.message)
        }
      }
      setBalance(parseFloat(balanceData.balance) || 0)
      setLoading(false)
    }).catch(() => {
      setError("Failed to load services")
      setLoading(false)
    })
  }, [])

  const filteredServices = serviceSearch.trim() === "" 
    ? services 
    : services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))

  const selectedServiceData = services.find(s => s.id === selectedService)
  const filteredCountries = selectedServiceData 
    ? (countrySearch.trim() === "" 
        ? selectedServiceData.countries 
        : selectedServiceData.countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())))
    : []

  const selectedCountryData = selectedServiceData?.countries.find(c => c.id === selectedCountry)
  const orderPrice = selectedCountryData?.price || 0
  const hasSufficientFunds = balance >= orderPrice

  const handleOrder = async () => {
    if (!selectedService || !selectedCountry) return
    if (!selectedCountryData?.price) {
      setError("This service/country is not configured yet. Please contact admin.")
      return
    }
    
    setOrdering(true)
    setError("")

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
        setError(data.error || "Order failed")
        setOrdering(false)
        return
      }

      if (data.remainingBalance !== undefined) {
        setBalance(parseFloat(data.remainingBalance))
      }

      alert("Order placed successfully!")
      router.push("/dashboard/orders")
    } catch {
      setError("Something went wrong")
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-green" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Order SMS Verification</h1>
        <p className="text-light-lavender">Get a temporary phone number for OTP verification</p>
      </div>

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <CardTitle className="text-white">Your Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white">₦{balance.toLocaleString()}</span>
            <Button variant="outline" onClick={() => router.push("/dashboard/wallet")} className="text-white border-light-lavender">
              Add Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <CardTitle className="text-white">Select Service & Country</CardTitle>
          <CardDescription className="text-light-lavender">
            Choose the service you need verification for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Service</Label>
              <Input
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50"
              />
              <Select value={selectedService} onValueChange={(v) => { setSelectedService(v); setCountrySearch("") }}>
                <SelectTrigger className="bg-white/10 border-light-lavender/30 text-white">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Country</Label>
              <Input
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                disabled={!selectedService}
                className="bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50"
              />
              <Select 
                value={selectedCountry} 
                onValueChange={setSelectedCountry}
                disabled={!selectedService}
              >
                <SelectTrigger className="bg-white/10 border-light-lavender/30 text-white">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCountries.map(country => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name} {country.price ? `₦${country.price}` : "(not configured)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCountryData && (
            <div className="p-4 bg-white/5 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Price: ₦{selectedCountryData.price || "Not configured"}</span>
                {paymentMethod === "wallet" && (
                  selectedCountryData.price && hasSufficientFunds ? (
                    <Badge className="bg-mint-green/20 text-mint-green">Sufficient funds</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400">Insufficient funds</Badge>
                  )
                )}
              </div>
              <p className="text-sm text-light-lavender">
                Payment will be deducted from your wallet balance
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-white">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-white/10 border-light-lavender/30 text-white">
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
            className="w-full bg-mint-green text-navy hover:bg-mint-green/80"
          >
            {ordering ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </span>
            ) : paymentMethod === "wallet" && !hasSufficientFunds ? (
              "Insufficient Funds"
            ) : (
              "Place Order"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, Users, Eye, Heart, MessageCircle } from "lucide-react"

interface BoostService {
  id: string
  name: string
  platform: string
  price: number
  minOrder: number
  maxOrder: number
}

interface BoostPlatform {
  id: string
  name: string
  services: {
    id: string
    name: string
    products: BoostService[]
  }[]
}

interface ServicesData {
  boost: {
    platforms: BoostPlatform[]
  }
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Users className="h-5 w-5" />,
  facebook: <Users className="h-5 w-5" />,
  tiktok: <TrendingUp className="h-5 w-5" />,
  youtube: <Eye className="h-5 w-5" />,
  twitter: <Users className="h-5 w-5" />,
}

const serviceIcons: Record<string, React.ReactNode> = {
  followers: <Users className="h-4 w-4" />,
  likes: <Heart className="h-4 w-4" />,
  views: <Eye className="h-4 w-4" />,
  subscribers: <Users className="h-4 w-4" />,
  comments: <MessageCircle className="h-4 w-4" />,
}

export default function BoostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<ServicesData | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<BoostService | null>(null)
  const [targetUrl, setTargetUrl] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [orderLoading, setOrderLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/services")
      .then(res => res.json())
      .then(data => {
        setServices(data)
        if (data.boost?.platforms?.length > 0) {
          setSelectedPlatform(data.boost.platforms[0].id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const platforms = services?.boost?.platforms || []
  const currentPlatform = platforms.find(p => p.id === selectedPlatform)
  const currentService = currentPlatform?.services.find(s => s.id === selectedService)

  useEffect(() => {
    if (currentPlatform?.services.length && !selectedService) {
      const firstService = currentPlatform.services[0]
      setSelectedService(firstService.id)
      if (firstService.products.length) {
        setSelectedProduct(firstService.products[0])
        setQuantity(firstService.products[0].minOrder)
      }
    }
  }, [currentPlatform, selectedService])

  const handleQuantityChange = (value: number) => {
    setQuantity(value)
    if (currentService?.products.length) {
      const closest = currentService.products.reduce((prev, curr) => 
        Math.abs(curr.minOrder - value) < Math.abs(prev.minOrder - value) ? curr : prev
      )
      setSelectedProduct(closest)
    }
  }

  const handleOrder = async () => {
    if (!selectedProduct) {
      setError("Please select a service")
      return
    }
    if (!targetUrl) {
      setError("Please enter a profile URL or username")
      return
    }

    setOrderLoading(true)
    setError("")

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricingRuleId: selectedProduct.id,
          quantity,
          paymentMethodId: "wallet",
          targetUrl,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push(`/dashboard/orders?success=true&orderId=${data.id}`)
      } else {
        setError(data.error || "Failed to place order")
      }
    } catch {
      setError("Failed to place order")
    } finally {
      setOrderLoading(false)
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
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-orange-500" />
          Social Media Boost
        </h1>
        <p className="text-light-lavender mt-2">
          Get followers, likes, views and more for your social media accounts
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-navy/50 border-light-lavender/20">
          <CardHeader>
            <CardTitle className="text-white">Select Platform</CardTitle>
            <CardDescription>Choose the social media platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatform(platform.id)
                    setSelectedService("")
                    setSelectedProduct(null)
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedPlatform === platform.id
                      ? "border-mint-green bg-mint-green/10"
                      : "border-light-lavender/20 hover:border-mint-green/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-primary-blue">{platformIcons[platform.id]}</div>
                    <span className="text-white text-sm capitalize">{platform.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {currentPlatform && (
              <div className="space-y-3 mt-4">
                <Label>Service Type</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="bg-white/5 border-light-lavender/20 text-white">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentPlatform.services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center gap-2">
                          {serviceIcons[service.id]}
                          <span className="capitalize">{service.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentService && (
              <div className="space-y-3">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={e => handleQuantityChange(parseInt(e.target.value) || 0)}
                  min={currentService.products[0]?.minOrder || 1}
                  max={currentService.products[0]?.maxOrder || 10000}
                  className="bg-white/5 border-light-lavender/20 text-white"
                />
                <div className="flex gap-2 flex-wrap">
                  {currentService.products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product)
                        setQuantity(product.minOrder)
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedProduct?.id === product.id
                          ? "bg-mint-green text-navy"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {product.name.split(" ").pop()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Profile URL or Username</Label>
              <Input
                placeholder="https://instagram.com/username or @username"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                className="bg-white/5 border-light-lavender/20 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy/50 border-light-lavender/20">
          <CardHeader>
            <CardTitle className="text-white">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProduct ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-light-lavender">
                    <span>Platform</span>
                    <span className="text-white capitalize">{currentPlatform?.name}</span>
                  </div>
                  <div className="flex justify-between text-light-lavender">
                    <span>Service</span>
                    <span className="text-white capitalize">{currentService?.name}</span>
                  </div>
                  <div className="flex justify-between text-light-lavender">
                    <span>Quantity</span>
                    <span className="text-white">{quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-light-lavender">
                    <span>Price per unit</span>
                    <span className="text-white">₦{(selectedProduct.price / selectedProduct.minOrder).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-light-lavender/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-mint-green">
                      ₦{selectedProduct.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>
                )}

                <Button
                  onClick={handleOrder}
                  disabled={orderLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {orderLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-light-lavender text-xs text-center">
                  Orders are processed automatically. Delivery time varies by service.
                </p>
              </>
            ) : (
              <div className="text-center py-8 text-light-lavender">
                Select a platform and service to see pricing
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

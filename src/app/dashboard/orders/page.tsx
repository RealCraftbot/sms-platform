"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface OrderItem {
  id: string
  serviceType: string
  service?: string
  platform?: string
  subService?: string
  country?: string
  quantity: number
  unitPrice: number
  status: string
  phoneNumber?: string
  supplierOrderId?: string
  otpCode?: string
  otpText?: string
  deliveredQuantity?: number
  startedAt?: string
  completedAt?: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  currency: string
  createdAt: string
  items: OrderItem[]
  paymentMethod: {
    name: string
    type: string
  }
}

const statusColors: Record<string, string> = {
  pending: "warning",
  processing: "warning",
  paid: "success",
  awaiting_approval: "warning",
  approved: "success",
  completed: "success",
  cancelled: "destructive",
  failed: "destructive",
  partial: "warning",
}

const typeLabels: Record<string, string> = {
  SMS_NUMBER: "SMS",
  SOCIAL_LOG: "Log",
  SOCIAL_BOOST: "Boost",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchOrders = () => {
    fetch("/api/order")
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (!mounted) return
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [mounted])

  const checkOrder = async (orderId: string) => {
    setCheckingId(orderId)
    try {
      const res = await fetch("/api/order/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()

      if (data.success) {
        fetchOrders()
      }

      if (data.message) {
        alert(data.message)
      }
    } catch {
      alert("Failed to check order")
    } finally {
      setCheckingId(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true
    return order.items.some(item => item.serviceType === activeTab)
  })

  const getTypeLabel = (serviceType: string) => typeLabels[serviceType] || serviceType

  if (!mounted || loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Order History</h1>
        <p className="text-light-lavender">View all your orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="SMS_NUMBER">SMS Numbers</TabsTrigger>
          <TabsTrigger value="SOCIAL_LOG">Social Logs</TabsTrigger>
          <TabsTrigger value="SOCIAL_BOOST">Social Boost</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="hidden md:block bg-navy/50 border-light-lavender/20">
            <CardHeader>
              <CardTitle className="text-white">Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-light-lavender/20">
                    <TableHead className="text-light-lavender">Order ID</TableHead>
                    <TableHead className="text-light-lavender">Type</TableHead>
                    <TableHead className="text-light-lavender">Service</TableHead>
                    <TableHead className="text-light-lavender">Details</TableHead>
                    <TableHead className="text-light-lavender">Amount</TableHead>
                    <TableHead className="text-light-lavender">Status</TableHead>
                    <TableHead className="text-light-lavender">Date</TableHead>
                    <TableHead className="text-light-lavender">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id} className="border-light-lavender/10">
                      <TableCell className="font-mono text-xs text-white">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {order.items.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {getTypeLabel(item.serviceType)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm capitalize">
                            {item.platform || item.service || item.serviceType}
                            {item.subService && ` / ${item.subService}`}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.serviceType === "SMS_NUMBER" && item.phoneNumber && (
                              <span className="font-mono text-sm text-white">{item.phoneNumber}</span>
                            )}
                            {item.serviceType === "SMS_NUMBER" && !item.phoneNumber && (
                              <span className="text-light-lavender text-sm">-</span>
                            )}
                            {item.serviceType === "SOCIAL_LOG" && (
                              <span className="text-light-lavender text-sm">{item.quantity} account(s)</span>
                            )}
                            {item.serviceType === "SOCIAL_BOOST" && (
                              <span className="text-light-lavender text-sm">
                                {item.quantity} / {item.deliveredQuantity || 0} delivered
                              </span>
                            )}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="text-white">₦{order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant={(statusColors[order.status] || "secondary") as "default" | "secondary" | "destructive" | "outline" | "success"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-light-lavender">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.status === "paid" && order.items.some(i => i.supplierOrderId) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => checkOrder(order.id)}
                            disabled={checkingId === order.id}
                            className="text-white border-light-lavender/30"
                          >
                            {checkingId === order.id ? "..." : "Check"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredOrders.length === 0 && (
                <p className="text-center py-8 text-light-lavender">No orders yet</p>
              )}
            </CardContent>
          </Card>

          <div className="md:hidden space-y-4">
            {filteredOrders.map(order => (
              <Card key={order.id} className="bg-navy/50 border-light-lavender/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-light-lavender text-xs">Order ID</span>
                      <p className="font-mono text-white text-sm">{order.id.slice(0, 8)}</p>
                    </div>
                    <Badge variant={(statusColors[order.status] || "secondary") as "default" | "secondary" | "destructive" | "outline" | "success"}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <span className="text-light-lavender text-xs">Type</span>
                      <div className="flex gap-1 mt-1">
                        {order.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {getTypeLabel(item.serviceType)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-light-lavender text-xs">Amount</span>
                      <p className="text-white font-semibold">₦{order.totalAmount}</p>
                    </div>
                  </div>

                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.serviceType === "SMS_NUMBER" && (
                        <>
                          <div className="text-light-lavender text-xs">Phone</div>
                          {item.phoneNumber ? (
                            <p className="font-mono text-white">{item.phoneNumber}</p>
                          ) : (
                            <p className="text-light-lavender text-sm">Waiting...</p>
                          )}
                          {item.otpCode && (
                            <div className="mt-2">
                              <span className="text-light-lavender text-xs">OTP</span>
                              <p className="text-white font-semibold text-lg">{item.otpCode}</p>
                            </div>
                          )}
                        </>
                      )}
                      {item.serviceType === "SOCIAL_LOG" && (
                        <p className="text-white">{item.quantity} account(s) - {item.platform}</p>
                      )}
                      {item.serviceType === "SOCIAL_BOOST" && (
                        <>
                          <p className="text-white capitalize">{item.platform} / {item.subService}</p>
                          <p className="text-light-lavender text-sm">
                            {item.deliveredQuantity || 0} / {item.quantity} delivered
                          </p>
                        </>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-2 border-t border-light-lavender/10">
                    <span className="text-light-lavender text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                    {order.status === "paid" && order.items.some(i => i.supplierOrderId) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => checkOrder(order.id)}
                        disabled={checkingId === order.id}
                        className="text-white border-light-lavender/30"
                      >
                        {checkingId === order.id ? "..." : "Check"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOrders.length === 0 && (
              <Card className="bg-navy/50 border-light-lavender/20">
                <CardContent className="p-8 text-center">
                  <p className="text-light-lavender">No orders yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {filteredOrders.some(o => o.items.some(i => i.otpText)) && (
            <Card className="bg-navy/50 border-light-lavender/20">
              <CardHeader>
                <CardTitle className="text-white">Received SMS Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredOrders.filter(o => o.items.some(i => i.otpText)).map(order => (
                  order.items.filter(i => i.otpText).map((item, idx) => (
                    <Alert key={`${order.id}-${idx}`} className="bg-white/5 border-light-lavender/20">
                      <AlertDescription className="text-white">
                        <div className="space-y-2">
                          <div className="flex justify-between flex-wrap gap-2">
                            <span className="font-semibold">{item.phoneNumber || "Unknown"}</span>
                            <span className="text-sm text-light-lavender">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-lg font-mono">{item.otpText}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

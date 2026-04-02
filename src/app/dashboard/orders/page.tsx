"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Order {
  id: string
  type: string
  status: string
  amount: number
  currency: string
  createdAt: string
  smsOrder: {
    service: string
    country: string
    phoneNumber: string | null
    supplierOrderId: string | null
    smsCode: string | null
    smsText: string | null
    expiresAt: string | null
  } | null
  logOrder: {
    items: string[]
  } | null
  paymentMethod: {
    name: string
    type: string
  }
}

const statusColors: Record<string, string> = {
  pending: "warning",
  paid: "success",
  awaiting_approval: "warning",
  approved: "success",
  completed: "success",
  cancelled: "destructive",
  failed: "destructive",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingId, setCheckingId] = useState<string | null>(null)

  const fetchOrders = () => {
    fetch("/api/sms/order")
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkSms = async (orderId: string) => {
    setCheckingId(orderId)
    try {
      const res = await fetch("/api/sms/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      
      if (data.success) {
        fetchOrders()
      }
      
      if (!data.success && data.message) {
        alert(data.message)
      }
    } catch {
      alert("Failed to check SMS")
    } finally {
      setCheckingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-white">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Order History</h1>
        <p className="text-light-lavender">View all your orders</p>
      </div>

      {/* Desktop Table View */}
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
                <TableHead className="text-light-lavender">Phone Number</TableHead>
                <TableHead className="text-light-lavender">SMS Code</TableHead>
                <TableHead className="text-light-lavender">Amount</TableHead>
                <TableHead className="text-light-lavender">Status</TableHead>
                <TableHead className="text-light-lavender">Date</TableHead>
                <TableHead className="text-light-lavender">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} className="border-light-lavender/10">
                  <TableCell className="font-mono text-xs text-white">{order.id.slice(0, 8)}</TableCell>
                  <TableCell className="capitalize text-white">{order.type}</TableCell>
                  <TableCell>
                    {order.type === "sms" && order.smsOrder?.phoneNumber && (
                      <span className="font-mono text-sm text-white">{order.smsOrder.phoneNumber}</span>
                    )}
                    {order.type === "sms" && !order.smsOrder?.phoneNumber && (
                      <span className="text-light-lavender text-sm">-</span>
                    )}
                    {order.type === "log" && (
                      <span className="text-light-lavender text-sm">{(order.logOrder?.items as string[] || []).length} item(s)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.type === "sms" && order.smsOrder?.smsCode && (
                      <Badge variant="default">{order.smsOrder.smsCode}</Badge>
                    )}
                    {order.type === "sms" && order.smsOrder?.smsText && !order.smsOrder?.smsCode && (
                      <span className="text-xs text-light-lavender truncate max-w-[100px] inline-block">
                        {order.smsOrder.smsText}
                      </span>
                    )}
                    {order.type === "sms" && !order.smsOrder?.smsCode && !order.smsOrder?.smsText && (
                      <span className="text-light-lavender text-sm">Waiting...</span>
                    )}
                  </TableCell>
                  <TableCell className="text-white">₦{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={(statusColors[order.status] || "secondary") as "default" | "secondary" | "destructive" | "outline" | "success"}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-light-lavender">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.type === "sms" && order.status === "paid" && order.smsOrder?.supplierOrderId && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => checkSms(order.id)}
                        disabled={checkingId === order.id}
                        className="text-white border-light-lavender/30"
                      >
                        {checkingId === order.id ? "Checking..." : "Check SMS"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <p className="text-center py-8 text-light-lavender">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.map(order => (
          <Card key={order.id} className="bg-navy/50 border-light-lavender/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-light-lavender text-xs">Order ID</span>
                  <p className="font-mono text-white text-sm">{order.id.slice(0, 8)}</p>
                </div>
                <Badge variant={(statusColors[order.status] || "secondary") as "default" | "secondary" | "destructive" | "outline" | "success"}>{order.status}</Badge>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <span className="text-light-lavender text-xs">Type</span>
                  <p className="text-white capitalize">{order.type}</p>
                </div>
                <div>
                  <span className="text-light-lavender text-xs">Amount</span>
                  <p className="text-white font-semibold">₦{order.amount}</p>
                </div>
              </div>

              {order.type === "sms" && (
                <>
                  {order.smsOrder?.phoneNumber && (
                    <div>
                      <span className="text-light-lavender text-xs">Phone Number</span>
                      <p className="font-mono text-white">{order.smsOrder.phoneNumber}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-light-lavender text-xs">SMS</span>
                    {order.smsOrder?.smsCode && (
                      <p className="text-white font-semibold">{order.smsOrder.smsCode}</p>
                    )}
                    {order.smsOrder?.smsText && !order.smsOrder?.smsCode && (
                      <p className="text-light-lavender text-sm truncate">{order.smsOrder.smsText}</p>
                    )}
                    {!order.smsOrder?.smsCode && !order.smsOrder?.smsText && (
                      <p className="text-yellow-400 text-sm">Waiting for SMS...</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-light-lavender/10">
                <span className="text-light-lavender text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                {order.type === "sms" && order.status === "paid" && order.smsOrder?.supplierOrderId && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => checkSms(order.id)}
                    disabled={checkingId === order.id}
                    className="text-white border-light-lavender/30"
                  >
                    {checkingId === order.id ? "Checking..." : "Check SMS"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card className="bg-navy/50 border-light-lavender/20">
            <CardContent className="p-8 text-center">
              <p className="text-light-lavender">No orders yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {orders.some(o => o.type === "sms" && o.smsOrder?.smsText) && (
        <Card className="bg-navy/50 border-light-lavender/20">
          <CardHeader>
            <CardTitle className="text-white">Received SMS Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.filter(o => o.type === "sms" && o.smsOrder?.smsText).map(order => (
              <Alert key={order.id} className="bg-white/5 border-light-lavender/20">
                <AlertDescription className="text-white">
                  <div className="space-y-2">
                    <div className="flex justify-between flex-wrap gap-2">
                      <span className="font-semibold">{order.smsOrder?.phoneNumber}</span>
                      <span className="text-sm text-light-lavender">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-lg font-mono">{order.smsOrder?.smsText}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
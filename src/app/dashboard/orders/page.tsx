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
    } catch (err) {
      alert("Failed to check SMS")
    } finally {
      setCheckingId(null)
    }
  }

  if (loading) {
    return <div>Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-muted-foreground">View all your orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>SMS Code</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell className="capitalize">{order.type}</TableCell>
                  <TableCell>
                    {order.type === "sms" && order.smsOrder?.phoneNumber && (
                      <span className="font-mono text-sm">{order.smsOrder.phoneNumber}</span>
                    )}
                    {order.type === "sms" && !order.smsOrder?.phoneNumber && (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                    {order.type === "log" && (
                      <span className="text-muted-foreground text-sm">{(order.logOrder?.items as string[] || []).length} item(s)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.type === "sms" && order.smsOrder?.smsCode && (
                      <Badge variant="default">{order.smsOrder.smsCode}</Badge>
                    )}
                    {order.type === "sms" && order.smsOrder?.smsText && !order.smsOrder?.smsCode && (
                      <span className="text-xs text-muted-foreground truncate max-w-[100px] inline-block">
                        {order.smsOrder.smsText}
                      </span>
                    )}
                    {order.type === "sms" && !order.smsOrder?.smsCode && !order.smsOrder?.smsText && (
                      <span className="text-muted-foreground text-sm">Waiting...</span>
                    )}
                  </TableCell>
                  <TableCell>₦{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status] as any}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.type === "sms" && order.status === "paid" && order.smsOrder?.supplierOrderId && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => checkSms(order.id)}
                        disabled={checkingId === order.id}
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
            <p className="text-center py-8 text-muted-foreground">No orders yet</p>
          )}
        </CardContent>
      </Card>

      {orders.some(o => o.type === "sms" && o.smsOrder?.smsText) && (
        <Card>
          <CardHeader>
            <CardTitle>Received SMS Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.filter(o => o.type === "sms" && o.smsOrder?.smsText).map(order => (
              <Alert key={order.id}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{order.smsOrder?.phoneNumber}</span>
                      <span className="text-sm text-muted-foreground">
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
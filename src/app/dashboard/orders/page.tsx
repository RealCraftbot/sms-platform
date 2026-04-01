"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
    smsCode: string | null
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
}

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sms/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
  }, [])

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
                <TableHead>Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell className="capitalize">{order.type}</TableCell>
                  <TableCell>
                    {order.type === "sms" && order.smsOrder && (
                      <div>
                        <p>{order.smsOrder.service}</p>
                        {order.smsOrder.phoneNumber && (
                          <p className="text-sm text-muted-foreground">{order.smsOrder.phoneNumber}</p>
                        )}
                      </div>
                    )}
                    {order.type === "log" && order.logOrder && (
                      <p>{(order.logOrder.items as string[]).length} item(s)</p>
                    )}
                  </TableCell>
                  <TableCell>₦{order.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status] as any}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Share2, Search, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BoostOrder {
  id: string
  orderId: string
  platform: string
  service: string
  link: string
  quantity: number
  status: string
  price: number
  progress?: number
  createdAt: string
  completedAt?: string
}

export default function BoostingPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<BoostOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED">("ALL")

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

    fetch("/api/admin/boosting", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleCancel = async (id: string) => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    try {
      const res = await fetch(`/api/admin/boosting/${id}/cancel`, {
        method: "POST",
        headers: { "x-admin-id": adminId }
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELLED" } : o))
      }
    } catch {
      console.error("Failed to cancel boost order")
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.link?.toLowerCase().includes(search.toLowerCase()) ||
      o.platform?.toLowerCase().includes(search.toLowerCase()) ||
      o.service?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || o.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PROCESSING: "bg-blue-500/20 text-blue-400",
    COMPLETED: "bg-emerald-500/20 text-emerald-400",
    CANCELLED: "bg-red-500/20 text-red-400"
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
          <h1 className="text-3xl font-bold text-white">Manage Boosting (SMM)</h1>
          <p className="text-white/60">View and manage social media boosting orders</p>
        </div>
        <Share2 className="h-8 w-8 text-emerald-500" />
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">Boost Orders ({filteredOrders.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by link, platform..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const).map(f => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className={filter === f ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/60">Order ID</TableHead>
                <TableHead className="text-white/60">Platform</TableHead>
                <TableHead className="text-white/60">Service</TableHead>
                <TableHead className="text-white/60">Link</TableHead>
                <TableHead className="text-white/60">Quantity</TableHead>
                <TableHead className="text-white/60">Progress</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Price</TableHead>
                <TableHead className="text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id} className="border-white/10">
                  <TableCell className="text-white/60 text-xs font-mono">{order.orderId}</TableCell>
                  <TableCell className="text-white capitalize">{order.platform}</TableCell>
                  <TableCell className="text-white/80 capitalize">{order.service}</TableCell>
                  <TableCell className="text-white/60 text-xs max-w-[200px] truncate">{order.link}</TableCell>
                  <TableCell className="text-white">{order.quantity.toLocaleString()}</TableCell>
                  <TableCell>
                    {order.progress !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${Math.min(100, (order.progress / order.quantity) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">{order.progress}/{order.quantity}</span>
                      </div>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] || "bg-white/10"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-emerald-400">₦{order.price.toLocaleString()}</TableCell>
                  <TableCell>
                    {order.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancel(order.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrders.length === 0 && (
            <p className="text-center py-8 text-white/40">No boost orders found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, KeyRound, Search, Check, X, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface OTPOrder {
  id: string
  orderId: string
  phoneNumber: string
  service: string
  code?: string
  status: string
  price: number
  createdAt: string
  completedAt?: string
}

export default function OTPPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OTPOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RECEIVED" | "CANCELLED">("ALL")
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set())

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

    fetch("/api/admin/otp", { headers: { "x-admin-id": adminId } })
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
      const res = await fetch(`/api/admin/otp/${id}/cancel`, {
        method: "POST",
        headers: { "x-admin-id": adminId }
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELLED" } : o))
      }
    } catch {
      console.error("Failed to cancel OTP")
    }
  }

  const toggleCodeVisibility = (id: string) => {
    setVisibleCodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.phoneNumber?.includes(search) || o.service?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || o.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    RECEIVED: "bg-emerald-500/20 text-emerald-400",
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
          <h1 className="text-3xl font-bold text-white">Manage OTP</h1>
          <p className="text-white/60">View and manage OTP orders and codes</p>
        </div>
        <KeyRound className="h-8 w-8 text-emerald-500" />
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">OTP Orders ({filteredOrders.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by number or service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                {(["ALL", "PENDING", "RECEIVED", "CANCELLED"] as const).map(f => (
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
                <TableHead className="text-white/60">Phone</TableHead>
                <TableHead className="text-white/60">Service</TableHead>
                <TableHead className="text-white/60">Code</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Price</TableHead>
                <TableHead className="text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id} className="border-white/10">
                  <TableCell className="text-white/60 text-xs font-mono">{order.orderId}</TableCell>
                  <TableCell className="text-white font-mono">{order.phoneNumber}</TableCell>
                  <TableCell className="text-white/80 capitalize">{order.service}</TableCell>
                  <TableCell>
                    {order.code ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${visibleCodes.has(order.id) ? "text-emerald-400" : "text-white/40"}`}>
                          {visibleCodes.has(order.id) ? order.code : "••••"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCodeVisibility(order.id)}
                          className="h-6 w-6 p-0 text-white/40 hover:text-white"
                        >
                          {visibleCodes.has(order.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
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
            <p className="text-center py-8 text-white/40">No OTP orders found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

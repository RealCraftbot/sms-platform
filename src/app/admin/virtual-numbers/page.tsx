"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Phone, Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface VirtualNumber {
  id: string
  phoneNumber: string
  service: string
  country: string
  status: string
  price: number
  orderId?: string
  createdAt: string
}

export default function VirtualNumbersPage() {
  const router = useRouter()
  const [numbers, setNumbers] = useState<VirtualNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchNumbers = async () => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    setRefreshing(true)
    try {
      const res = await fetch("/api/admin/virtual-numbers", { headers: { "x-admin-id": adminId } })
      if (res.ok) {
        const data = await res.json()
        setNumbers(Array.isArray(data) ? data : [])
      }
    } catch {
      console.error("Failed to fetch virtual numbers")
    }
    setRefreshing(false)
  }

  useEffect(() => {
    if (!mounted) return

    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")

    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    fetchNumbers().finally(() => setLoading(false))
  }, [mounted, router])

  const filteredNumbers = numbers.filter(n =>
    n.phoneNumber?.includes(search) ||
    n.service?.toLowerCase().includes(search.toLowerCase()) ||
    n.country?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-emerald-500/20 text-emerald-400",
    SOLD: "bg-blue-500/20 text-blue-400",
    RESERVED: "bg-yellow-500/20 text-yellow-400",
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
          <h1 className="text-3xl font-bold text-white">Manage Virtual Numbers</h1>
          <p className="text-white/60">View and manage SMS virtual numbers</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNumbers}
            disabled={refreshing}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Phone className="h-8 w-8 text-emerald-500" />
        </div>
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Virtual Numbers ({filteredNumbers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search numbers, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/60">Phone Number</TableHead>
                <TableHead className="text-white/60">Service</TableHead>
                <TableHead className="text-white/60">Country</TableHead>
                <TableHead className="text-white/60">Price</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNumbers.map(num => (
                <TableRow key={num.id} className="border-white/10">
                  <TableCell className="text-white font-mono">{num.phoneNumber}</TableCell>
                  <TableCell className="text-white/80 capitalize">{num.service}</TableCell>
                  <TableCell className="text-white/60 uppercase">{num.country}</TableCell>
                  <TableCell className="text-emerald-400">₦{num.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[num.status] || "bg-white/10"}>
                      {num.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {new Date(num.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredNumbers.length === 0 && (
            <p className="text-center py-8 text-white/40">No virtual numbers found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

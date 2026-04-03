"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Wallet, Search, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Deposit {
  id: string
  userId: string
  userEmail: string
  amount: number
  status: string
  paymentMethod: string
  reference: string
  proofUrl?: string
  reviewedAt?: string
  reviewedBy?: string
  createdAt: string
}

export default function DepositsPage() {
  const router = useRouter()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [processing, setProcessing] = useState<string | null>(null)

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

    fetch("/api/admin/deposits", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setDeposits(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/deposits/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId
        },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        setDeposits(prev => prev.map(d => 
          d.id === id ? { ...d, status, reviewedAt: new Date().toISOString() } : d
        ))
      }
    } catch {
      console.error("Failed to review deposit")
    }
    setProcessing(null)
  }

  const filteredDeposits = deposits.filter(d => {
    const matchesSearch = d.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      d.reference?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || d.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    APPROVED: "bg-emerald-500/20 text-emerald-400",
    REJECTED: "bg-red-500/20 text-red-400"
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
          <h1 className="text-3xl font-bold text-white">Manage Deposits</h1>
          <p className="text-white/60">Review and approve wallet deposits</p>
        </div>
        <Wallet className="h-8 w-8 text-emerald-500" />
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">All Deposits ({filteredDeposits.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by email or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(f => (
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
                <TableHead className="text-white/60">User</TableHead>
                <TableHead className="text-white/60">Amount</TableHead>
                <TableHead className="text-white/60">Method</TableHead>
                <TableHead className="text-white/60">Reference</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Date</TableHead>
                <TableHead className="text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map(deposit => (
                <TableRow key={deposit.id} className="border-white/10">
                  <TableCell className="text-white font-medium">{deposit.userEmail}</TableCell>
                  <TableCell className="text-emerald-400 font-bold">₦{deposit.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-white/80 capitalize">{deposit.paymentMethod}</TableCell>
                  <TableCell className="text-white/60 text-xs">{deposit.reference}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[deposit.status] || "bg-white/10"}>
                      {deposit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {deposit.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReview(deposit.id, "APPROVED")}
                          disabled={processing === deposit.id}
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReview(deposit.id, "REJECTED")}
                          disabled={processing === deposit.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredDeposits.length === 0 && (
            <p className="text-center py-8 text-white/40">No deposits found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

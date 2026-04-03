"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Receipt, Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  paymentMethod?: string
  gateway?: string
  reference: string
  userEmail: string
  description?: string
  createdAt: string
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "WALLET_FUNDING" | "ORDER" | "REFUND">("ALL")

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

    fetch("/api/admin/transactions", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setTransactions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.reference?.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || t.type === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PROCESSING: "bg-blue-500/20 text-blue-400",
    APPROVED: "bg-emerald-500/20 text-emerald-400",
    COMPLETED: "bg-emerald-500/20 text-emerald-400",
    REJECTED: "bg-red-500/20 text-red-400",
    FAILED: "bg-red-500/20 text-red-400"
  }

  const typeColors: Record<string, string> = {
    WALLET_FUNDING: "bg-blue-500/20 text-blue-400",
    ORDER: "bg-purple-500/20 text-purple-400",
    REFUND: "bg-orange-500/20 text-orange-400"
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
          <h1 className="text-3xl font-bold text-white">View Transactions</h1>
          <p className="text-white/60">Complete transaction history</p>
        </div>
        <Receipt className="h-8 w-8 text-emerald-500" />
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">All Transactions ({filteredTransactions.length})</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by reference, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                {(["ALL", "WALLET_FUNDING", "ORDER", "REFUND"] as const).map(f => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className={filter === f ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                  >
                    {f === "WALLET_FUNDING" ? "Funding" : f.charAt(0) + f.slice(1).toLowerCase()}
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
                <TableHead className="text-white/60">Reference</TableHead>
                <TableHead className="text-white/60">Type</TableHead>
                <TableHead className="text-white/60">User</TableHead>
                <TableHead className="text-white/60">Amount</TableHead>
                <TableHead className="text-white/60">Gateway</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(tx => (
                <TableRow key={tx.id} className="border-white/10">
                  <TableCell className="text-white/60 text-xs font-mono">{tx.reference}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[tx.type] || "bg-white/10"}>
                      {tx.type === "WALLET_FUNDING" ? "Funding" : tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/80">{tx.userEmail}</TableCell>
                  <TableCell className={tx.type === "REFUND" ? "text-red-400" : "text-emerald-400"}>
                    {tx.type === "REFUND" ? "-" : "+"}₦{tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-white/60 capitalize">{tx.gateway || tx.paymentMethod || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[tx.status] || "bg-white/10"}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {new Date(tx.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTransactions.length === 0 && (
            <p className="text-center py-8 text-white/40">No transactions found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, FileText, Search, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SocialLog {
  id: string
  platform: string
  accountDetails: string
  price: number
  stock: number
  status: string
  createdAt: string
}

export default function SocialLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<SocialLog[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("ALL")

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

    fetch("/api/admin/social-logs", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleDelete = async (id: string) => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    if (!confirm("Delete this social log?")) return

    try {
      const res = await fetch(`/api/admin/social-logs/${id}`, {
        method: "DELETE",
        headers: { "x-admin-id": adminId }
      })
      if (res.ok) {
        setLogs(prev => prev.filter(l => l.id !== id))
      }
    } catch {
      console.error("Failed to delete social log")
    }
  }

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.platform?.toLowerCase().includes(search.toLowerCase()) ||
      l.accountDetails?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || l.platform.toLowerCase() === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const platforms = [...new Set(logs.map(l => l.platform))]

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
          <h1 className="text-3xl font-bold text-white">Manage Social Logs (Accounts)</h1>
          <p className="text-white/60">View and manage social media accounts for sale</p>
        </div>
        <Button 
          onClick={() => router.push("/admin/logs")}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Logs
        </Button>
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-white">Social Accounts ({filteredLogs.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by platform or details..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("ALL")}
                  className={filter === "ALL" ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                >
                  All
                </Button>
                {platforms.map(p => (
                  <Button
                    key={p}
                    variant={filter === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(p)}
                    className={filter === p ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                  >
                    {p}
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
                <TableHead className="text-white/60">Platform</TableHead>
                <TableHead className="text-white/60">Account Details</TableHead>
                <TableHead className="text-white/60">Stock</TableHead>
                <TableHead className="text-white/60">Price</TableHead>
                <TableHead className="text-white/60">Status</TableHead>
                <TableHead className="text-white/60">Date</TableHead>
                <TableHead className="text-white/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(log => (
                <TableRow key={log.id} className="border-white/10">
                  <TableCell>
                    <Badge className="bg-blue-500/20 text-blue-400 capitalize">
                      {log.platform}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/80 text-sm max-w-[300px] truncate">
                    {log.accountDetails}
                  </TableCell>
                  <TableCell className={log.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                    {log.stock}
                  </TableCell>
                  <TableCell className="text-white font-bold">₦{log.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={log.stock > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                      {log.stock > 0 ? "Available" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(log.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLogs.length === 0 && (
            <p className="text-center py-8 text-white/40">No social logs found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

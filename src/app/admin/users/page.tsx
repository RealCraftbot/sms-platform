"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Users as UsersIcon, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
  balance: number
  role: string
  createdAt: string
  _count: {
    orders: number
  }
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")

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

    fetch("/api/admin/users", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-white">Manage Users</h1>
          <p className="text-white/60">View and manage customer accounts</p>
        </div>
        <UsersIcon className="h-8 w-8 text-emerald-500" />
      </div>

      <Card className="bg-navy/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">All Users ({filteredUsers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Search users..."
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
                <TableHead className="text-white/60">Name</TableHead>
                <TableHead className="text-white/60">Email</TableHead>
                <TableHead className="text-white/60">Balance</TableHead>
                <TableHead className="text-white/60">Role</TableHead>
                <TableHead className="text-white/60">Orders</TableHead>
                <TableHead className="text-white/60">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} className="border-white/10">
                  <TableCell className="text-white font-medium">{user.name || "-"}</TableCell>
                  <TableCell className="text-white/80">{user.email}</TableCell>
                  <TableCell className="text-emerald-400">₦{user.balance.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === "ADMIN" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/60"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/80">{user._count?.orders || 0}</TableCell>
                  <TableCell className="text-white/60">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <p className="text-center py-8 text-white/40">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

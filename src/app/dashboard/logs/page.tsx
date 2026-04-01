"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SocialLog {
  id: string
  platform: string
  username: string
  email: string | null
  age: number | null
  followers: number | null
  price: number
  status: string
  category: { name: string }
}

interface Category {
  id: string
  name: string
}

export default function LogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<SocialLog[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.append("categoryId", selectedCategory)
    if (selectedPlatform) params.append("platform", selectedPlatform)

    fetch(`/api/logs?${params}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs)
        setCategories(data.categories)
        setLoading(false)
      })
  }, [selectedCategory, selectedPlatform])

  const toggleLog = (id: string) => {
    setSelectedLogs(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const totalPrice = logs
    .filter(l => selectedLogs.includes(l.id))
    .reduce((sum, l) => sum + l.price, 0)

  const handleOrder = async () => {
    if (selectedLogs.length === 0) return
    setOrdering(true)

    try {
      const res = await fetch("/api/logs/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logIds: selectedLogs,
          paymentMethodId: "paystack",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Order failed")
        setOrdering(false)
        return
      }

      router.push(`/dashboard/orders?order=${data.id}`)
    } catch (err) {
      alert("Something went wrong")
      setOrdering(false)
    }
  }

  if (loading) {
    return <div>Loading logs...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Media Logs</h1>
        <p className="text-muted-foreground">Browse and purchase pre-created social media accounts</p>
      </div>

      <div className="flex gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Platforms</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="Twitter">Twitter</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedLogs.length > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{selectedLogs.length} selected</p>
              <p className="text-muted-foreground">Total: ₦{totalPrice}</p>
            </div>
            <Button onClick={handleOrder} disabled={ordering}>
              {ordering ? "Processing..." : "Purchase Selected"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Logs ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => toggleLog(log.id)}
                    />
                  </TableCell>
                  <TableCell>{log.platform}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{log.age || "-"}</TableCell>
                  <TableCell>{log.followers || "-"}</TableCell>
                  <TableCell>₦{log.price}</TableCell>
                  <TableCell>
                    <Badge variant="success">{log.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {logs.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No logs available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
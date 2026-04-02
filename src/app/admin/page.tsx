"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SMSService {
  id: string
  name: string
}

interface SocialProduct {
  id: number
  name: string
  category?: string
  price?: number
  stock?: number
}

interface Stats {
  totalUsers: number
  totalOrders: number
  pendingPayments: number
  availableLogs: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [smsServices, setSmsServices] = useState<SMSService[]>([])
  const [socialProducts, setSocialProducts] = useState<SocialProduct[]>([])
  const [smsSupplier, setSmsSupplier] = useState("smspool")
  const [socialSupplier, setSocialSupplier] = useState("tutads")
  const [smsBalance, setSmsBalance] = useState<number | null>(null)
  const [socialBalance, setSocialBalance] = useState<number | null>(null)

  useEffect(() => {
    const adminId = typeof window !== 'undefined' ? localStorage.getItem("adminId") : null
    
    if (!adminId) {
      router.push("/admin-login")
      return
    }
    
    setIsAdmin(true)
    
    const fetchData = async () => {
      const adminId = localStorage.getItem("adminId")
      const headers: Record<string, string> = {}
      if (adminId) {
        headers["x-admin-id"] = adminId
      }

      try {
        const [statsRes, servicesRes] = await Promise.all([
          fetch("/api/admin/stats", { headers }),
          fetch("/api/admin/services", { headers }),
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json()
          setSmsServices(servicesData.sms?.services || [])
          setSocialProducts(servicesData.social?.products || [])
          setSmsSupplier(servicesData.sms?.supplier || "smspool")
          setSocialSupplier(servicesData.social?.supplier || "tutads")
          setSmsBalance(servicesData.sms?.balance)
          setSocialBalance(servicesData.social?.balance)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your SMS & Social Media platform</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/payments">
            <Button variant="outline">Payments</Button>
          </Link>
          <Link href="/admin/logs">
            <Button variant="outline">Upload Logs</Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableLogs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sms" className="w-full">
        <TabsList>
          <TabsTrigger value="sms">SMS Services ({smsServices.length})</TabsTrigger>
          <TabsTrigger value="social">Social Products ({socialProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>SMS Services</CardTitle>
                  <CardDescription>
                    From: {smsSupplier.toUpperCase()}
                    {smsBalance !== null && ` | Balance: $${smsBalance.toFixed(2)}`}
                  </CardDescription>
                </div>
                <Link href="/admin/settings">
                  <Button variant="outline" size="sm">Change Supplier</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Service Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {smsServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                          No services loaded. Check API configuration.
                        </TableCell>
                      </TableRow>
                    ) : (
                      smsServices.slice(0, 100).map((service, index) => (
                        <TableRow key={service.id || index}>
                          <TableCell className="font-mono text-xs">{service.id}</TableCell>
                          <TableCell>{service.name}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Social Media Products</CardTitle>
                  <CardDescription>
                    From: {socialSupplier.toUpperCase()}
                    {socialBalance !== null && ` | Balance: $${socialBalance.toFixed(2)}`}
                  </CardDescription>
                </div>
                <Link href="/admin/settings">
                  <Button variant="outline" size="sm">Change Supplier</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socialProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No products loaded. Check API configuration.
                        </TableCell>
                      </TableRow>
                    ) : (
                      socialProducts.slice(0, 100).map((product, index) => (
                        <TableRow key={product.id || index}>
                          <TableCell className="font-mono text-xs">{product.id}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category || "-"}</TableCell>
                          <TableCell className="text-right">
                            {product.price !== undefined ? `$${product.price}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.stock !== undefined ? product.stock : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
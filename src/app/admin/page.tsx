"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [smsServices, setSmsServices] = useState<SMSService[]>([])
  const [socialProducts, setSocialProducts] = useState<SocialProduct[]>([])
  const [smsSupplier, setSmsSupplier] = useState("smspool")
  const [socialSupplier, setSocialSupplier] = useState("tutads")
  const [smsBalance, setSmsBalance] = useState<number | null>(null)
  const [socialBalance, setSocialBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email !== "admin@smsreseller.com") return

    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch("/api/admin/stats")
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        // Fetch services/products
        const servicesRes = await fetch("/api/admin/services")
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
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  if (session?.user?.email !== "admin@smsreseller.com") {
    return (
      <div className="p-8">
        <div className="text-red-500">Access denied. Admin only.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableLogs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services & Products Tabs */}
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
                      <TableHead className="w-[100px]">ID</TableHead>
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
                      smsServices.slice(0, 50).map((service, index) => (
                        <TableRow key={service.id || index}>
                          <TableCell className="font-mono text-xs">{service.id}</TableCell>
                          <TableCell>{service.name}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {smsServices.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Showing first 50 of {smsServices.length} services
                </p>
              )}
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
                      <TableHead className="w-[80px]">ID</TableHead>
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
                      socialProducts.slice(0, 50).map((product, index) => (
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
              {socialProducts.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Showing first 50 of {socialProducts.length} products
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
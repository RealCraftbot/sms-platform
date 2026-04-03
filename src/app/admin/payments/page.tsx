"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface OrderPayment {
  id: string
  amount: string
  status: string
  createdAt: string
  paidAt: string | null
  user: {
    email: string
    name: string | null
  }
}

interface PendingPayment {
  id: string
  proofUrl: string
  notes: string | null
  uploadedAt: string
  status: string
  order: {
    id: string
    amount: string
    status: string
    user: {
      email: string
      name: string | null
    }
    paymentMethod: {
      name: string
    }
  }
}

export default function PaymentsPage() {
  const router = useRouter()
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([])
  const [approvedPayments, setApprovedPayments] = useState<OrderPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [customAmount, setCustomAmount] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchPayments = async (adminId: string) => {
    const headers = { "x-admin-id": adminId }

    const [pendingRes, approvedRes] = await Promise.all([
      fetch("/api/admin/payments/pending", { headers }),
      fetch("/api/admin/payments/approved", { headers }),
    ])

    if (pendingRes.ok && approvedRes.ok) {
      const pendingData = await pendingRes.json()
      const approvedData = await approvedRes.json()
      setPendingPayments(Array.isArray(pendingData) ? pendingData : [])
      setApprovedPayments(Array.isArray(approvedData) ? approvedData : [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!mounted) return

    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")

    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    fetchPayments(adminId)
  }, [mounted, router])

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setReviewing(id)
    const adminId = localStorage.getItem("adminId")
    const headers = {
      "Content-Type": "application/json",
      "x-admin-id": adminId || ""
    }

    const body: Record<string, unknown> = { action, reviewNotes }
    if (action === "approve" && customAmount[id]) {
      body.amount = customAmount[id]
    }

    try {
      const res = await fetch(`/api/admin/payments/${id}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to review payment")
        setReviewing(null)
        return
      }

      const data = await res.json()
      alert(data.message || `Payment ${action}d!`)
      setReviewNotes("")
      setCustomAmount(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      fetchPayments(adminId!)
    } catch {
      alert("Something went wrong")
    }

    setReviewing(null)
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">Review and manage payments</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingPayments.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Custom Amount</TableHead>
                    <TableHead>Screenshot</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.order.user.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{payment.order.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₦{payment.order.amount}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Custom"
                          className="w-28"
                          value={customAmount[payment.id] || ""}
                          onChange={(e) => setCustomAmount(prev => ({ ...prev, [payment.id]: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell>
                        <a
                          href={payment.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Proof
                        </a>
                      </TableCell>
                      <TableCell>{payment.notes || "-"}</TableCell>
                      <TableCell>{new Date(payment.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleReview(payment.id, "approve")}
                            disabled={reviewing === payment.id}
                          >
                            {reviewing === payment.id ? "..." : "Approve"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReview(payment.id, "reject")}
                            disabled={reviewing === payment.id}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pendingPayments.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No pending payments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{payment.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₦{payment.amount}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {approvedPayments.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No approved payments</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

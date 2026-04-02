"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface PendingPayment {
  id: string
  proofUrl: string
  notes: string | null
  uploadedAt: string
  order: {
    id: string
    amount: number
    type: string
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
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const headers: Record<string, string> = { "x-admin-id": adminId }
    
    fetch("/api/admin/payments/pending", { headers })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/admin-login")
            return []
          }
          throw new Error(`HTTP error: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setPayments(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setReviewing(id)
    const adminId = localStorage.getItem("adminId")
    const headers: Record<string, string> = { 
      "Content-Type": "application/json",
      "x-admin-id": adminId || ""
    }

    try {
      const res = await fetch(`/api/admin/payments/${id}/review`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, reviewNotes }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to review payment")
        setReviewing(null)
        return
      }

      const paymentsRes = await fetch("/api/admin/payments/pending", { headers: { "x-admin-id": adminId || "" } })
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      }

      alert(`Payment ${action}d!`)
      setReviewNotes("")
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
        <h1 className="text-3xl font-bold">Pending Payments</h1>
        <p className="text-muted-foreground">Review manual payment uploads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Queue ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.order.user.name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{payment.order.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">₦{payment.order.amount}</TableCell>
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
                        Approve
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
          {payments.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No pending payments</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
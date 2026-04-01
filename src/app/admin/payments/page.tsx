"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    fetch("/api/admin/payments/pending")
      .then(res => res.json())
      .then(data => {
        setPayments(data)
        setLoading(false)
      })
  }, [])

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setReviewing(id)

    try {
      const res = await fetch(`/api/admin/payments/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewNotes }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to review payment")
        setReviewing(null)
        return
      }

      // Refresh payments
      const paymentsRes = await fetch("/api/admin/payments/pending")
      const paymentsData = await paymentsRes.json()
      setPayments(paymentsData)

      alert(`Payment ${action}d!`)
      setReviewNotes("")
    } catch (err) {
      alert("Something went wrong")
    }

    setReviewing(null)
  }

  if (loading) {
    return <div>Loading...</div>
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
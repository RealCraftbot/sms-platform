"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function WalletPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [manualFile, setManualFile] = useState<File | null>(null)
  const [manualNotes, setManualNotes] = useState("")
  const [uploading, setUploading] = useState(false)

  const handlePaystackPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true)

    try {
      const res = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: "deposit",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Payment initialization failed")
        setLoading(false)
        return
      }

      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: data.email,
          amount: data.amount * 100,
          currency: "NGN",
          ref: data.reference,
          callback: async (response: any) => {
            await fetch("/api/payments/paystack/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
              }),
            })
            alert("Payment successful!")
            setLoading(false)
          },
          onClose: () => {
            setLoading(false)
          },
        })
        handler.openIframe()
      } else {
        // Fallback - just show the authorization URL
        window.open(data.authorizationUrl, "_blank")
        setLoading(false)
      }
    } catch (err) {
      alert("Something went wrong")
      setLoading(false)
    }
  }

  const handleManualUpload = async () => {
    if (!manualFile || !amount) return
    setUploading(true)

    // First create a deposit order
    try {
      const orderRes = await fetch("/api/sms/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "deposit",
          country: "ng",
          paymentMethodId: "manual",
          amount: parseFloat(amount),
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create deposit")
        setUploading(false)
        return
      }

      // Upload the screenshot
      const formData = new FormData()
      formData.append("orderId", orderData.id)
      formData.append("screenshot", manualFile)
      formData.append("notes", manualNotes)
      formData.append("amount", amount)

      const uploadRes = await fetch("/api/payments/manual/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        alert(uploadData.error || "Upload failed")
        setUploading(false)
        return
      }

      alert("Payment uploaded! Please wait for admin approval.")
      router.push("/dashboard/orders")
    } catch (err) {
      alert("Something went wrong")
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Add funds to your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>Your available funds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">₦0.00</div>
        </CardContent>
      </Card>

      <Tabs defaultValue="paystack" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paystack">Paystack (Card/Bank/USSD)</TabsTrigger>
          <TabsTrigger value="manual">Manual Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="paystack">
          <Card>
            <CardHeader>
              <CardTitle>Pay with Paystack</CardTitle>
              <CardDescription>Pay using card, bank transfer, or USSD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (NGN)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handlePaystackPayment} 
                disabled={!amount || parseFloat(amount) <= 0 || loading}
                className="w-full"
              >
                {loading ? "Processing..." : "Pay with Paystack"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                You will be redirected to Paystack to complete your payment
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Bank Transfer</CardTitle>
              <CardDescription>
                Transfer to our bank account and upload the receipt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">Bank Details:</p>
                <p>Bank: First Bank of Nigeria</p>
                <p>Account Name: SMSReseller Ltd</p>
                <p>Account Number: 1234567890</p>
              </div>
              <div className="space-y-2">
                <Label>Amount (NGN)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Transfer Screenshot</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setManualFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Any additional notes"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleManualUpload} 
                disabled={!manualFile || !amount || uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Submit Payment"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your payment will be reviewed by admin within 24 hours
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
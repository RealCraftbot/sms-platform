"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function WalletPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [manualFile, setManualFile] = useState<File | null>(null)
  const [manualNotes, setManualNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState("")

  const handleCloudinaryUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload/proof", {
        method: "POST",
        body: formData,
      })
      
      const data = await res.json()
      if (data.success) {
        setUploadedUrl(data.url)
        return true
      }
      return false
    } catch (err) {
      console.error("Upload error:", err)
      return false
    }
  }

  const handleManualUpload = async () => {
    if (!manualFile || !amount) return
    setUploading(true)

    try {
      const uploadSuccess = await handleCloudinaryUpload(manualFile)
      if (!uploadSuccess) {
        alert("Failed to upload proof. Please try again.")
        setUploading(false)
        return
      }

      const orderRes = await fetch("/api/payments/manual/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofUrl: uploadedUrl,
          notes: manualNotes,
          amount: parseFloat(amount),
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to submit payment")
        setUploading(false)
        return
      }

      alert("Payment submitted! Please wait for admin approval.")
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Paystack</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription>Card, Bank, USSD</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Crypto</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription>Bitcoin, USDT, ETH</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Manual Transfer</CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
            <CardDescription>Bank transfer with proof</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="#manual-transfer">Pay Now</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div id="manual-transfer">
        <Card>
          <CardHeader>
            <CardTitle>Manual Bank Transfer</CardTitle>
            <CardDescription>
              Transfer to our bank account and upload the receipt. Orders will be fulfilled after admin approval.
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
              <Label>Transfer Screenshot (Proof of Payment)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0] || null
                  setManualFile(file)
                  if (file) {
                    setUploading(true)
                    const success = await handleCloudinaryUpload(file)
                    if (!success) {
                      alert("Upload failed")
                    }
                    setUploading(false)
                  }
                }}
                disabled={uploading}
              />
              {uploadedUrl && (
                <p className="text-sm text-green-600">Proof uploaded successfully!</p>
              )}
              <p className="text-xs text-muted-foreground">
                Screenshot will be uploaded to Cloudinary for secure storage
              </p>
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
              disabled={!manualFile || !amount || uploading || !uploadedUrl}
              className="w-full"
            >
              {uploading ? "Processing..." : "Submit Payment for Approval"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Your payment will be reviewed by admin. Orders are fulfilled only after manual approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
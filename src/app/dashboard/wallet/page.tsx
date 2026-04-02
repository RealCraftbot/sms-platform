"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function WalletPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState<number>(0)
  const [loadingBalance, setLoadingBalance] = useState(true)
  const [manualFile, setManualFile] = useState<File | null>(null)
  const [manualNotes, setManualNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState("")

  useEffect(() => {
    fetch("/api/wallet/balance")
      .then(res => res.json())
      .then(data => {
        const balanceValue = data?.balance
        if (balanceValue !== undefined && balanceValue !== null) {
          const parsedBalance = typeof balanceValue === 'number' ? balanceValue : parseFloat(String(balanceValue))
          setBalance(isNaN(parsedBalance) ? 0 : parsedBalance)
        }
        setLoadingBalance(false)
      })
      .catch(() => setLoadingBalance(false))
  }, [])

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
    } catch {
      alert("Something went wrong")
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Wallet</h1>
        <p className="text-light-lavender">Add funds to your account</p>
      </div>

      <Card className="bg-navy/50 border-light-lavender/20">
        <CardHeader>
          <CardTitle className="text-white">Current Balance</CardTitle>
          <CardDescription className="text-light-lavender">Your available funds for orders</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBalance ? (
            <div className="text-2xl md:text-4xl font-bold text-white">Loading...</div>
          ) : (
            <div className="text-2xl md:text-4xl font-bold text-mint-green">₦{balance.toLocaleString()}</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-navy/50 border-light-lavender/20 opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Paystack</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription className="text-light-lavender">Card, Bank, USSD</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full bg-white/10 text-white">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-navy/50 border-light-lavender/20 opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Crypto</CardTitle>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <CardDescription className="text-light-lavender">Bitcoin, USDT, ETH</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full bg-white/10 text-white">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-navy/50 border-mint-green/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">Manual Transfer</CardTitle>
              <Badge className="bg-mint-green/20 text-mint-green">Active</Badge>
            </div>
            <CardDescription className="text-light-lavender">Bank transfer with proof</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-mint-green text-navy hover:bg-mint-green/80">
              <a href="#manual-transfer">Fund Wallet</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div id="manual-transfer">
        <Card className="bg-navy/50 border-light-lavender/20">
          <CardHeader>
            <CardTitle className="text-white">Manual Bank Transfer</CardTitle>
            <CardDescription className="text-light-lavender">
              Transfer to our bank account and upload the receipt. Funds will be added to your wallet after admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-light-lavender/20">
              <p className="font-semibold mb-2 text-white">Bank Details:</p>
              <p className="text-light-lavender">Bank: First Bank of Nigeria</p>
              <p className="text-light-lavender">Account Name: SMSReseller Ltd</p>
              <p className="text-light-lavender">Account Number: 1234567890</p>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Amount (NGN)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/10 border-light-lavender/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Transfer Screenshot (Proof of Payment)</Label>
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
                className="bg-white/10 border-light-lavender/30 text-white"
              />
              {uploadedUrl && (
                <p className="text-sm text-mint-green">Proof uploaded successfully!</p>
              )}
              <p className="text-xs text-light-lavender">
                Screenshot will be uploaded to Cloudinary for secure storage
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Notes (Optional)</Label>
              <Input
                placeholder="Any additional notes"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="bg-white/10 border-light-lavender/30 text-white"
              />
            </div>
            <Button 
              onClick={handleManualUpload} 
              disabled={!manualFile || !amount || uploading || !uploadedUrl}
              className="w-full bg-mint-green text-navy hover:bg-mint-green/80"
            >
              {uploading ? "Processing..." : "Submit Payment for Approval"}
            </Button>
            <p className="text-xs text-light-lavender text-center">
              Your payment will be reviewed by admin. Funds are added to wallet after approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Loader2 } from "lucide-react"

export default function AdminSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAdmin, setHasAdmin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/setup")
        const data = await res.json()
        setHasAdmin(data.hasAdmin)
        if (data.hasAdmin) {
          router.push("/admin-login")
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, secretKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create admin")
        setSubmitting(false)
        return
      }

      router.push("/admin-login")
    } catch (err) {
      setError("Something went wrong")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    )
  }

  if (hasAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-navy/80 border-light-lavender/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary-blue" />
            <CardTitle className="text-white text-xl">Admin Setup</CardTitle>
          </div>
          <CardDescription className="text-light-lavender">
            Create the first admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-light-lavender/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-light-lavender/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-light-lavender/30 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey" className="text-white">Setup Key *</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="Enter setup key"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                required
                className="bg-white/10 border-light-lavender/30 text-white"
              />
              <p className="text-xs text-light-lavender/50">
                Use: setup-admin-2024
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary-blue text-white hover:bg-primary-blue/90"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </span>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
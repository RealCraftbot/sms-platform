"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid credentials")
        setLoading(false)
        return
      }

      // Store admin session
      localStorage.setItem("adminId", data.id)
      localStorage.setItem("adminEmail", data.email)
      localStorage.setItem("adminRole", data.role || "admin")
      
      router.push("/admin")
    } catch {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary-blue" />
            <h1 className="text-3xl font-bold text-white">SMSReseller</h1>
          </div>
          <p className="text-light-lavender mt-2">Admin Portal</p>
        </div>
        
        <Card className="bg-navy/80 border-light-lavender/20 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl">Admin Login</CardTitle>
            <CardDescription className="text-light-lavender">
              Sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 focus:border-mint-green focus:ring-mint-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 pr-10 focus:border-mint-green focus:ring-mint-green"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-lavender hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary-blue text-white font-semibold hover:bg-primary-blue/90 transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In to Admin"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center border-t border-light-lavender/20 pt-4">
              <Link href="/login" className="text-mint-green text-sm hover:underline">
                Back to User Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-light-lavender/50 text-xs mt-6">
          Restricted access. Only authorized administrators allowed.
        </p>
      </div>
    </div>
  )
}
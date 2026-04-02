"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, EyeOff, Loader2, Check, X } from "lucide-react"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
]

export default function AdminRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const passwordStrength = passwordRequirements.filter(req => req.test(password)).length
  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (email !== "admin@smsreseller.com") {
      setError("Admin email must be admin@smsreseller.com")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      router.push("/admin-login?registered=true")
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
            <CardTitle className="text-white text-xl">Admin Registration</CardTitle>
            <CardDescription className="text-light-lavender">
              Create an admin account
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
                <Label htmlFor="name" className="text-white text-sm font-medium">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 focus:border-mint-green focus:ring-mint-green"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm font-medium">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@smsreseller.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 focus:border-mint-green focus:ring-mint-green"
                />
                <p className="text-xs text-light-lavender">Only admin@smsreseller.com is allowed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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
                
                {password.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map((level) => (
                        <div 
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength >= level 
                              ? passwordStrength <= 2 ? 'bg-red-500' : passwordStrength === 3 ? 'bg-yellow-500' : 'bg-mint-green'
                              : 'bg-light-lavender/30'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {passwordRequirements.map((req, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-1 ${req.test(password) ? 'text-mint-green' : 'text-light-lavender/50'}`}
                        >
                          {req.test(password) ? <Check size={12} /> : <X size={12} />}
                          {req.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 pr-10 focus:border-mint-green focus:ring-mint-green"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-lavender hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`text-xs ${passwordsMatch ? 'text-mint-green' : 'text-red-400'}`}>
                    {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary-blue text-white font-semibold hover:bg-primary-blue/90 transition-all" 
                disabled={loading || !passwordsMatch || passwordStrength < 3}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Creating admin account...
                  </span>
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center border-t border-light-lavender/20 pt-4">
              <Link href="/admin-login" className="text-mint-green text-sm hover:underline">
                Already have an admin account? Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-light-lavender/50 text-xs mt-6">
          Restricted registration. Only for creating admin accounts.
        </p>
      </div>
    </div>
  )
}
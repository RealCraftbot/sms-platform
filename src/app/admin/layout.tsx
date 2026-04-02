"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, DollarSign, FileText, CreditCard, Settings, Phone, LayoutDashboard, Server, Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const adminId = localStorage.getItem("adminId")
    const adminEmailStored = localStorage.getItem("adminEmail")
    
    if (!adminId || !adminEmailStored) {
      router.push("/admin-login")
      return
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- This pattern is intentional for auth checks
    setAdminEmail(adminEmailStored)
     
    setIsAdmin(true)
     
    setLoading(false)
  }, [mounted, router])

  useEffect(() => {
    if (!mounted || !isAdmin) return

    const verifyAdmin = async () => {
      const adminId = localStorage.getItem("adminId")
      try {
        const res = await fetch("/api/admin/login", {
          headers: { "x-admin-id": adminId || "" }
        })
        if (!res.ok) {
          localStorage.removeItem("adminId")
          localStorage.removeItem("adminEmail")
          localStorage.removeItem("adminRole")
          router.push("/admin-login")
        }
      } catch {
        // Network error, continue anyway
      }
    }
    
    verifyAdmin()
  }, [mounted, isAdmin, router])

  const handleLogout = () => {
    localStorage.removeItem("adminId")
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("adminRole")
    router.push("/admin-login")
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/services", label: "Services & Products", icon: Server },
    { href: "/admin/pricing", label: "Pricing", icon: DollarSign },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/logs", label: "Upload Logs", icon: FileText },
    { href: "/admin/settings", label: "SMS Suppliers", icon: Phone },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-navy/80 p-4 shrink-0">
        <div className="mb-6 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary-blue" />
            <span className="text-lg font-bold text-white">SMSReseller</span>
          </div>
          <p className="text-light-lavender text-xs">Admin Panel</p>
          <p className="text-light-lavender/50 text-xs mt-1">{adminEmail}</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-white hover:bg-white/10 ${
                  pathname === item.href ? "bg-white/10" : ""
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="mt-6 pt-4 border-t border-light-lavender/20">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <Settings className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-navy">{children}</main>
    </div>
  )
}
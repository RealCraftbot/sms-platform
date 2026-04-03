"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Phone, 
  MessageSquare, 
  KeyRound,
  Share2,
  FileText,
  Receipt,
  HeadphonesIcon,
  CreditCard,
  Settings,
  Globe,
  LogOut,
  Loader2,
  ChevronDown,
  ChevronRight,
  Code
} from "lucide-react"

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navSections: NavSection[] = [
  {
    title: "CORE",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Manage Users", icon: Users },
      { href: "/admin/deposits", label: "Manage Deposits", icon: Wallet },
    ],
  },
  {
    title: "SMS SERVICES",
    items: [
      { href: "/admin/pricing-sms", label: "Manage Pricing (SMS)", icon: CreditCard },
      { href: "/admin/virtual-numbers", label: "Manage Virtual Numbers", icon: Phone },
      { href: "/admin/otp", label: "Manage OTP", icon: KeyRound },
    ],
  },
  {
    title: "SOCIAL MEDIA",
    items: [
      { href: "/admin/boosting", label: "Manage Boosting (SMM)", icon: Share2 },
      { href: "/admin/social-logs", label: "Manage Social Logs (Accounts)", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin/transactions", label: "View Transactions", icon: Receipt },
      { href: "/admin/support", label: "Manage Support", icon: HeadphonesIcon },
    ],
  },
  {
    title: "CONFIG",
    items: [
      { href: "/admin/gateway", label: "Gateway Settings", icon: Globe },
      { href: "/admin/api-settings", label: "API Settings", icon: Code },
      { href: "/admin/settings", label: "General Settings", icon: Settings },
    ],
  },
]

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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(navSections.map(s => [s.title, true]))
  )

  useEffect(() => {
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

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-navy">
      <aside className="w-64 border-r border-white/10 bg-navy/95 p-4 shrink-0 flex flex-col">
        <div className="mb-6">
          <p className="text-white/60 text-xs font-semibold tracking-wider">Admin Panel</p>
          <p className="text-white text-sm mt-1 truncate">{adminEmail}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto space-y-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full text-xs font-bold text-emerald-500 tracking-wider mb-2 hover:text-emerald-400 transition-colors"
              >
                <span>{section.title}</span>
                {expandedSections[section.title] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
              
              {expandedSections[section.title] && (
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-sm py-1.5 ${
                          isActive(item.href)
                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="mr-2.5 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-navy overflow-y-auto">{children}</main>
    </div>
  )
}

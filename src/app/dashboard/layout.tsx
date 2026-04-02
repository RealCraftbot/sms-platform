"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Shield, LayoutDashboard, MessageSquare, FileText, Wallet, CreditCard, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const userNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/sms/order", label: "Order SMS", icon: MessageSquare },
  { href: "/dashboard/logs", label: "Social Logs", icon: FileText },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/orders", label: "Orders", icon: FileText },
]

const adminNavItems = [
  { href: "/admin/pricing", label: "Pricing", icon: Settings },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/logs", label: "Upload Logs", icon: FileText },
  { href: "/admin/settings", label: "SMS Suppliers", icon: Shield },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  const isAdmin = session.user?.email === "admin@smsreseller.com"

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-navy/80 border-r border-light-lavender/20 shrink-0 fixed h-full">
        <div className="p-4 border-b border-light-lavender/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary-blue" />
            <span className="text-white font-bold">SMSReseller</span>
          </div>
          <p className="text-white text-sm truncate">{session.user?.name || 'User'}</p>
          <p className="text-light-lavender/50 text-xs truncate">{session.user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-light-lavender/50 text-xs px-3 mb-2">Menu</p>
          {userNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm ${
                  pathname === item.href 
                    ? 'bg-mint-green/10 text-mint-green' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}

          {isAdmin && (
            <>
              <p className="text-mint-green text-xs px-3 mb-2 mt-4">Admin</p>
              {adminNavItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm ${
                      pathname === item.href 
                        ? 'bg-mint-green/10 text-mint-green' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-light-lavender/20">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:bg-red-400/10 text-sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-navy/95 backdrop-blur border-b border-light-lavender/20 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-blue" />
            <span className="text-white font-bold">SMSReseller</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-navy border-l border-light-lavender/20 shadow-xl">
            <div className="p-4 border-b border-light-lavender/20 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{session.user?.name || 'User'}</p>
                <p className="text-light-lavender/50 text-xs truncate">{session.user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            <nav className="p-4 space-y-1">
              <p className="text-light-lavender/50 text-xs px-3 mb-2">Menu</p>
              {userNavItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm ${
                      pathname === item.href 
                        ? 'bg-mint-green/10 text-mint-green' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}

              {isAdmin && (
                <>
                  <p className="text-mint-green text-xs px-3 mb-2 mt-4">Admin</p>
                  {adminNavItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-sm ${
                          pathname === item.href 
                            ? 'bg-mint-green/10 text-mint-green' 
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-light-lavender/20">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:bg-red-400/10 text-sm"
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut({ callbackUrl: "/" })
                }}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {children}
      </main>
    </div>
  )
}
"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Shield, LayoutDashboard, MessageSquare, FileText, Wallet, CreditCard, Settings, LogOut, ChevronRight } from "lucide-react"
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
      <aside className="hidden md:block w-64 bg-navy/80 border-r border-light-lavender/20 p-4 shrink-0">
        <div className="mb-6 p-4">
          <p className="text-white font-medium">{session.user?.name || 'User'}</p>
          <p className="text-light-lavender/50 text-xs truncate">{session.user?.email}</p>
        </div>

        <nav className="space-y-1">
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

        <div className="mt-auto pt-4 border-t border-light-lavender/20">
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
      <div className="md:hidden bg-navy/80 border-b border-light-lavender/20 p-4 sticky top-[60px] z-40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium text-sm">{session.user?.name || 'User'}</p>
            <p className="text-light-lavender text-xs">{session.user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={18} />
          </Button>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {userNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "outline"}
                size="sm"
                className={`text-xs whitespace-nowrap ${
                  pathname === item.href 
                    ? 'bg-mint-green text-navy' 
                    : 'text-white border-light-lavender/30'
                }`}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
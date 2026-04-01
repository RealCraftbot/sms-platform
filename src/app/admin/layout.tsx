"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, DollarSign, FileText, CreditCard, Settings, Phone, LayoutDashboard } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    router.push("/login")
    return null
  }

  const isAdmin = session.user?.email === "admin@smsreseller.com"

  if (!isAdmin) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-navy/80 p-4 shrink-0">
        <div className="mb-6 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary-blue" />
            <span className="text-lg font-bold text-white">SMSReseller</span>
          </div>
          <p className="text-light-lavender text-xs">Admin Panel</p>
        </div>
        <nav className="space-y-1">
          <Link href="/admin/pricing">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
              <DollarSign className="mr-3 h-4 w-4" />
              Pricing
            </Button>
          </Link>
          <Link href="/admin/payments">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
              <CreditCard className="mr-3 h-4 w-4" />
              Payments
            </Button>
          </Link>
          <Link href="/admin/logs">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
              <FileText className="mr-3 h-4 w-4" />
              Upload Logs
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
              <Phone className="mr-3 h-4 w-4" />
              SMS Suppliers
            </Button>
          </Link>
        </nav>
        <div className="mt-6 pt-4 border-t border-light-lavender/20">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
              <LayoutDashboard className="mr-3 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-navy">{children}</main>
    </div>
  )
}
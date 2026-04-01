"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, CreditCard, Settings } from "lucide-react"

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

  // Simple admin check - in production, use proper role-based auth
  const isAdmin = (session.user as any)?.email === "admin@smsreseller.com"

  if (!isAdmin) {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-card p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage platform</p>
        </div>
        <nav className="space-y-2">
          <Link href="/admin/pricing">
            <Button variant="ghost" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Pricing
            </Button>
          </Link>
          <Link href="/admin/payments">
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Payments
            </Button>
          </Link>
          <Link href="/admin/logs">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Upload Logs
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
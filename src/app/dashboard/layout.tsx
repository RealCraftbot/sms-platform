"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, MessageSquare, FileText, LogOut } from "lucide-react"

export default function DashboardLayout({
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

  const isAdmin = (session.user as any)?.email === "admin@smsreseller.com"

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-card p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">{session.user?.email}</p>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Overview
            </Button>
          </Link>
          <Link href="/dashboard/sms/order">
            <Button variant="ghost" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Order SMS
            </Button>
          </Link>
          <Link href="/dashboard/logs">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Social Logs
            </Button>
          </Link>
          <Link href="/dashboard/wallet">
            <Button variant="ghost" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Orders
            </Button>
          </Link>
          {isAdmin && (
            <div className="pt-4 mt-4 border-t">
              <p className="text-sm font-semibold mb-2 px-2">Admin</p>
              <Link href="/admin/pricing">
                <Button variant="ghost" className="w-full justify-start">
                  Pricing
                </Button>
              </Link>
              <Link href="/admin/payments">
                <Button variant="ghost" className="w-full justify-start">
                  Payments
                </Button>
              </Link>
              <Link href="/admin/logs">
                <Button variant="ghost" className="w-full justify-start">
                  Upload Logs
                </Button>
              </Link>
            </div>
          )}
        </nav>
        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/api/auth/signout")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, MessageSquare, FileText } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here's an overview of your account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Orders</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Purchased logs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="/dashboard/sms/order" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="font-medium">Order SMS</p>
          </a>
          <a href="/dashboard/logs" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <FileText className="h-8 w-8 mb-2" />
            <p className="font-medium">Browse Logs</p>
          </a>
          <a href="/dashboard/wallet" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <Wallet className="h-8 w-8 mb-2" />
            <p className="font-medium">Add Funds</p>
          </a>
          <a href="/dashboard/orders" className="p-4 border rounded-lg hover:bg-muted transition-colors">
            <FileText className="h-8 w-8 mb-2" />
            <p className="font-medium">View Orders</p>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Wallet, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Loader2
} from "lucide-react"

interface StatCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative'
  icon: React.ReactNode
  href?: string
}

interface RecentOrder {
  id: string
  type: string
  serviceName?: string | null
  country?: string | null
  amount: string
  status: string
  createdAt: string
}

interface DashboardData {
  balance: string
  totalOrders: number
  smsOrders: number
  logOrders: number
  pendingOrders: number
  completedOrders: number
  recentOrders: RecentOrder[]
  services: { name: string; count: number }[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  awaiting_approval: "bg-orange-500/20 text-orange-400",
  approved: "bg-green-500/20 text-green-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  failed: "bg-red-500/20 text-red-400",
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mint-green" />
      </div>
    )
  }

  const stats: StatCard[] = [
    { title: "Balance", value: `₦${data?.balance || "0"}`, icon: <Wallet className="h-5 w-5" />, href: "/dashboard/wallet" },
    { title: "Total Orders", value: data?.totalOrders || 0, icon: <FileText className="h-5 w-5" />, href: "/dashboard/orders" },
    { title: "SMS Orders", value: data?.smsOrders || 0, icon: <MessageSquare className="h-5 w-5" />, href: "/dashboard/orders" },
    { title: "Social Logs", value: data?.logOrders || 0, icon: <Users className="h-5 w-5" />, href: "/dashboard/logs" },
  ]

  const quickActions = [
    { title: "Order SMS", description: "Get verification numbers", icon: <MessageSquare className="h-6 w-6" />, href: "/dashboard/sms/order", color: "bg-primary-blue" },
    { title: "Buy Social Logs", description: "Purchase accounts", icon: <Users className="h-6 w-6" />, href: "/dashboard/logs", color: "bg-mint-green" },
    { title: "Add Funds", description: "Top up wallet", icon: <CreditCard className="h-6 w-6" />, href: "/dashboard/wallet", color: "bg-lime-yellow" },
    { title: "View Orders", description: "Order history", icon: <FileText className="h-6 w-6" />, href: "/dashboard/orders", color: "bg-light-lavender" },
  ]

  return (
    <div className="min-h-screen bg-navy p-4 md:p-6">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Welcome back, {session?.user?.name || 'User'}! 👋
        </h1>
        <p className="text-light-lavender text-sm md:text-base mt-1">
          Here is what is happening with your account today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href || '#'}>
            <Card className="bg-navy/50 border-light-lavender/20 hover:border-mint-green/50 transition-all cursor-pointer">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-light-lavender text-xs md:text-sm">{stat.title}</span>
                  <div className="text-primary-blue">{stat.icon}</div>
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                {stat.change && (
                  <div className={`text-xs mt-1 flex items-center gap-1 ${stat.changeType === 'positive' ? 'text-mint-green' : 'text-red-400'}`}>
                    {stat.changeType === 'positive' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.change}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="bg-navy/50 border-light-lavender/20 hover:border-mint-green/50 transition-all cursor-pointer hover:scale-[1.02]">
                <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
                  <div className={`${action.color} p-3 rounded-full mb-3`}>
                    <div className="text-navy">{action.icon}</div>
                  </div>
                  <h3 className="text-white font-semibold text-sm md:text-base">{action.title}</h3>
                  <p className="text-light-lavender text-xs mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="bg-navy/50 border-light-lavender/20">
            <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
              <div>
                <CardTitle className="text-white text-lg">Recent Orders</CardTitle>
                <CardDescription className="text-light-lavender text-xs">Your latest transactions</CardDescription>
              </div>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="text-mint-green text-xs">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {data.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${order.type === 'sms' ? 'bg-primary-blue/20' : 'bg-mint-green/20'}`}>
                          {order.type === 'sms' ? (
                            <MessageSquare className="h-4 w-4 text-primary-blue" />
                          ) : (
                            <Users className="h-4 w-4 text-mint-green" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium capitalize">{order.type}</p>
                          <p className="text-light-lavender text-xs">
                            {order.type === 'sms' && order.serviceName 
                              ? `${order.serviceName}${order.country ? ` - ${order.country}` : ''}`
                              : new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-medium">₦{order.amount}</p>
                        <Badge className={statusColors[order.status] || "bg-gray-500/20 text-gray-400"}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-light-lavender/30 mx-auto mb-3" />
                  <p className="text-light-lavender text-sm">No orders yet</p>
                  <Link href="/dashboard/sms/order">
                    <Button className="mt-4 bg-mint-green text-navy hover:bg-mint-green/80 text-sm">
                      Place Your First Order
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services Overview */}
        <div>
          <Card className="bg-navy/50 border-light-lavender/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-white text-lg">Popular Services</CardTitle>
              <CardDescription className="text-light-lavender text-xs">Most ordered services</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {data?.services && data.services.length > 0 ? (
                <div className="space-y-3">
                  {data.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{service.name}</p>
                        <p className="text-light-lavender text-xs">{service.count} countries</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-light-lavender text-sm">No services configured yet</p>
                </div>
              )}
              
              <Link href="/dashboard/sms/order" className="block mt-4">
                <Button className="w-full bg-primary-blue text-white hover:bg-primary-blue/80 text-sm">
                  View All Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Status */}
      <div className="mt-6 md:mt-8 grid md:grid-cols-2 gap-4">
        <Card className="bg-navy/50 border-light-lavender/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-mint-green/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-mint-green" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Account Status</h3>
                <p className="text-mint-green text-sm">Active</p>
              </div>
            </div>
            <p className="text-light-lavender text-xs">
              Your account is fully verified and ready for use.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-navy/50 border-light-lavender/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary-blue/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary-blue" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Member Since</h3>
                <p className="text-light-lavender text-sm">{session?.user?.email ? "April 2026" : "Not logged in"}</p>
              </div>
            </div>
            <p className="text-light-lavender text-xs">
              Thank you for being part of SMSReseller!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, HeadphonesIcon, Search, MessageSquare, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Ticket {
  id: string
  userEmail: string
  subject: string
  message: string
  status: string
  adminReply?: string
  createdAt: string
  repliedAt?: string
}

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "ANSWERED" | "CLOSED">("ALL")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [reply, setReply] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const adminId = localStorage.getItem("adminId")
    const adminEmail = localStorage.getItem("adminEmail")

    if (!adminId || !adminEmail) {
      router.push("/admin-login")
      return
    }

    fetch("/api/admin/support", { headers: { "x-admin-id": adminId } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then(data => {
        setTickets(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mounted, router])

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim()) return

    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/support/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminId
        },
        body: JSON.stringify({ message: reply })
      })

      if (res.ok) {
        setTickets(prev => prev.map(t => 
          t.id === selectedTicket.id ? { ...t, status: "ANSWERED", adminReply: reply, repliedAt: new Date().toISOString() } : t
        ))
        setSelectedTicket(null)
        setReply("")
      }
    } catch {
      console.error("Failed to reply")
    }
    setSubmitting(false)
  }

  const handleClose = async (id: string) => {
    const adminId = localStorage.getItem("adminId")
    if (!adminId) return

    try {
      const res = await fetch(`/api/admin/support/${id}/close`, {
        method: "POST",
        headers: { "x-admin-id": adminId }
      })
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "CLOSED" } : t))
      }
    } catch {
      console.error("Failed to close ticket")
    }
  }

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      t.message?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "ALL" || t.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, string> = {
    OPEN: "bg-yellow-500/20 text-yellow-400",
    ANSWERED: "bg-emerald-500/20 text-emerald-400",
    CLOSED: "bg-white/10 text-white/60"
  }

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Support</h1>
          <p className="text-white/60">View and respond to support tickets</p>
        </div>
        <HeadphonesIcon className="h-8 w-8 text-emerald-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-navy/50 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-white">Tickets ({filteredTickets.length})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-navy border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex gap-2">
                  {(["ALL", "OPEN", "ANSWERED", "CLOSED"] as const).map(f => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className={filter === f ? "bg-emerald-500 hover:bg-emerald-600" : "border-white/20 text-white/80"}
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id 
                      ? "bg-emerald-500/20 border-emerald-500/40" 
                      : "bg-navy/30 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{ticket.subject}</p>
                      <p className="text-white/60 text-sm truncate">{ticket.userEmail}</p>
                      <p className="text-white/40 text-xs mt-1 line-clamp-1">{ticket.message}</p>
                    </div>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <p className="text-center py-8 text-white/40">No tickets found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              {selectedTicket ? "Ticket Details" : "Select a ticket"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">From:</span>
                    <span className="text-white">{selectedTicket.userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Status:</span>
                    <Badge className={statusColors[selectedTicket.status]}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Date:</span>
                    <span className="text-white/60 text-sm">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-white/60 text-sm">Subject:</span>
                  <p className="text-white font-medium">{selectedTicket.subject}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-white/60 text-sm">Message:</span>
                  <p className="text-white/80 bg-navy/30 p-3 rounded-lg">{selectedTicket.message}</p>
                </div>

                {selectedTicket.adminReply && (
                  <div className="space-y-2">
                    <span className="text-white/60 text-sm">Your Reply:</span>
                    <p className="text-emerald-400/80 bg-emerald-500/10 p-3 rounded-lg">{selectedTicket.adminReply}</p>
                  </div>
                )}

                {selectedTicket.status !== "CLOSED" && (
                  <div className="space-y-2">
                    <span className="text-white/60 text-sm">Reply:</span>
                    <Textarea
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReply(e.target.value)}
                      className="bg-navy border-white/10 text-white min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReply}
                        disabled={submitting || !reply.trim()}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      >
                        {submitting ? "Sending..." : "Send Reply"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleClose(selectedTicket.id)}
                        className="border-white/20 text-white/80 hover:bg-white/10"
                      >
                        Close Ticket
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-white/40">
                Select a ticket to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

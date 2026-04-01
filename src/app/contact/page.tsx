"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      alert("Message sent! We'll get back to you soon.")
      setSubmitting(false)
      setFormData({ name: "", email: "", subject: "", message: "" })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-navy py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Contact Us</h1>
          <p className="text-light-lavender text-base md:text-xl max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Get in Touch</h2>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-primary-blue/20 p-2 md:p-3 rounded-lg shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Email</h3>
                  <p className="text-light-lavender text-xs md:text-sm">support@smsreseller.com</p>
                  <p className="text-light-lavender text-xs md:text-sm">sales@smsreseller.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-primary-blue/20 p-2 md:p-3 rounded-lg shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Phone</h3>
                  <p className="text-light-lavender text-xs md:text-sm">+234 800 SMS RESELLER</p>
                  <p className="text-light-lavender text-xs md:text-sm">+234 900 123 4567</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-primary-blue/20 p-2 md:p-3 rounded-lg shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Address</h3>
                  <p className="text-light-lavender text-xs md:text-sm">Lagos, Nigeria</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <div className="bg-primary-blue/20 p-2 md:p-3 rounded-lg shrink-0">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary-blue" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm md:text-base">Business Hours</h3>
                  <p className="text-light-lavender text-xs md:text-sm">Monday - Friday: 9AM - 6PM</p>
                  <p className="text-light-lavender text-xs md:text-sm">Saturday: 10AM - 2PM</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-lg">Send us a Message</CardTitle>
                <p className="text-light-lavender text-xs md:text-sm">
                  Fill out the form below and we'll get back to you
                </p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white text-sm">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-10 md:h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-10 md:h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white text-sm">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="h-10 md:h-12 bg-white/10 border-light-lavender/30 text-white placeholder:text-light-lavender/50 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white text-sm">Message</Label>
                    <textarea
                      id="message"
                      placeholder="Your message..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="w-full rounded-md border border-light-lavender/30 bg-white/10 px-3 py-2 text-white placeholder:text-light-lavender/50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-mint-green text-navy hover:bg-mint-green/80 h-10 md:h-12 text-sm font-medium"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
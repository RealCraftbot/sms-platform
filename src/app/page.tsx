import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MessageSquare, CreditCard, Wallet } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SMSReseller</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              SMS Verification & Social Media Logs
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get temporary phone numbers for OTP verification and purchase pre-created 
              social media accounts. Fast, reliable, and affordable.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <MessageSquare className="h-10 w-10 mb-2" />
                  <CardTitle>SMS Verification</CardTitle>
                  <CardDescription>
                    Get temporary phone numbers for WhatsApp, Instagram, Google, and more
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 mb-2" />
                  <CardTitle>Social Logs</CardTitle>
                  <CardDescription>
                    Purchase pre-created aged social media accounts
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CreditCard className="h-10 w-10 mb-2" />
                  <CardTitle>Paystack Payments</CardTitle>
                  <CardDescription>
                    Pay with card, bank transfer, or USSD
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Wallet className="h-10 w-10 mb-2" />
                  <CardTitle>Manual Upload</CardTitle>
                  <CardDescription>
                    Upload bank transfer screenshots for approval
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <div className="text-3xl font-bold">₦500</div>
                  <CardDescription>per SMS verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ Nigeria numbers</li>
                    <li>✓ Instant delivery</li>
                    <li>✓ 15 min validity</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <div className="text-3xl font-bold">₦1,200</div>
                  <CardDescription>per SMS verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ US, UK numbers</li>
                    <li>✓ Priority delivery</li>
                    <li>✓ 20 min validity</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardTitle className="mb-4">Social Logs</CardTitle>
                <div className="text-3xl font-bold">From ₦2,000</div>
                <CardDescription>per account</CardDescription>
                <CardContent>
                  <ul className="space-y-2 text-sm mt-4">
                    <li>✓ Instagram, Facebook</li>
                    <li>✓ Aged accounts</li>
                    <li>✓ With followers</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 SMSReseller. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
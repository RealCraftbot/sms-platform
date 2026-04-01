import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MessageSquare, CreditCard, Wallet, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="py-24 bg-gradient-to-b from-navy via-navy to-primary-blue/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            SMS Verification & Social Media Logs
          </h1>
          <p className="text-xl text-light-lavender mb-8 max-w-2xl mx-auto">
            Get temporary phone numbers for OTP verification and purchase pre-created 
            social media accounts. Fast, reliable, and affordable.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-mint-green text-navy hover:bg-mint-green/80">
                Get Started
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">SMS Verification</CardTitle>
                <CardDescription className="text-light-lavender">
                  Get temporary phone numbers for WhatsApp, Instagram, Google, and more
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">Social Logs</CardTitle>
                <CardDescription className="text-light-lavender">
                  Purchase pre-created aged social media accounts
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">Paystack Payments</CardTitle>
                <CardDescription className="text-light-lavender">
                  Pay with card, bank transfer, or USSD
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">Manual Upload</CardTitle>
                <CardDescription className="text-light-lavender">
                  Upload bank transfer screenshots for approval
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-blue/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader>
                <CardTitle className="text-white">Starter</CardTitle>
                <div className="text-3xl font-bold text-mint-green">₦500</div>
                <CardDescription className="text-light-lavender">per SMS verification</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-light-lavender">
                  <li>✓ Nigeria numbers</li>
                  <li>✓ Instant delivery</li>
                  <li>✓ 15 min validity</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-navy border-2 border-mint-green">
              <CardHeader>
                <CardTitle className="text-white">Professional</CardTitle>
                <div className="text-3xl font-bold text-mint-green">₦1,200</div>
                <CardDescription className="text-light-lavender">per SMS verification</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-light-lavender">
                  <li>✓ US, UK numbers</li>
                  <li>✓ Priority delivery</li>
                  <li>✓ 20 min validity</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader>
                <CardTitle className="text-white">Social Logs</CardTitle>
                <div className="text-3xl font-bold text-mint-green">From ₦2,000</div>
                <CardDescription className="text-light-lavender">per account</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-light-lavender mt-4">
                  <li>✓ Instagram, Facebook</li>
                  <li>✓ Aged accounts</li>
                  <li>✓ With followers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-light-lavender mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust SMSReseller for their verification needs
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-mint-green text-navy hover:bg-mint-green/80">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
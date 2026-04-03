import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MessageSquare, TrendingUp, Heart, Users, CreditCard, Wallet, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-navy">
      <section className="py-24 bg-gradient-to-b from-navy via-navy to-primary-blue/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            SMS Numbers, Social Logs & Boosting
          </h1>
          <p className="text-xl text-light-lavender mb-8 max-w-2xl mx-auto">
            Get virtual phone numbers for verification, purchase aged social media accounts,
            or boost your followers and engagement. All in one platform.
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
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">SMS Numbers</CardTitle>
                <CardDescription className="text-light-lavender">
                  Get temporary virtual phone numbers for WhatsApp, Instagram, Telegram, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-light-lavender mt-4">
                  <li>✓ Nigeria, US, UK numbers</li>
                  <li>✓ Instant OTP delivery</li>
                  <li>✓ Multiple platforms</li>
                  <li>✓ From ₦250</li>
                </ul>
                <Link href="/dashboard/sms/order">
                  <Button className="w-full mt-4 bg-mint-green text-navy hover:bg-mint-green/80">
                    Get SMS Number
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">Social Logs</CardTitle>
                <CardDescription className="text-light-lavender">
                  Purchase pre-created aged social media accounts with followers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-light-lavender mt-4">
                  <li>✓ Instagram, Facebook, Twitter</li>
                  <li>✓ Aged accounts with history</li>
                  <li>✓ Pre-followed accounts</li>
                  <li>✓ From ₦3,000</li>
                </ul>
                <Link href="/dashboard/logs">
                  <Button className="w-full mt-4 bg-mint-green text-navy hover:bg-mint-green/80">
                    Buy Social Log
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-navy border-light-lavender/20 hover:border-mint-green/50 transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white">Social Boost</CardTitle>
                <CardDescription className="text-light-lavender">
                  Boost your social media with followers, likes, views, and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-light-lavender mt-4">
                  <li>✓ Instagram, TikTok, YouTube</li>
                  <li>✓ Real-looking engagement</li>
                  <li>✓ Fast delivery</li>
                  <li>✓ From ₦300</li>
                </ul>
                <Link href="/dashboard/boost">
                  <Button className="w-full mt-4 bg-mint-green text-navy hover:bg-mint-green/80">
                    Boost Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-blue/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Payment Methods</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">Paystack</CardTitle>
                <CardDescription className="text-light-lavender">
                  Pay with card, bank transfer, or USSD
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader>
                <Wallet className="h-8 w-8 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">Wallet</CardTitle>
                <CardDescription className="text-light-lavender">
                  Fund your wallet for faster checkout
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader>
                <Heart className="h-8 w-8 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">Manual Upload</CardTitle>
                <CardDescription className="text-light-lavender">
                  Upload transfer screenshots for approval
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-light-lavender mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our platform for their verification and social media needs
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
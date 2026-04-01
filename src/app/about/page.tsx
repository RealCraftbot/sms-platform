"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MessageSquare, CreditCard, Wallet, Mail, Phone, MapPin, Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-primary/20 bg-navy">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-blue" />
            <span className="text-xl font-bold text-white">SMSReseller</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-white">Home</Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="text-white">About</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-white">Contact</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-white">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-navy">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">
              About SMSReseller
            </h1>
            <p className="text-xl text-light-lavender text-center max-w-3xl mx-auto">
              Your trusted platform for SMS verification services and social media accounts
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Who We Are</h2>
                <p className="text-light-lavender mb-4">
                  SMSReseller is a leading provider of temporary phone numbers for OTP verification 
                  and pre-created social media accounts. We serve customers across Nigeria and beyond.
                </p>
                <p className="text-light-lavender mb-4">
                  Our mission is to provide fast, reliable, and affordable solutions for all your 
                  verification needs. Whether you need to verify a WhatsApp account, Instagram, 
                  or purchase aged social media accounts, we've got you covered.
                </p>
              </div>
              <div className="grid gap-4">
                <Card className="bg-primary-blue/20 border-primary-blue">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Our Vision</h3>
                    <p className="text-light-lavender">
                      To become the most trusted and reliable SMS verification platform in Africa
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-mint-green/20 border-mint-green">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Our Mission</h3>
                    <p className="text-light-lavender">
                      Providing instant, secure, and affordable verification solutions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <Clock className="h-10 w-10 text-mint-green mb-2" />
                  <CardTitle className="text-white">Fast Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-light-lavender">
                    Get your verification codes and accounts instantly
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <Shield className="h-10 w-10 text-mint-green mb-2" />
                  <CardTitle className="text-white">Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-light-lavender">
                    Your data is protected with industry-standard security
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <Wallet className="h-10 w-10 text-mint-green mb-2" />
                  <CardTitle className="text-white">Affordable Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-light-lavender">
                    Competitive rates with flexible payment options
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <MessageSquare className="h-10 w-10 text-primary-blue mb-2" />
                  <CardTitle className="text-white">SMS Verification</CardTitle>
                  <CardDescription className="text-light-lavender">
                    Temporary numbers for WhatsApp, Instagram, Google, and more
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary-blue mb-2" />
                  <CardTitle className="text-white">Social Logs</CardTitle>
                  <CardDescription className="text-light-lavender">
                    Pre-created aged accounts for Instagram, Facebook, Twitter
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <CreditCard className="h-10 w-10 text-primary-blue mb-2" />
                  <CardTitle className="text-white">Paystack Payments</CardTitle>
                  <CardDescription className="text-light-lavender">
                    Pay with card, bank transfer, or USSD
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-navy border-light-lavender/20">
                <CardHeader>
                  <Wallet className="h-10 w-10 text-primary-blue mb-2" />
                  <CardTitle className="text-white">Manual Transfer</CardTitle>
                  <CardDescription className="text-light-lavender">
                    Bank transfer with easy screenshot upload
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary-blue/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-light-lavender mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust SMSReseller for their verification needs
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-mint-green text-navy hover:bg-mint-green/80">
                  Create Account
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/20 py-8 bg-navy">
        <div className="container mx-auto px-4 text-center text-light-lavender">
          <p>&copy; 2026 SMSReseller. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
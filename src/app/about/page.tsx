"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, MessageSquare, CreditCard, Wallet, Clock, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy">
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white text-center mb-4 md:mb-6">
            About SMSReseller
          </h1>
          <p className="text-lg md:text-xl text-light-lavender text-center max-w-3xl mx-auto">
            Your trusted platform for SMS verification services and social media accounts
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Who We Are</h2>
              <p className="text-light-lavender mb-4 text-sm md:text-base">
                SMSReseller is a leading provider of temporary phone numbers for OTP verification 
                and pre-created social media accounts. We serve customers across Nigeria and beyond.
              </p>
              <p className="text-light-lavender text-sm md:text-base">
                Our mission is to provide fast, reliable, and affordable solutions for all your 
                verification needs. Whether you need to verify a WhatsApp account, Instagram, 
                or purchase aged social media accounts, we've got you covered.
              </p>
            </div>
            <div className="grid gap-4">
              <Card className="bg-primary-blue/20 border-primary-blue/30">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Our Vision</h3>
                  <p className="text-light-lavender text-sm md:text-base">
                    To become the most trusted and reliable SMS verification platform in Africa
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-mint-green/10 border-mint-green/30">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Our Mission</h3>
                  <p className="text-light-lavender text-sm md:text-base">
                    Providing instant, secure, and affordable verification solutions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">Why Choose Us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <Clock className="h-8 w-8 md:h-10 md:w-10 text-mint-green mb-2" />
                <CardTitle className="text-white text-lg">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-light-lavender text-sm md:text-base">
                  Get your verification codes and accounts instantly
                </p>
              </CardContent>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-mint-green mb-2" />
                <CardTitle className="text-white text-lg">Secure & Reliable</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-light-lavender text-sm md:text-base">
                  Your data is protected with industry-standard security
                </p>
              </CardContent>
            </Card>
            <Card className="bg-navy border-light-lavender/20 sm:col-span-2 lg:col-span-1">
              <CardHeader className="p-4 md:p-6">
                <Wallet className="h-8 w-8 md:h-10 md:w-10 text-mint-green mb-2" />
                <CardTitle className="text-white text-lg">Affordable Pricing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-light-lavender text-sm md:text-base">
                  Competitive rates with flexible payment options
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">Our Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">SMS Verification</CardTitle>
                <CardDescription className="text-light-lavender text-xs md:text-sm">
                  Temporary numbers for WhatsApp, Instagram, Google, and more
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">Social Logs</CardTitle>
                <CardDescription className="text-light-lavender text-xs md:text-sm">
                  Pre-created aged accounts for Instagram, Facebook, Twitter
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <CreditCard className="h-8 w-8 md:h-10 md:w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">Paystack Payments</CardTitle>
                <CardDescription className="text-light-lavender text-xs md:text-sm">
                  Pay with card, bank transfer, or USSD
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-navy border-light-lavender/20">
              <CardHeader className="p-4 md:p-6">
                <Wallet className="h-8 w-8 md:h-10 md:w-10 text-primary-blue mb-2" />
                <CardTitle className="text-white text-lg">Manual Transfer</CardTitle>
                <CardDescription className="text-light-lavender text-xs md:text-sm">
                  Bank transfer with easy screenshot upload
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-primary-blue/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Ready to Get Started?</h2>
          <p className="text-light-lavender mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
            Join thousands of satisfied customers who trust SMSReseller for their verification needs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-mint-green text-navy hover:bg-mint-green/80 w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
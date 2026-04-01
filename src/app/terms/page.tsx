"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, CheckCircle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-navy/80 border-light-lavender/20">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary-blue" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Terms of Service</h1>
            </div>

            <div className="space-y-6 text-light-lavender text-sm md:text-base">
              <section>
                <h2 className="text-white font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
                <p>By accessing and using SMSReseller, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">2. Description of Service</h2>
                <p>SMSReseller provides temporary phone numbers for SMS verification and pre-created social media accounts. We act as a reseller platform and do not guarantee uninterrupted service availability.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">3. User Accounts</h2>
                <p>Users must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account and password. SMSReseller reserves the right to terminate accounts that violate our policies.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">4. Payment & Pricing</h2>
                <p>All prices are in Nigerian Naira (NGN). Payments are processed through Paystack. Refunds are subject to our refund policy and processed at our discretion.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">5. Prohibited Uses</h2>
                <p>You may not use our services for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Illegal activities or fraud</li>
                  <li>Spamming or harassment</li>
                  <li>Violating third-party rights</li>
                  <li>Any activity that interferes with our services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">6. Limitation of Liability</h2>
                <p>SMSReseller is not liable for any damages arising from the use of our services. We do not guarantee the availability or accuracy of phone numbers or social media accounts.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">7. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of new terms.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">8. Contact</h2>
                <p>For questions about these terms, contact us at support@smsreseller.com</p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-light-lavender/20">
              <Link href="/register" className="inline-flex items-center gap-2 text-mint-green hover:underline">
                <CheckCircle size={18} />
                Back to Registration
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, CheckCircle } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-navy/80 border-light-lavender/20">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-8 w-8 text-primary-blue" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Privacy Policy</h1>
            </div>

            <div className="space-y-6 text-light-lavender text-sm md:text-base">
              <section>
                <h2 className="text-white font-semibold text-lg mb-2">1. Information We Collect</h2>
                <p>We collect information you provide during registration (name, email, phone) and payment information processed securely through Paystack. We also collect usage data to improve our services.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">2. How We Use Your Information</h2>
                <p>Your information is used to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Provide and maintain our services</li>
                  <li>Process your transactions</li>
                  <li>Send you important updates and notifications</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">3. Data Protection</h2>
                <p>We implement appropriate security measures to protect your personal data. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">4. Information Sharing</h2>
                <p>We do not sell, trade, or transfer your personal information to outside parties. We may share information with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Service providers who assist our operations</li>
                  <li>Payment processors (Paystack)</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">5. Cookies</h2>
                <p>We use cookies to enhance your experience. You can control cookies through your browser settings. Disabling cookies may affect functionality.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">6. Third-Party Links</h2>
                <p>Our website may contain links to third-party sites. We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">8. Child Privacy</h2>
                <p>Our services are not intended for users under 18. We do not knowingly collect information from children under 18.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">9. Changes to Policy</h2>
                <p>We may update this privacy policy periodically. We will notify you of significant changes via email or through our website.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-lg mb-2">10. Contact Us</h2>
                <p>For questions about this policy, contact us at support@smsreseller.com</p>
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
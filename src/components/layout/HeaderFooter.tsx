"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-primary/20 bg-navy sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary-blue" />
          <span className="text-xl font-bold text-white">SMSReseller</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button 
                variant="ghost" 
                className={`text-white ${pathname === link.href ? 'bg-white/10' : ''}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <Link href="/login">
            <Button variant="ghost" className="text-white">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-mint-green text-navy hover:bg-mint-green/80">Register</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-primary/20 py-8 bg-navy">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Shield className="h-6 w-6 text-primary-blue" />
              <span className="text-lg font-bold text-white">SMSReseller</span>
            </div>
            <p className="text-light-lavender text-sm">
              Your trusted platform for SMS verification and social media accounts in Nigeria.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-light-lavender text-sm hover:text-mint-green">About Us</Link>
              <Link href="/contact" className="block text-light-lavender text-sm hover:text-mint-green">Contact</Link>
              <Link href="/login" className="block text-light-lavender text-sm hover:text-mint-green">Login</Link>
              <Link href="/register" className="block text-light-lavender text-sm hover:text-mint-green">Register</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-light-lavender text-sm">Email: support@smsreseller.com</p>
            <p className="text-light-lavender text-sm">Phone: +234 800 SMS RESELLER</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary/20 text-center">
          <p className="text-light-lavender text-sm">&copy; 2026 SMSReseller. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-primary/20 bg-navy sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary-blue" />
          <span className="text-lg font-bold text-white">SMSReseller</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button 
                variant="ghost" 
                className={`text-white text-sm ${pathname === link.href ? 'bg-white/10' : ''}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <Link href="/login">
            <Button variant="ghost" className="text-white text-sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-mint-green text-navy hover:bg-mint-green/80 text-sm px-4">Register</Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-primary/20 bg-navy px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-white text-sm ${pathname === link.href ? 'bg-white/10' : ''}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start text-white text-sm">Login</Button>
          </Link>
          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-mint-green text-navy hover:bg-mint-green/80 text-sm">Register</Button>
          </Link>
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-primary/20 py-8 bg-navy">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <Shield className="h-5 w-5 text-primary-blue" />
              <span className="text-base font-bold text-white">SMSReseller</span>
            </div>
            <p className="text-light-lavender text-xs md:text-sm">
              Your trusted platform for SMS verification and social media accounts in Nigeria.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-light-lavender text-xs md:text-sm hover:text-mint-green">About Us</Link>
              <Link href="/contact" className="block text-light-lavender text-xs md:text-sm hover:text-mint-green">Contact</Link>
              <Link href="/login" className="block text-light-lavender text-xs md:text-sm hover:text-mint-green">Login</Link>
              <Link href="/register" className="block text-light-lavender text-xs md:text-sm hover:text-mint-green">Register</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm">Contact</h4>
            <p className="text-light-lavender text-xs md:text-sm">Email: support@smsreseller.com</p>
            <p className="text-light-lavender text-xs md:text-sm">Phone: +234 800 SMS RESELLER</p>
          </div>
        </div>
        <div className="mt-6 md:mt-8 pt-4 md:pt-8 border-t border-primary/20 text-center">
          <p className="text-light-lavender text-xs">&copy; 2026 SMSReseller. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
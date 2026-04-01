"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Shield, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const userNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/sms/order", label: "Order SMS" },
  { href: "/dashboard/logs", label: "Social Logs" },
  { href: "/dashboard/wallet", label: "Wallet" },
  { href: "/dashboard/orders", label: "Orders" },
]

const adminNavLinks = [
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/logs", label: "Upload Logs" },
]

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isAdmin = session?.user?.email === "admin@smsreseller.com"
  const isLoggedIn = status === "authenticated"

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
          
          {isLoggedIn ? (
            <div className="relative">
              <Button 
                variant="ghost" 
                className="text-white text-sm flex items-center gap-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User size={18} />
                {session?.user?.name || session?.user?.email}
              </Button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-navy border border-light-lavender/20 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-light-lavender/20">
                    <p className="text-white text-sm font-medium">{session?.user?.name || 'User'}</p>
                    <p className="text-light-lavender text-xs">{session?.user?.email}</p>
                  </div>
                  {userNavLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className="block px-4 py-2 text-white text-sm hover:bg-white/10"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <>
                      <div className="border-t border-light-lavender/20 mt-2 pt-2">
                        {adminNavLinks.map((link) => (
                          <Link 
                            key={link.href} 
                            href={link.href}
                            className="block px-4 py-2 text-mint-green text-sm hover:bg-white/10"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      setUserMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 text-sm hover:bg-white/10 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white text-sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-mint-green text-navy hover:bg-mint-green/80 text-sm px-4">Register</Button>
              </Link>
            </>
          )}
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
          
          {isLoggedIn ? (
            <>
              <div className="border-t border-light-lavender/20 pt-2 mt-2">
                <p className="text-light-lavender text-xs px-2 mb-2">Account</p>
                {userNavLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start text-white text-sm">
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
              {isAdmin && (
                <div className="border-t border-light-lavender/20 pt-2 mt-2">
                  <p className="text-mint-green text-xs px-2 mb-2">Admin</p>
                  {adminNavLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start text-mint-green text-sm">
                        {link.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false)
                  signOut({ callbackUrl: "/" })
                }}
                className="w-full text-left px-4 py-2 text-red-400 text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <div className="border-t border-light-lavender/20 pt-2 mt-2 space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-white text-sm">Login</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-mint-green text-navy hover:bg-mint-green/80 text-sm">Register</Button>
              </Link>
            </div>
          )}
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
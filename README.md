# SMS Reseller Platform - Complete Guide

## Overview
SMS Reseller Platform is a multi-service marketplace for:
- **SMS Verification** - Phone numbers for OTP verification (WhatsApp, Telegram, Facebook, etc.)
- **Social Media Accounts** - Instagram, Facebook, Twitter accounts
- **External Services** - VPN and entertainment services (BabyMaker)

## Tech Stack
- Next.js 16 + TypeScript + Tailwind CSS
- shadcn/ui components
- Prisma ORM + PostgreSQL
- NextAuth.js authentication
- Cloudinary (file uploads)

---

## Platform Links (Replace with your domain)

| Page | URL |
|------|-----|
| Home | `https://your-domain.com` |
| Login | `https://your-domain.com/login` |
| Register | `https://your-domain.com/register` |
| User Dashboard | `https://your-domain.com/dashboard` |
| Order SMS | `https://your-domain.com/dashboard/sms/order` |
| Wallet | `https://your-domain.com/dashboard/wallet` |
| Orders | `https://your-domain.com/dashboard/orders` |
| Social Logs | `https://your-domain.com/dashboard/logs` |
| **Admin Login** | `https://your-domain.com/login` (same as user) |
| **Admin Panel** | `https://your-domain.com/admin/pricing` |
| Admin Settings | `https://your-domain.com/admin/settings` |
| Admin Payments | `https://your-domain.com/admin/payments` |
| Admin Logs | `https://your-domain.com/admin/logs` |

### Admin Credentials
- **Email**: `admin@smsreseller.com`
- **Password**: Set during registration or update directly in database

> **Note**: After registering an admin account, update the email in the code or directly in PostgreSQL to `admin@smsreseller.com` for full admin access.

---

## Environment Variables (Railway)

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# Paystack (Coming Soon - optional)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# SMS Suppliers
SMSPOOL_API_KEY=your-smspool-key
SMSPINVERIFY_API_KEY=your-smspinverify-key
SMSACTIVATE_API_KEY=your-smsactivate-key
ACCTSHOP_API_KEY=your-acctshop-key
TUTADS_API_KEY=your-tutads-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## How It Works

### 1. User Flow
1. **Register** at `/register`
2. **Add Funds** via `/dashboard/wallet` → Manual Transfer → Upload proof → Admin approves → Balance added
3. **Order SMS** at `/dashboard/sms/order` → Select service/country → Pay with wallet → Get phone number
4. **Check SMS** at `/dashboard/orders` → Click "Check SMS" to retrieve OTP codes
5. **Buy Social Logs** at `/dashboard/logs` → Select accounts → Pay with wallet → Receive credentials

### 2. Admin Flow
1. **Login** at `/login` with admin credentials
2. **Approve Payments** at `/admin/payments` → Review proofs → Approve/Reject → Funds added to user wallet
3. **Manage Pricing** at `/admin/pricing` → Set prices for SMS services
4. **Upload Social Logs** at `/admin/logs` → Add accounts for users to purchase
5. **Supplier Settings** at `/admin/settings` → Switch between SMS/Social API providers

---

## SMS Suppliers Configuration

Go to `/admin/settings` to configure:

### SMS & Verification Suppliers
- **SMSPool** - Default SMS verification
- **SMSPinVerify** - Alternative SMS
- **SMS-Activate** - Alternative SMS

### Social Media Suppliers
- **AcctShop** - Social media accounts API
- **TutAds** - Social media services API

### External Services (No API)
- **BabyMaker VPN** - Opens external link: https://babymaker.sellpass.io

---

## Payment Flow

1. **Manual Transfer** (Active)
   - User transfers to bank account
   - Uploads screenshot proof (stored in Cloudinary)
   - Admin reviews at `/admin/payments`
   - If approved: funds added to user's wallet

2. **Paystack** (Coming Soon - disabled)

3. **Crypto** (Coming Soon - disabled)

---

## Database Schema

### Key Models
- **User** - Customers and admin
- **Order** - All transactions (deposit, sms, log)
- **SMSOrder** - SMS order details with phone number
- **SocialLog** - Available accounts for purchase
- **PaymentMethod** - wallet, paystack, manual
- **PricingRule** - Service prices
- **Setting** - Supplier configuration
- **ManualPayment** - Payment proofs

---

## Build Commands

```bash
# Development
npm run dev

# Build for production
npm run build
npm run start

# Linting
npm run lint

# Database
npx prisma db push      # Push schema changes
npx prisma generate     # Generate client
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/sms/order` | POST | Place SMS order |
| `/api/sms/order` | GET | List SMS orders |
| `/api/sms/check` | POST | Check for SMS code |
| `/api/logs/order` | POST | Purchase social logs |
| `/api/wallet/balance` | GET | Get user balance |
| `/api/payments/manual/upload` | POST | Upload payment proof |
| `/api/admin/settings` | GET/POST | Manage supplier settings |
| `/api/admin/payments/pending` | GET | List pending payments |
| `/api/admin/payments/[id]/review` | POST | Approve/reject payment |
| `/api/upload/proof` | POST | Upload to Cloudinary |

---

## Support
- Email: support@smsreseller.com
- Contact Page: `/contact`
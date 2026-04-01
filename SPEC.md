# SMS Verification & Social Media Logs Reseller Platform

## 1. Project Overview

**Project Name:** SMSReseller
**Type:** Full-stack web application (Next.js 14)
**Core Functionality:** Resells SMS verification numbers and social media logs with dual payment (Paystack auto + Manual upload with admin review)
**Target Market:** Nigeria (NGN currency)

---

## 2. Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (via Prisma)
- **Auth:** NextAuth.js with credentials provider
- **Payments:** Paystack (inline JS), Manual upload (file upload)
- **File Storage:** Local filesystem (for development)

---

## 3. Database Schema

Refer to the provided Prisma schema in the prompt. Key models:
- User, Admin, PaymentMethod, PricingRule
- Order (with polymorphic associations)
- SMSOrder, LogCategory, SocialLog, LogOrder
- Transaction, ManualPayment

---

## 4. Pages Structure

### Public Pages
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### User Dashboard (Auth required)
- `/dashboard` - Overview with balance, recent orders
- `/dashboard/sms/order` - Order SMS verification number
- `/dashboard/logs` - Browse and purchase social media logs
- `/dashboard/wallet` - Deposit funds (Paystack + Manual upload tabs)
- `/dashboard/orders` - Order history and status

### Admin Dashboard
- `/admin` - Overview
- `/admin/pricing` - Manage pricing rules
- `/admin/payments` - Review pending manual payments
- `/admin/logs` - Upload social logs via CSV

---

## 5. Key Features

### SMS Verification
- Service selection: WhatsApp, Instagram, Telegram, Facebook, Google, Twitter, TikTok
- Country selection: Nigeria, US, UK, 50+ countries
- Real-time SMS checking
- Order cancellation if no SMS received

### Social Media Logs
- Pre-created accounts with: platform, username, password, age, followers, verified status
- Category-based browsing
- Stock management
- Bulk upload via CSV (admin)

### Paystack Payment
- Inline JS popup
- Card, bank transfer, USSD support
- Webhook for auto-approval
- NGN currency

### Manual Payment
- Bank transfer screenshot upload
- Admin approval/rejection workflow
- Review notes support

### Reseller Pricing
- Base price + markup (percentage or fixed)
- Per-service and per-country rules
- Profit calculation

---

## 6. API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### SMS
- `GET /api/services` - List available services/countries
- `POST /api/sms/order` - Create SMS order
- `GET /api/sms/orders` - List user's SMS orders

### Logs
- `GET /api/logs` - List available logs (with filters)
- `POST /api/logs/order` - Purchase logs
- `GET /api/logs/orders/:id/download` - Download log credentials

### Payments
- `POST /api/payments/paystack/initialize` - Initialize Paystack payment
- `POST /api/payments/paystack/verify` - Verify payment
- `POST /webhooks/paystack` - Paystack webhook handler
- `POST /api/payments/manual/upload` - Upload manual payment screenshot

### Admin
- `GET /api/admin/payments/pending` - List pending manual payments
- `POST /api/admin/payments/:id/review` - Approve/reject payment
- `GET /api/admin/pricing` - List pricing rules
- `POST /api/admin/pricing/rules` - Create/update pricing rule
- `POST /api/admin/logs/upload` - Upload logs via CSV

---

## 7. UI Components (shadcn/ui)

- Button, Card, Input, Label, Select
- Tabs (for wallet payment method selection)
- Table (for orders, logs)
- Dialog (for order details)
- Badge (for status)
- Toast (for notifications)
- Form components

---

## 8. Acceptance Criteria

1. ✅ Users can register and login
2. ✅ Users can browse SMS services and countries
3. ✅ Users can order SMS verification numbers
4. ✅ Users can browse and purchase social media logs
5. ✅ Users can pay via Paystack (auto-approval)
6. ✅ Users can upload manual payment (admin approval)
7. ✅ Admin can review and approve/reject manual payments
8. ✅ Admin can set pricing rules with markup
9. ✅ Admin can upload social logs via CSV
10. ✅ Proper balance management for purchases
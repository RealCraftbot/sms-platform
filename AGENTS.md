# AGENTS.md - SMS Reseller Platform

## Project Overview
- **Stack**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Prisma ORM + PostgreSQL
- **Purpose**: SMS verification numbers & social media logs reseller platform
- **Target**: Nigeria market (NGN currency, Paystack payments)

---

## Build Commands

```bash
# Development
npm run dev                 # Start dev server on localhost:3000

# Build
npm run build              # Production build
npm run start             # Start production server

# Linting
npm run lint              # Run ESLint
```

**Note**: No test suite configured yet. To add tests, use `npm install -D @testing-library/react jest` and configure jest.config.js.

---

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Order: external → internal → relative
- Group by: React/Next imports → UI components → lib utilities → types

```typescript
// ✓ Good
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// ✗ Avoid
import { Button } from "../../components/ui/button"
```

### Formatting
- Use 2 spaces for indentation (not tabs)
- Single quotes for strings (unless contains apostrophe)
- Trailing commas on last item
- Maximum line length: 100 characters

### File Naming
- **Pages/Components**: `PascalCase` (e.g., `DashboardPage.tsx`, `Button.tsx`)
- **Utilities/Lib**: `camelCase` (e.g., `prisma.ts`, `auth.ts`, `utils.ts`)
- **API Routes**: `route.ts` (Next.js App Router convention)
- **Model Schemas**: `PascalCase` in `/prisma` (e.g., `schema.prisma`)

### Types
- Use explicit types for function parameters and return values
- Use `interface` for objects, `type` for unions/aliases
- Avoid `any` - use `unknown` when type is truly unknown

```typescript
// ✓ Good
interface User {
  id: string
  email: string
  name?: string
}

function getUser(id: string): Promise<User | null>

// ✗ Avoid
function getUser(id) { ... }  // no types
const user: any = data       // avoid any
```

### Components
- Use functional components with hooks
- Add `"use client"` directive for client-side interactivity
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks

```typescript
// ✓ Good - Client component with explicit directive
"use client"

import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  
  return (
    <form>...</form>
  )
}
```

### Error Handling
- Always wrap async operations in try/catch
- Return proper NextResponse with status codes
- Log errors with console.error for debugging

```typescript
// ✓ Good
export async function POST(request: Request) {
  try {
    const data = await processRequest(request)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Handler error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// ✗ Avoid
export async function POST(request: Request) {
  const data = await processRequest(request)  // no error handling
  return NextResponse.json(data)
}
```

### Database (Prisma)
- Always use `prisma` singleton from `@/lib/prisma`
- Use Prisma's built-in types from generated client
- Handle connection errors gracefully

```typescript
// ✓ Good
import { prisma } from "@/lib/prisma"

export async function getUsers() {
  return prisma.user.findMany()
}

// ✗ Avoid creating new PrismaClient instances
const prisma = new PrismaClient()  // each request
```

### API Routes
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Validate request body with early returns
- Use NextResponse for responses

### Authentication
- Use NextAuth.js with JWT strategy
- Protect routes with `getServerSession`
- Extend types via declaration merging (see `src/lib/auth.ts`)

### Environment Variables
- Never commit secrets to git
- Use `.env` for local, Railway dashboard for production
- Prefix public keys with `NEXT_PUBLIC_`

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── admin/         # Admin-only endpoints
│   │   ├── payments/      # Payment processing
│   │   ├── sms/           # SMS ordering
│   │   └── logs/          # Social logs
│   ├── dashboard/         # User dashboard pages
│   ├── admin/             # Admin panel pages
│   ├── login/             # Auth pages
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # shadcn/ui components
└── lib/                   # Utilities
    ├── prisma.ts          # DB client singleton
    ├── auth.ts            # NextAuth config
    └── utils.ts           # Helper functions
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script
```

---

## Common Tasks

### Adding a new API endpoint
1. Create route file in `/src/app/api/[resource]/route.ts`
2. Export GET/POST/PUT/DELETE functions
3. Use `@/lib/prisma` for database access
4. Use `@/lib/auth` for auth protection

### Adding a UI component
1. Use existing shadcn/ui components from `/src/components/ui/`
2. Or create new component in appropriate location

### Database changes
1. Modify `/prisma/schema.prisma`
2. Run `npx prisma db push` locally
3. Update Railway via deployment (runs postDeployCommand)

### Adding Pricing Rules
- Admin-only, set via `/admin/pricing`
- Supports percentage or fixed markup

---

## Deployment

- **Platform**: Railway
- **PostDeploy**: `npx prisma db push && npx tsx prisma/seed.ts`
- **Environment**: Set via Railway dashboard variables
- **Build**: Auto-triggered on GitHub push to master
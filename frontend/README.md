# 🎨 LeakLens Frontend

**Next.js 15 + React 19 + TypeScript** - Modern, performant frontend for blockchain surveillance analysis.

This document explains how the frontend works, its architecture, and how it connects with the Python backend.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Backend Connection](#backend-connection)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Key Features](#key-features)
- [Development](#development)
- [Performance Optimizations](#performance-optimizations)
- [Component Guide](#component-guide)

---

## 🎯 Overview

The LeakLens frontend is a **Next.js 15** application built with **React 19** and **TypeScript**. It provides an intuitive, modern interface for analyzing Solana wallet privacy exposure.

### Key Capabilities

- 🔍 **Wallet Analysis Interface** - Enter any Solana address and get comprehensive privacy analysis
- 📊 **Interactive Dashboards** - Visualize surveillance exposure, temporal patterns, and network connections
- ⚡ **Real-time Analysis** - Connect to Python backend for live blockchain data processing
- 🎨 **Modern UI/UX** - Premium dark theme with smooth animations and responsive design
- 📱 **Mobile Responsive** - Optimized for all device sizes

---

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom CSS Variables** - OKLCH color system for premium theming

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Custom Components** - Tailored UI components in `/components/ui`

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Next.js Dev Server** - Hot module replacement

---

## 🏗️ Architecture

### App Router Structure

```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout with metadata
├── globals.css             # Global styles and animations
│
├── analysis/
│   └── [wallet]/
│       └── page.tsx        # Dynamic wallet analysis page
│
└── api/
    └── analyze-wallet/
        └── route.ts        # API route (proxies to Python backend)
```

### Component Architecture

```
components/
├── landing/                 # Landing page components
│   ├── hero-section.tsx
│   ├── feature-highlights.tsx
│   ├── investigation-process.tsx
│   └── animated-wrapper.tsx
│
├── analysis/                # Analysis page components
│   ├── wallet-overview.tsx
│   ├── surveillance-exposure.tsx
│   ├── temporal-fingerprint.tsx
│   ├── portfolio.tsx
│   └── ... (15+ analysis components)
│
├── ui/                     # Reusable UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── badge.tsx
│
├── navbar.tsx              # Top navigation
└── footer.tsx              # Footer component
```

---

## 🔌 Backend Connection

### Connection Architecture

The frontend connects to the Python FastAPI backend through **Next.js API Routes** that act as a proxy layer.

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────> │  Next.js API │ ──────> │   FastAPI   │
│  (Client)   │         │    Route     │         │   Backend   │
└─────────────┘         └──────────────┘         └─────────────┘
     Port 3000              Port 3000              Port 8000
```

### API Route Implementation

**Location:** `app/api/analyze-wallet/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 1. Receive request from frontend
  const body = await request.json()
  
  // 2. Forward to Python backend
  const response = await fetch('http://127.0.0.1:8000/analyze-wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal, // 2-minute timeout
  })
  
  // 3. Return response to frontend
  return NextResponse.json(data)
}
```

### Why Use API Routes?

1. **Timeout Handling** - Next.js API routes support extended timeouts (120s) for long-running analysis
2. **Error Handling** - Centralized error handling and formatting
3. **Security** - Backend URL not exposed to client
4. **CORS Management** - Avoids CORS issues between frontend and backend
5. **Request Transformation** - Can modify requests/responses if needed

### Backend Endpoint

**Python Backend:** `http://127.0.0.1:8000/analyze-wallet`

**Request Format:**
```json
{
  "wallet": "DL66m4cajzyz6659m8djQmuY5RdJpevhf7a5vFVEFech",
  "limit": 100
}
```

**Response Format:**
```typescript
interface AnalysisResult {
  wallet: string
  surveillance_score: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence: number
  temporal_fingerprint: TemporalFingerprint
  behavioral_classification: BehavioralClassification
  portfolio: PortfolioData
  // ... more fields
}
```

### Configuration

**Backend URL:** Hardcoded in `app/api/analyze-wallet/route.ts`

```typescript
const response = await fetch('http://127.0.0.1:8000/analyze-wallet', {
  // ...
})
```

**For Production:** Update to your backend URL:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
```

---

## 📁 Project Structure

### Directory Overview

```
frontend/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   │
│   ├── analysis/                # Analysis pages
│   │   └── [wallet]/
│   │       └── page.tsx         # Dynamic route for wallet analysis
│   │
│   └── api/                     # API routes (Next.js serverless)
│       └── analyze-wallet/
│           └── route.ts         # Proxy to Python backend
│
├── components/                   # React components
│   ├── landing/                 # Landing page components
│   │   ├── hero-section.tsx
│   │   ├── feature-card.tsx
│   │   ├── animated-wrapper.tsx
│   │   └── use-scroll-animation.ts
│   │
│   ├── analysis/                 # Analysis page components
│   │   ├── wallet-overview.tsx
│   │   ├── surveillance-exposure.tsx
│   │   ├── portfolio.tsx
│   │   ├── types.ts             # TypeScript types
│   │   ├── utils.ts             # Utility functions
│   │   └── index.ts             # Barrel exports
│   │
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   │
│   ├── navbar.tsx               # Navigation bar
│   └── footer.tsx               # Footer
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.ts              # Next.js config
├── tailwind.config.js          # Tailwind config (if exists)
└── postcss.config.mjs          # PostCSS config
```

---

## 🔄 Data Flow

### Complete Request Flow

```
1. User enters wallet address on landing page
   ↓
2. Frontend navigates to /analysis/[wallet]
   ↓
3. Analysis page component mounts
   ↓
4. useEffect hook triggers API call
   ↓
5. POST request to /api/analyze-wallet
   ↓
6. Next.js API route receives request
   ↓
7. API route forwards to Python backend (http://127.0.0.1:8000)
   ↓
8. Python backend processes analysis
   ↓
9. Response sent back through API route
   ↓
10. Frontend receives data and updates state
   ↓
11. Components render analysis results
```

### Code Example

**Analysis Page:** `app/analysis/[wallet]/page.tsx`

```typescript
export default function AnalysisPage({ params }: { params: Promise<{ wallet: string }> }) {
  const [data, setData] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      // 1. Call Next.js API route
      const response = await fetch('/api/analyze-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, limit: 100 }),
      })

      // 2. Parse response
      const result = await response.json()
      setData(result)
      setLoading(false)
    }
    
    fetchAnalysis()
  }, [wallet])

  // 3. Render components with data
  return (
    <div>
      <WalletOverview data={data} />
      <SurveillanceExposureSection data={data.surveillance_exposure} />
      {/* ... more sections */}
    </div>
  )
}
```

---

## ✨ Key Features

### 1. Landing Page (`app/page.tsx`)

**Features:**
- Hero section with wallet input
- Feature highlights (4 cards)
- Investigation process (3 steps)
- Smooth scroll animations
- Lazy loading for performance

**Components:**
- `HeroSection` - Main input and CTA
- `FeatureHighlights` - Feature cards
- `InvestigationProcess` - Process steps

### 2. Analysis Page (`app/analysis/[wallet]/page.tsx`)

**Features:**
- Dynamic route based on wallet address
- Real-time data fetching
- Loading and error states
- Lazy-loaded sections for performance
- Scroll-triggered animations

**Sections:**
1. **Wallet Overview** - Basic wallet info
2. **Surveillance Exposure** - Risk score and level
3. **Portfolio** - Token holdings
4. **Temporal Fingerprint** - Timezone detection
5. **Behavioral Classification** - Bot detection
6. **Network Analysis** - Wallet connections
7. **Risk Assessment** - Detailed risk breakdown
8. **Trading P&L** - Profit/loss analysis
9. **Income Sources** - Revenue streams
10. **OpSec Failures** - Security issues
11. **Geographic Analysis** - Location inference
12. **Ego Network** - Connection graph
13. **Mempool Forensics** - Transaction analysis
14. **Advanced Data** - Raw metrics

### 3. Performance Optimizations

**Lazy Loading:**
```typescript
// Only critical sections load immediately
const RiskAssessmentSection = lazy(() => 
  import('@/components/analysis/risk-assessment')
)
```

**Code Splitting:**
- Landing page sections lazy-loaded
- Analysis sections loaded on demand
- Reduces initial bundle size

**Memoization:**
```typescript
export const FeatureCard = memo(function FeatureCard({ ... }) {
  // Prevents unnecessary re-renders
})
```

**Suspense Boundaries:**
```typescript
<Suspense fallback={<SectionSkeleton />}>
  <FeatureHighlights />
</Suspense>
```

---

## 💻 Development

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager

### Installation

```bash
cd frontend
npm install
```

### Running Development Server

```bash
npm run dev
```

**Access:** http://localhost:3000

### Building for Production

```bash
npm run build
npm start
```

### Environment Variables

Create `.env.local` in `frontend/` directory:

```bash
# Optional: Backend URL (defaults to localhost:8000)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Development Workflow

1. **Start Backend First:**
   ```bash
   # In root directory
   python run_server.py
   ```

2. **Start Frontend:**
   ```bash
   # In frontend directory
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 🎨 Component Guide

### Landing Page Components

#### `HeroSection`
- Wallet input form
- Demo wallet button
- Error handling
- Navigation to analysis page

#### `FeatureCard`
- Premium card design
- Icon + title + description
- Hover animations
- Scroll-triggered entrance

#### `AnimatedWrapper`
- Scroll animation hook
- Multiple directions (up, down, fade)
- Intersection Observer based
- Respects reduced motion

### Analysis Components

#### `WalletOverview`
- Wallet address display
- Copy to clipboard
- Basic statistics
- Risk level badge

#### `SurveillanceExposureSection`
- Risk score gauge
- Risk level classification
- Confidence metrics
- Animated score display

#### `PortfolioSection`
- Token holdings table
- Net worth calculation
- Price changes
- Token logos

#### `TemporalFingerprintSection`
- Activity heatmap
- Timezone detection
- Sleep window visualization
- Geographic probabilities

### Shared Components

#### `AnimatedSection`
- Wrapper for scroll animations
- Staggered delays
- Fade + translate effects

#### `SectionSkeleton`
- Loading state placeholder
- Matches section layout
- Smooth animations

---

## 🔧 Configuration Files

### `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/portfolio/:path*',
        destination: 'http://127.0.0.1:8000/portfolio/:path*',
      },
    ]
  },
}
```

**Purpose:** Proxy certain routes directly to backend (optional, not currently used)

### `tsconfig.json`

- TypeScript configuration
- Path aliases (`@/components`, `@/lib`)
- Strict type checking

### `package.json`

**Key Scripts:**
- `dev` - Development server
- `build` - Production build
- `start` - Production server
- `lint` - ESLint checking

**Key Dependencies:**
- `next@15.1.0` - Framework
- `react@19.0.0` - UI library
- `typescript@5.7.0` - Type safety
- `tailwindcss@4.1.18` - Styling
- `lucide-react` - Icons

---

## 🚀 Performance Optimizations

### 1. Code Splitting

- **Route-based:** Each page is a separate chunk
- **Component-based:** Lazy-loaded sections
- **Dynamic imports:** Heavy components loaded on demand

### 2. Image Optimization

- Next.js Image component (when used)
- Automatic format optimization
- Lazy loading by default

### 3. Caching

- API route responses cached
- Static page generation where possible
- Browser caching for assets

### 4. Bundle Size

- Tree shaking enabled
- Unused code eliminated
- Minimal dependencies

### 5. Rendering

- Client-side rendering for interactivity
- Server components where possible (Next.js 15)
- Memoization to prevent re-renders

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Problem:** `Failed to fetch` or `Connection refused`

**Solutions:**
1. Ensure backend is running on port 8000
2. Check `app/api/analyze-wallet/route.ts` for correct URL
3. Verify no firewall blocking localhost connections
4. Check browser console for CORS errors

### Analysis takes too long

**Problem:** Request timeout

**Solutions:**
- Timeout is set to 120 seconds in API route
- Check backend logs for processing time
- Reduce transaction limit in request
- Check Helius API rate limits

### Type errors

**Problem:** TypeScript compilation errors

**Solutions:**
1. Check `components/analysis/types.ts` for type definitions
2. Ensure backend response matches TypeScript types
3. Run `npm run build` to see all type errors
4. Update types if backend response changed

### Styling issues

**Problem:** Styles not applying

**Solutions:**
1. Check `app/globals.css` is imported in layout
2. Verify Tailwind is configured correctly
3. Check PostCSS config
4. Clear `.next` cache: `rm -rf .next`

---

## 📚 Additional Resources

### Next.js Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

### React Documentation
- [React 19 Docs](https://react.dev)
- [Hooks Reference](https://react.dev/reference/react)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

When contributing to the frontend:

1. **Follow TypeScript** - Use types for all props and data
2. **Component Structure** - Keep components focused and reusable
3. **Performance** - Use memoization and lazy loading
4. **Accessibility** - Use semantic HTML and ARIA labels
5. **Styling** - Follow existing Tailwind patterns
6. **Testing** - Test in multiple browsers

---

## 📝 Notes

- **Backend Dependency:** Frontend requires Python backend running on port 8000
- **Development:** Use `npm run dev` for hot reloading
- **Production:** Build with `npm run build` before deployment
- **API Routes:** Located in `app/api/` directory
- **Types:** All types defined in `components/analysis/types.ts`

---

**Last Updated:** 2024

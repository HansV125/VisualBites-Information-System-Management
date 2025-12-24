# VisualBites Frontend

A modern frozen food e-commerce platform built with Next.js 15, featuring a brutalist/retro design aesthetic.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
vb-frontend/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useCart.ts       # Cart management hook
│   └── useProducts.ts   # Products data hook
├── lib/                  # Utilities and configuration
│   ├── api.ts           # API client functions
│   ├── constants.ts     # App constants
│   ├── data.ts          # Zod schemas
│   ├── sanitize.ts      # XSS prevention utilities
│   └── store.ts         # Zustand state management
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared interfaces
└── public/              # Static assets
    ├── logo/            # Brand logos
    ├── favicon/         # Favicon assets
    └── uploads/         # Product images
```

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand (with persist)
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner (Toast)
- **Icons**: Lucide React

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🎨 Design System

The app uses a brutalist/retro paper aesthetic with:
- **Colors**: Paper white (#FEFDF5), Cream (#F5F0E8), Ink black (#1a1a1a)
- **Fonts**: JetBrains Mono (monospace), Patrick Hand (handwritten), VT323 (receipt), Permanent Marker (titles)
- **Components**: Bold borders, box shadows, receipt-style textures

## 📱 Features

### Customer-Facing
- Product carousel with swipe gestures
- Real-time cart with receipt UI
- WhatsApp order integration
- Mobile-optimized bottom sheet navigation

### Admin Dashboard
- **CMS**: Product management with image upload
- **IMS**: Inventory tracking with expiry dates
- **Orders**: Order processing workflow
- **Stats**: Sales analytics and statistics

## 🔐 Security

- Input sanitization for XSS prevention
- JWT authentication with httpOnly cookies
- CORS protection
- Rate limiting (via backend)

## 📦 Build & Deploy

```bash
# Build production bundle
npm run build

# Analyze bundle size
npm run build -- --analyze

# Docker build
docker build -t vb-frontend .
```

## 🧪 Development

```bash
# Type checking
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

# Quantize Web

This package contains the Next.js frontend for Quantize - an AI Discovery Platform for finding and connecting with innovative AI tools.

## Overview

The web application is built with [Next.js](https://nextjs.org/) 15 (App Router) and styled with [Tailwind CSS](https://tailwindcss.com/). It provides the main user interface for interacting with the Quantize platform.

## Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Shadcn UI + Radix UI
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Drizzle ORM with Neon (PostgreSQL)

### Project Structure

```
packages/web/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── results/           # Search results page
│   ├── dashboard/         # User dashboard
│   ├── auth/              # Authentication pages
│   ├── onboarding/        # User onboarding
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Context providers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── features/          # Feature-specific components
│   ├── layout/            # Layout components
│   ├── shared/            # Shared components
│   └── ui/                # UI primitives
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
│   ├── api/               # API client (planned)
│   ├── server/            # Server-side utilities
│   ├── design-tokens.ts   # Design system tokens
│   └── utils.ts           # General utilities
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── shared/                # Shared schemas and types
```

### Key Features

- **Server-Side Rendering (SSR)**: For fast initial page loads and improved SEO
- **API Routes**: Backend logic handled by Next.js API routes
- **Authentication**: User authentication managed via Firebase
- **Component-Based Architecture**: Modular, reusable React components
- **Feature-Based Organization**: Components organized by feature for better scalability
- **Type Safety**: Full TypeScript support with strict mode
- **Modern UI**: Cosmic-themed design with glassmorphism effects
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/)

### Installation

From the root of the monorepo:

```bash
pnpm install
```

### Development

To run the web application in development mode:

```bash
pnpm dev
```

This will start the Next.js development server on [http://localhost:3001](http://localhost:3001).

From the `packages/web` directory:

```bash
pnpm dev
```

### Building for Production

To create a production-ready build:

```bash
pnpm build
```

This will generate an optimized version of the application in the `.next` directory.

### Type Checking

To run TypeScript type checking:

```bash
pnpm check
```

## Development Guide

### Component Development

Components are organized by feature for better scalability:

- **Features** (`components/features/`): Feature-specific components
- **Layout** (`components/layout/`): Page structure components
- **Shared** (`components/shared/`): Reusable components
- **UI** (`components/ui/`): Low-level UI primitives

See [components/README.md](./components/README.md) for detailed guidelines.

### Styling

We use Tailwind CSS with a custom design system:

- **Design Tokens**: See `lib/design-tokens.ts` for spacing, colors, etc.
- **Utilities**: Custom utility classes in `app/styles/utilities.css`
- **Theme**: Cosmic/space theme with dark mode support
- **CSS Variables**: Defined in `app/globals.css`

### State Management

- **React Query**: For server state and API calls
- **Zustand**: For client state management
- **React Context**: For app-wide state (auth, theme, etc.)

### Routing

Next.js App Router with file-based routing:

- Pages in `app/` directory
- Dynamic routes: `[id]/page.tsx`
- Layouts: `layout.tsx` files
- Loading states: `loading.tsx` files

## Code Quality

### TypeScript

- Strict mode enabled
- No implicit any
- Consistent type definitions in `types/`

### File Structure

```tsx
/* File Overview
  Path: [relative-path]
  Purpose: [description]
  
  Reading tip for newcomers:
  - [guidance for understanding the file]
*/

// Imports organized by category
import { } from 'react';        // React
import { } from 'next';         // Next.js
import { } from '@/components'; // Components
import { } from '@/lib';        // Utilities
```

### Best Practices

1. **Component Organization**: Keep components focused and single-purpose
2. **Barrel Exports**: Use `index.ts` for clean imports
3. **Type Safety**: Define types for all props and functions
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Performance**: Use React.memo() and useMemo() when needed
6. **Documentation**: Add comments for complex logic

## Docker

The web application can also be run inside a Docker container.

### Development

To start the development server with Docker:

```bash
docker-compose -f docker-compose.dev.yml up --build web
```

### Production

To build and run the application in production:

```bash
docker-compose up --build web
```

## Environment Variables

Create a `.env.local` file with:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Database
DATABASE_URL=

# API
NEXT_PUBLIC_API_URL=
```

## Contributing

1. Follow the component organization guidelines
2. Write TypeScript with proper types
3. Use Tailwind CSS for styling
4. Add tests for new features
5. Document complex logic
6. Keep changes focused and minimal

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [React Query Documentation](https://tanstack.com/query/latest)


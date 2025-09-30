# Architecture Documentation

## Overview

Quantize Web is a modern Next.js 15 application using the App Router, TypeScript, and a feature-based architecture for scalability and maintainability.

## Tech Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 18**: UI library with concurrent features
- **TypeScript 5.6**: Type-safe development

### Styling & UI
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Shadcn UI**: Accessible component library
- **Radix UI**: Headless UI primitives
- **Framer Motion**: Animation library

### State Management
- **React Query (TanStack)**: Server state management
- **Zustand**: Client state management
- **React Context**: App-wide state (auth, theme, etc.)

### Backend & Services
- **Firebase Auth**: User authentication
- **Drizzle ORM**: Type-safe database ORM
- **Neon (PostgreSQL)**: Serverless Postgres database

## Directory Structure

```
packages/web/
├── app/                      # Next.js App Router
│   ├── (routes)/            # Route pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # App providers
│   ├── globals.css          # Global styles
│   └── styles/              # Additional stylesheets
│
├── components/              # React components
│   ├── features/           # Feature-specific components
│   │   ├── search/        # Search functionality
│   │   ├── products/      # Product/tool display
│   │   ├── favorites/     # Favorites management
│   │   ├── conversations/ # Chat features
│   │   └── onboarding/    # User onboarding
│   ├── layout/            # Page layout components
│   ├── shared/            # Shared/reusable components
│   │   └── branding/      # Brand assets (logos)
│   └── ui/                # UI primitives (Shadcn/Radix)
│
├── contexts/              # React Context providers
│   ├── loading-context.tsx
│   ├── firebase-auth-context.tsx
│   ├── favorites-context.tsx
│   └── conversation-context.tsx
│
├── hooks/                 # Custom React hooks
│   ├── use-location.ts   # Navigation hooks
│   ├── use-navigation.tsx # Loading transitions
│   ├── use-mobile.tsx     # Responsive detection
│   ├── use-toast.ts       # Toast notifications
│   └── ...
│
├── lib/                   # Utilities and helpers
│   ├── api/              # API client
│   │   ├── client.ts     # HTTP client
│   │   ├── endpoints.ts  # Endpoint definitions
│   │   └── index.ts      # Barrel export
│   ├── server/           # Server-side utilities
│   │   ├── db.ts         # Database client
│   │   └── storage.ts    # Storage utilities
│   ├── design-tokens.ts  # Design system tokens
│   ├── utils.ts          # General utilities
│   └── ...
│
├── services/              # Business logic
│   ├── firebase-storage.ts
│   ├── firebase-user-service.ts
│   └── products.ts
│
├── types/                 # TypeScript definitions
│   └── index.ts
│
├── shared/                # Shared schemas (monorepo)
│   └── schema.ts
│
└── public/                # Static assets
    └── ...
```

## Architecture Patterns

### Feature-Based Organization

Components are organized by feature for better scalability:

```
components/features/
├── search/           # All search-related components
│   ├── search-interface.tsx
│   ├── logged-in-search-interface.tsx
│   └── index.ts     # Barrel export
├── products/         # Product/tool components
│   ├── tool-card.tsx
│   ├── product-cards.tsx
│   └── index.ts
└── ...
```

Benefits:
- Easy to find related components
- Clear separation of concerns
- Simple to add new features
- Better code organization

### Barrel Exports

Each feature directory has an `index.ts` that exports all components:

```tsx
// components/features/search/index.ts
export { SearchInterface } from './search-interface';
export { LoggedInSearchInterface } from './logged-in-search-interface';

// Usage
import { SearchInterface } from '@/components/features/search';
```

Benefits:
- Cleaner imports
- Encapsulation of internal structure
- Easy refactoring

### API Client Pattern

Centralized API client with type safety:

```tsx
// lib/api/client.ts - HTTP client
export async function apiClient<T>(endpoint: string, config?: ApiRequestConfig): Promise<T>

// lib/api/endpoints.ts - Endpoint definitions
export const endpoints = {
  tools: {
    list: () => '/api/tools',
    get: (id: string) => `/api/tools/${id}`,
    // ...
  }
}

// Usage
import { api, endpoints } from '@/lib/api';
const tools = await api.get(endpoints.tools.list());
```

Benefits:
- Type-safe API calls
- Centralized endpoint management
- Consistent error handling
- Easy to mock for testing

### State Management Strategy

#### Server State (React Query)
For data fetched from APIs:

```tsx
import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';

const { data, isLoading } = useQuery({
  queryKey: ['tools'],
  queryFn: () => api.get(endpoints.tools.list())
});
```

#### Client State (Zustand)
For UI state that needs to be shared:

```tsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));
```

#### Context (React Context)
For app-wide state like auth and theme:

```tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Design System

#### Design Tokens
Centralized design values in `lib/design-tokens.ts`:

```tsx
export const designTokens = {
  spacing: { xs: '0.5rem', sm: '0.75rem', ... },
  radius: { sm: '0.25rem', md: '0.5rem', ... },
  fontSize: { xs: '0.75rem', sm: '0.875rem', ... },
  // ...
};
```

#### Utility Classes
Common patterns in `app/styles/utilities.css`:

```css
.glass-card { @apply bg-white/5 backdrop-blur-md border border-white/10; }
.gradient-text-purple { @apply bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent; }
.hover-lift { @apply transition-transform duration-200 hover:-translate-y-1; }
```

#### CSS Variables
Theme colors in `app/globals.css`:

```css
:root {
  --background: hsl(0 0% 8%);
  --foreground: hsl(220 20% 95%);
  --primary: hsl(270 100% 70%);
  /* ... */
}
```

## Component Patterns

### Component Structure

```tsx
/**
 * Component Overview
 * Brief description of what this component does
 * 
 * @param {Props} props - Component props
 */

// Imports organized by category
import { useState } from 'react';              // React
import { useQuery } from '@tanstack/react-query'; // Libraries
import { Button } from '@/components/ui/button';  // Components
import { api } from '@/lib/api';               // Utilities

// Types
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

// Component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    setState(true);
    onAction?.();
  };
  
  // Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

### Hook Pattern

```tsx
/**
 * useMyHook
 * 
 * Description of what the hook does
 * 
 * @param {string} param - Parameter description
 * @returns {Object} Return value description
 * 
 * @example
 * const { value, update } = useMyHook('initial');
 */
export function useMyHook(param: string) {
  const [value, setValue] = useState(param);
  
  const update = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);
  
  return { value, update };
}
```

## Data Flow

### Client → API → Server

```
User Interaction
    ↓
Component Event Handler
    ↓
API Client (lib/api/client.ts)
    ↓
Next.js API Route (app/api/*/route.ts)
    ↓
Service Layer (services/)
    ↓
Database (via Drizzle ORM)
    ↓
Response back through stack
    ↓
React Query Cache
    ↓
Component Re-render
```

### Authentication Flow

```
User Login
    ↓
Firebase Auth
    ↓
Firebase Auth Context
    ↓
Protected Components/Routes
    ↓
API Calls with Auth Header
```

## Performance Optimizations

### Code Splitting
- Automatic route-based splitting via Next.js App Router
- Dynamic imports for heavy components

### Caching
- React Query for server state caching
- SWR-like behavior with stale-while-revalidate

### Images
- Next.js Image component for optimization
- Lazy loading with intersection observer

### Animations
- CSS transforms for better performance
- Framer Motion for complex animations

## Best Practices

### TypeScript
- Use strict mode
- Define types for all props and return values
- Avoid `any` type
- Use `interface` for public APIs

### Components
- Single Responsibility Principle
- Composition over inheritance
- Keep components small and focused
- Use TypeScript for type safety

### State Management
- Keep state close to where it's used
- Lift state only when necessary
- Use React Query for server state
- Use Context sparingly (performance)

### Styling
- Use Tailwind utility classes
- Leverage design tokens for consistency
- Use CSS variables for theming
- Keep inline styles minimal

### Testing
- Unit tests for business logic
- Integration tests for features
- E2E tests for critical flows

## Security

### Authentication
- Firebase Auth for user management
- JWT tokens for API authentication
- Protected routes and API endpoints

### Input Validation
- Zod schemas for validation
- Server-side validation in API routes
- Client-side validation for UX

### Environment Variables
- Stored in `.env.local`
- Never committed to version control
- Validated on server startup

## Deployment

### Build Process
```bash
pnpm build  # Creates optimized production build
```

### Environment
- Development: `pnpm dev`
- Production: `pnpm build && pnpm start`
- Docker: `docker-compose up --build`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)

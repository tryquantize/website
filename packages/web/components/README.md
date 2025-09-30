# Components Directory

This directory contains all React components for the Quantize web application, organized by their purpose and scope.

## Directory Structure

```
components/
├── features/        # Feature-specific components
│   ├── search/      # Search functionality
│   ├── favorites/   # Favorites management
│   ├── conversations/ # Chat/conversation features
│   ├── products/    # Product/tool display
│   └── onboarding/  # User onboarding flow
├── layout/          # Page layout components
├── shared/          # Shared components
│   └── branding/    # Logo and branding assets
└── ui/              # UI primitives (Shadcn/Radix)
```

## Component Categories

### Features (`features/`)
Feature-specific components that implement business logic and user flows.

- **search/**: Search interface, search suggestions, and search results
- **favorites/**: Favorite items display and management
- **conversations/**: Chat interface, conversation history, and sidebar
- **products/**: Product cards, tool displays, company/freelancer cards
- **onboarding/**: User onboarding forms and flows

Each feature directory contains:
- Component files (`.tsx`)
- Barrel export (`index.ts`) for clean imports

**Usage Example:**
```tsx
import { SearchInterface } from '@/components/features/search';
import { ToolCard } from '@/components/features/products';
```

### Layout (`layout/`)
Components that define the overall page structure.

- **header.tsx**: Main navigation header with theme toggle
- **footer.tsx**: Page footer with links and info
- **animated-layout.tsx**: Layout wrapper with animations

**Usage Example:**
```tsx
import { Header } from '@/components/layout/header';
```

### Shared (`shared/`)
Reusable components used across multiple features.

- **page-layout.tsx**: Main page wrapper with header/footer
- **theme-provider.tsx**: Theme management (dark/light mode)
- **loading-transition.tsx**: Page loading transitions
- **background-particles.tsx**: Animated background effects
- **branding/**: Logo components and brand assets

**Usage Example:**
```tsx
import { PageLayout, useTheme } from '@/components/shared';
import { QuantizeLogo } from '@/components/shared/branding';
```

### UI (`ui/`)
Low-level UI primitives based on Shadcn UI and Radix UI.

These are reusable, accessible components with consistent styling:
- Form controls (Button, Input, Select, etc.)
- Overlays (Dialog, Popover, Tooltip, etc.)
- Data display (Card, Table, Badge, etc.)
- Layout (Separator, Tabs, Accordion, etc.)

**Usage Example:**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
```

## Adding New Components

### 1. Determine the category
- **Feature-specific?** → `features/[feature-name]/`
- **Layout element?** → `layout/`
- **Shared utility?** → `shared/`
- **UI primitive?** → `ui/`

### 2. Create the component file
```tsx
/* File Overview
  Path: components/features/[feature]/[component].tsx
  Purpose: Brief description of what this component does

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports
  - Follow the data flow via function parameters and return values
*/

import { ComponentProps } from 'react';

export function MyComponent({ }: ComponentProps) {
  // Component implementation
}
```

### 3. Add to barrel export
Update or create `index.ts` in the feature directory:
```tsx
export { MyComponent } from './my-component';
```

## File Naming Conventions

- **Component files**: `kebab-case.tsx` (e.g., `search-interface.tsx`)
- **Barrel exports**: `index.ts`
- **Test files**: `[component].test.tsx`

## Import Conventions

Always use barrel exports for cleaner imports:

✅ **Good:**
```tsx
import { SearchInterface } from '@/components/features/search';
import { Button, Card } from '@/components/ui/button';
```

❌ **Avoid:**
```tsx
import { SearchInterface } from '@/components/features/search/search-interface';
```

## TypeScript Guidelines

- Export component props as interfaces
- Use descriptive names for props
- Document complex props with JSDoc comments
- Leverage TypeScript for better DX

```tsx
interface MyComponentProps {
  /** The title to display in the header */
  title: string;
  /** Optional callback when item is clicked */
  onItemClick?: (id: string) => void;
}

export function MyComponent({ title, onItemClick }: MyComponentProps) {
  // ...
}
```

## Styling Conventions

- Use Tailwind CSS classes for styling
- Leverage `cn()` utility for conditional classes
- Use CSS variables for theming (defined in `globals.css`)
- Keep inline styles minimal

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)}>
  {children}
</div>
```

## Best Practices

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Build complex components from simple ones
3. **Performance**: Use React.memo() for expensive components
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Documentation**: Add file overview comments to all components
6. **Testing**: Write tests for business logic and user interactions

## Getting Help

- Check existing components for patterns and examples
- Review the [Shadcn UI docs](https://ui.shadcn.com/) for UI components
- See `lib/design-tokens.ts` for spacing, colors, and other design values
- Refer to the main README for project setup and architecture

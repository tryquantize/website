# Migration Guide

This document helps developers migrate from the old component structure to the new feature-based organization.

## Overview of Changes

The `packages/web` directory has been refactored for better scalability and maintainability:

1. **Component Organization**: Moved from flat structure to feature-based
2. **Design System**: Added centralized design tokens and utilities
3. **API Client**: Created unified API client structure
4. **Documentation**: Added comprehensive READMEs and JSDoc comments

## Component Import Changes

### Old Structure (Before)
```
components/
├── search-interface.tsx
├── tool-card.tsx
├── quantize-logo.tsx
├── theme-provider.tsx
└── ui/
```

### New Structure (After)
```
components/
├── features/
│   ├── search/
│   ├── products/
│   ├── favorites/
│   └── ...
├── shared/
│   └── branding/
├── layout/
└── ui/
```

## Import Path Updates

### Search Components
```tsx
// Old
import { SearchInterface } from '@/components/search-interface';

// New
import { SearchInterface } from '@/components/features/search';
```

### Product/Tool Components
```tsx
// Old
import { ToolCard } from '@/components/tool-card';
import { ProductCards } from '@/components/product-cards';

// New
import { ToolCard, ProductCards } from '@/components/features/products';
```

### Branding Components
```tsx
// Old
import { QuantizeLogo } from '@/components/quantize-logo';
import { UserLogo } from '@/components/user-logo';

// New
import { QuantizeLogo, UserLogo } from '@/components/shared/branding';
// or
import { QuantizeLogo } from '@/components/shared';
```

### Shared Components
```tsx
// Old
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import PageLayout from '@/components/page-layout';

// New
import { ThemeProvider, useTheme, PageLayout } from '@/components/shared';
```

### Favorites Components
```tsx
// Old
import { FavoritesCard } from '@/components/favorites-card';

// New
import { FavoritesCard } from '@/components/features/favorites';
```

### Conversation Components
```tsx
// Old
import { ConversationSidebar } from '@/components/conversation-sidebar';

// New
import { ConversationSidebar } from '@/components/features/conversations';
```

### Onboarding Components
```tsx
// Old
import { OnboardingForm } from '@/components/onboarding-form';

// New
import { OnboardingForm } from '@/components/features/onboarding';
```

## New Utilities Available

### Design Tokens
```tsx
import { designTokens } from '@/lib/design-tokens';

// Use in components
const styles = {
  padding: designTokens.spacing.lg,
  borderRadius: designTokens.radius.lg,
  fontSize: designTokens.fontSize.xl,
};
```

### Utility Classes
```tsx
// Glassmorphism effects
<div className="glass-card glass-card-hover">
  Content
</div>

// Gradient text
<h1 className="gradient-text-purple">
  Title
</h1>

// Animations
<div className="animate-fade-in hover-lift">
  Animated content
</div>

// Focus states
<button className="focus-ring">
  Accessible button
</button>
```

## New API Client

### Old Way
```tsx
import { apiRequest } from '@/lib/queryClient';

const data = await apiRequest('GET', '/api/tools');
```

### New Way
```tsx
import { api, endpoints } from '@/lib/api';

// Simple GET request
const tools = await api.get(endpoints.tools.list());

// POST request
const newTool = await api.post(endpoints.tools.create(), {
  name: 'My Tool',
  description: 'Description'
});

// With query parameters
const filtered = await api.get(endpoints.tools.list(), {
  category: 'ai',
  limit: 10
});
```

### Error Handling
```tsx
import { api, ApiError } from '@/lib/api';

try {
  const data = await api.get('/api/tools');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.status}: ${error.message}`);
    console.error(error.data); // Additional error details
  }
}
```

## Hook Documentation

All custom hooks now have JSDoc comments with examples:

```tsx
import { useNavigation } from '@/hooks/use-navigation';

/**
 * Navigate with loading transition
 */
const { navigateWithLoading } = useNavigation();
navigateWithLoading('/dashboard');
```

See `hooks/README.md` for detailed documentation on all available hooks.

## Component Documentation

Each component directory now has a README explaining:
- Purpose and usage
- Available components
- Import patterns
- Best practices

See `components/README.md` for the full guide.

## Migration Checklist

When updating your code:

- [ ] Update component imports to use new paths
- [ ] Use barrel exports (index.ts) for cleaner imports
- [ ] Consider using new utility classes for common patterns
- [ ] Use the new API client for API calls
- [ ] Add JSDoc comments to new hooks and components
- [ ] Follow the documented file structure and naming conventions

## Breaking Changes

**None!** All changes are backwards compatible through barrel exports. The old import paths will continue to work, but using the new structure is recommended for consistency.

## Need Help?

- Check `components/README.md` for component organization
- Check `hooks/README.md` for custom hook patterns
- Review the updated main README for architecture overview
- Look at existing code for examples of the new patterns

## Benefits of New Structure

1. **Better Organization**: Features are grouped together
2. **Easier Navigation**: Clear separation of concerns
3. **Improved Scalability**: Easy to add new features
4. **Better DX**: Comprehensive documentation and types
5. **Cleaner Imports**: Barrel exports reduce import clutter
6. **Consistent Patterns**: Standardized utilities and tokens

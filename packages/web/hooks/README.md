# Custom Hooks

This directory contains custom React hooks that encapsulate reusable logic across the application.

## Available Hooks

### Navigation & Routing

#### `use-location.ts`
Compatibility hooks for Next.js navigation with a wouter-like API.

```tsx
import { useLocation, useRoute } from '@/hooks/use-location';

// Get current location and navigate
const [location, setLocation] = useLocation();
setLocation('/dashboard');

// Match against a route pattern
const [match, params] = useRoute('/dashboard');
```

#### `use-navigation.tsx`
Navigation with loading transitions between pages.

```tsx
import { useNavigation } from '@/hooks/use-navigation';

const { navigateWithLoading, location } = useNavigation();

// Navigate with 2-second loading screen
navigateWithLoading('/dashboard');
```

### UI & Interactions

#### `use-mobile.tsx`
Detect mobile viewport for responsive behavior.

```tsx
import { useIsMobile } from '@/hooks/use-mobile';

const isMobile = useIsMobile();

if (isMobile) {
  // Render mobile-specific UI
}
```

#### `use-toast.ts`
Toast notification system based on Shadcn UI.

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success!",
  description: "Your changes have been saved.",
});
```

#### `use-scroll-animation.ts`
Scroll-based animation triggers.

```tsx
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const { ref, isInView } = useScrollAnimation();

<div ref={ref}>
  {isInView && <AnimatedContent />}
</div>
```

#### `use-mist-scroll.ts`
Mist/fade effect on scroll for background elements.

```tsx
import { useMistScroll } from '@/hooks/use-mist-scroll';

const opacity = useMistScroll();
// Returns opacity value based on scroll position
```

### Input & Features

#### `use-voice-input.ts`
Voice-to-text input using Web Speech API.

```tsx
import { useVoiceInput } from '@/hooks/use-voice-input';

const {
  isListening,
  transcript,
  startListening,
  stopListening,
  isSupported
} = useVoiceInput();

if (isSupported) {
  <button onClick={startListening}>
    {isListening ? 'Listening...' : 'Start Voice Input'}
  </button>
}
```

## Creating New Hooks

### File Naming
- Use `use-` prefix for all custom hooks
- Use kebab-case: `use-my-hook.ts` or `use-my-hook.tsx`

### Documentation Template

```tsx
/**
 * Hook Name
 * 
 * Brief description of what the hook does and when to use it.
 * 
 * @module hooks/use-my-hook
 */

/**
 * useMyHook
 * 
 * Detailed description of the hook's functionality.
 * 
 * @param {Type} param - Description of parameter
 * @returns {ReturnType} Description of return value
 * 
 * @example
 * const value = useMyHook();
 * // Example usage
 */
export function useMyHook(param: Type): ReturnType {
  // Implementation
}
```

### Best Practices

1. **Single Responsibility**: Each hook should do one thing well
2. **Reusability**: Make hooks generic and configurable
3. **Type Safety**: Always provide TypeScript types
4. **Documentation**: Include JSDoc comments with examples
5. **Dependencies**: List all dependencies in the dependency array
6. **Error Handling**: Handle edge cases and errors gracefully
7. **Performance**: Use useMemo/useCallback when appropriate

### Example Hook Structure

```tsx
import { useState, useEffect, useCallback } from 'react';

/**
 * useExample Hook
 * 
 * Example hook showing best practices
 * 
 * @param {string} initialValue - Initial state value
 * @returns {Object} Hook utilities
 */
export function useExample(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  // Memoized callback
  const updateValue = useCallback((newValue: string) => {
    setLoading(true);
    setValue(newValue);
    setLoading(false);
  }, []);
  
  // Side effects
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      // Cleanup code
    };
  }, [value]);
  
  return {
    value,
    loading,
    updateValue,
  };
}
```

## Testing Hooks

Use `@testing-library/react-hooks` for testing custom hooks:

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useExample } from './use-example';

describe('useExample', () => {
  it('should update value', () => {
    const { result } = renderHook(() => useExample('initial'));
    
    act(() => {
      result.current.updateValue('updated');
    });
    
    expect(result.current.value).toBe('updated');
  });
});
```

## Common Patterns

### State Management Hook
```tsx
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}
```

### API Hook
```tsx
export function useFetchData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  
  return { data, loading, error };
}
```

### Event Listener Hook
```tsx
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void
) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler]);
}
```

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [usehooks.com](https://usehooks.com/) - Collection of React hooks
- [React Use](https://github.com/streamich/react-use) - Large collection of hooks

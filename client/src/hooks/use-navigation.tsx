/* File Overview
  Path: client/src/hooks/use-navigation.tsx
  Purpose: Custom React hook encapsulating reusable logic.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { useLocation } from 'wouter';
import { useLoading } from '@/contexts/loading-context';

const getPageName = (path: string): string => {
  if (path === '/') return 'Home';

  if (path === '/auth' || path === '/auth/register') return 'Get Started';
  if (path === '/waitlist') return 'Waitlist';
  if (path === '/dashboard') return 'Dashboard';
  if (path === '/admin') return 'Admin';
  if (path === '/onboarding') return 'Onboarding';
  if (path.startsWith('/results')) return 'Results';
  return 'Page';
};

export function useNavigation() {
  const [location, setLocation] = useLocation();
  const { startLoading, stopLoading } = useLoading();

  const navigateWithLoading = (to: string) => {
    const fromPage = getPageName(location);
    const toPage = getPageName(to);
    
    startLoading(fromPage, toPage);
    
    setTimeout(() => {
      setLocation(to);
      stopLoading();
    }, 2000);
  };

  return { navigateWithLoading, location };
}
/**
 * Navigation Hook
 * 
 * Custom hook that provides navigation with loading transitions.
 * Displays a loading screen between page transitions for better UX.
 * 
 * @module hooks/use-navigation
 */

import { useLocation } from "@/hooks/use-location";
import { useLoading } from '@/contexts/loading-context';

/**
 * Maps route paths to user-friendly page names for loading screen display
 * 
 * @param {string} path - The route path to map
 * @returns {string} User-friendly page name
 */
const getPageName = (path: string): string => {
  if (path === '/') return 'Home';
  if (path === '/list') return 'Discovery';
  if (path === '/auth' || path === '/auth/register') return 'Get Started';
  if (path === '/waitlist') return 'Waitlist';
  if (path === '/dashboard') return 'Dashboard';
  if (path === '/admin') return 'Admin';
  if (path === '/onboarding') return 'Onboarding';
  if (path.startsWith('/results')) return 'Results';
  return 'Page';
};

/**
 * useNavigation Hook
 * 
 * Provides navigation with animated loading transitions between pages.
 * Shows a loading screen with page names for 2 seconds during transitions.
 * 
 * @returns {Object} Navigation utilities
 * @property {Function} navigateWithLoading - Navigate to a path with loading transition
 * @property {string} location - Current route location
 * 
 * @example
 * const { navigateWithLoading, location } = useNavigation();
 * 
 * // Navigate with loading screen
 * navigateWithLoading('/dashboard');
 * 
 * // Check current location
 * if (location === '/dashboard') {
 *   // On dashboard page
 * }
 */
export function useNavigation() {
  const [location, setLocation] = useLocation();
  const { startLoading, stopLoading } = useLoading();

  /**
   * Navigate to a new page with a loading transition
   * 
   * @param {string} to - The path to navigate to
   */
  const navigateWithLoading = (to: string) => {
    const fromPage = getPageName(location);
    const toPage = getPageName(to);
    
    // Start loading transition with page names
    startLoading(fromPage, toPage);
    
    // Navigate after 2 second delay for loading animation
    setTimeout(() => {
      setLocation(to);
      stopLoading();
    }, 2000);
  };

  return { navigateWithLoading, location };
}

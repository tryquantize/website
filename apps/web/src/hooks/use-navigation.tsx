import { useLocation } from 'wouter';
import { useLoading } from '@/contexts/loading-context';
import { useEffect } from 'react';

const getPageName = (path: string): string => {
  if (path === '/') return 'Home';

  if (path === '/auth' || path === '/auth/register') return 'Get Started';

  if (path === '/dashboard') return 'Dashboard';
  if (path === '/admin') return 'Admin';
  if (path === '/onboarding') return 'Onboarding';
  if (path.startsWith('/results')) return 'Results';
  return 'Page';
};

export function useNavigation() {
  const [location, setLocation] = useLocation();
  const { startLoading, stopLoading } = useLoading();

  // Scroll to top whenever location changes
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  const navigateWithLoading = (to: string) => {
    const fromPage = getPageName(location);
    const toPage = getPageName(to);

    startLoading(fromPage, toPage);

    setTimeout(() => {
      setLocation(to);
      stopLoading();
    }, 2000);
  };

  const navigateInstant = (to: string) => {
    setLocation(to);
  };

  return { navigateWithLoading, navigateInstant, location };
}
import { useLocation } from 'wouter';
import { useLoading } from '@/contexts/loading-context';

const getPageName = (path: string): string => {
  if (path === '/') return 'Home';
  if (path === '/list') return 'Discovery';
  if (path === '/auth' || path === '/auth/register') return 'Get Started';
  if (path === '/waitlist') return 'Waitlist';
  if (path === '/dashboard') return 'Dashboard';
  if (path === '/admin') return 'Admin';
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
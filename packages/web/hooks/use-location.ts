"use client";

/**
 * Location Hooks
 * 
 * Compatibility hooks that provide a wouter-like API for Next.js navigation.
 * These hooks abstract Next.js App Router navigation for easier migration and testing.
 */

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

/**
 * useLocation Hook
 * 
 * A compatibility hook that mimics wouter's useLocation API using Next.js router.
 * Returns the current pathname and a function to navigate to a new path.
 * 
 * @returns {[string, (path: string) => void]} Tuple of [pathname, setLocation]
 * 
 * @example
 * const [location, setLocation] = useLocation();
 * console.log(location); // "/dashboard"
 * setLocation("/settings"); // Navigate to /settings
 */
export function useLocation(): [string, (path: string) => void] {
  const pathname = usePathname();
  const router = useRouter();
  
  const setLocation = (path: string) => {
    router.push(path);
  };
  
  return [pathname, setLocation];
}

/**
 * useRoute Hook
 * 
 * A compatibility hook that mimics wouter's useRoute for pattern matching.
 * Currently provides simple exact matching - can be enhanced for path patterns.
 * 
 * @param {string} pattern - The route pattern to match against
 * @returns {[boolean, Record<string, string>]} Tuple of [match, params]
 * 
 * @example
 * const [match, params] = useRoute("/dashboard");
 * if (match) {
 *   // Current route is /dashboard
 * }
 */
export function useRoute(pattern: string): [boolean, Record<string, string>] {
  const pathname = usePathname();
  
  // Simple pattern matching (you can enhance this for dynamic routes)
  const match = pathname === pattern;
  
  return [match, {}];
}

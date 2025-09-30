"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

// Compatibility hook to replace wouter's useLocation
export function useLocation(): [string, (path: string) => void] {
  const pathname = usePathname();
  const router = useRouter();
  
  const setLocation = (path: string) => {
    router.push(path);
  };
  
  return [pathname, setLocation];
}

// Compatibility hook to replace wouter's useRoute
export function useRoute(pattern: string): [boolean, Record<string, string>] {
  const pathname = usePathname();
  
  // Simple pattern matching (you can enhance this)
  const match = pathname === pattern;
  
  return [match, {}];
}


/* File Overview
  Path: client/src/lib/utils.ts
  Purpose: Small helper utilities and app-specific libraries (auth, queryClient, general utils).

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

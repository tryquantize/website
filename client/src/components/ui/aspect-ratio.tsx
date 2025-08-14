/* File Overview
  Path: client/src/components/ui/aspect-ratio.tsx
  Purpose: Reusable UI primitives (largely Shadcn + Radix wrappers) with Tailwind styling.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }

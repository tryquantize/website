'use client'

import { SpiralAnimation } from "@/components/ui/spiral-animation"

export function SpiralBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black -z-10">
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>
    </div>
  )
}
'use client'

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react'

const SpiralDemo = () => {
  const [startVisible, setStartVisible] = useState(false)
  
  // Handle navigation to home page
  const navigateToHomePage = () => {
    window.location.href = "https://quantize.site/home"
  }
  
  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* Spiral Animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>
      
      {/* Welcome Text and Enter Button */}
      <div 
        className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-1500 ease-out text-center
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <h1 className="text-white text-4xl sm:text-6xl md:text-8xl lg:text-12xl font-bold mb-8 tracking-wide" style={{ fontFamily: 'Instrument Serif, serif' }}>
          Welcome to Quantize
        </h1>
        <Button 
          onClick={navigateToHomePage}
          className="
            text-black text-sm tracking-[0.2em] uppercase font-extralight
            px-4 py-2 bg-white border border-white rounded-lg
            transition-all duration-700
            hover:tracking-[0.3em] hover:bg-white/90
          "
        >
          Enter
        </Button>
      </div>
    </div>
  )
}

export {SpiralDemo}
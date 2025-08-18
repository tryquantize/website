import { Variants, Transition } from 'framer-motion'

/**
 * GLOBAL ANIMATION CONSTANTS
 * Consistent timing and easing across the entire application
 */

export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  slower: 0.6
} as const

export const EASING = {
  spring: { type: "spring", stiffness: 300, damping: 30 },
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.4, 0, 0.2, 1],
  bounce: { type: "spring", stiffness: 400, damping: 10 }
} as const

/**
 * PAGE TRANSITION VARIANTS
 */
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASING.smooth,
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: 'blur(4px)',
    transition: { 
      duration: ANIMATION_DURATION.fast,
      ease: EASING.snappy
    }
  }
}

/**
 * STAGGER CONTAINER
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

/**
 * FADE IN UP ANIMATION
 */
export const fadeInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: EASING.spring
  }
}

/**
 * SCALE ON HOVER
 */
export const scaleOnHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: ANIMATION_DURATION.fast,
      ease: EASING.snappy
    }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}
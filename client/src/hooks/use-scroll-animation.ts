import { useInView } from 'react-intersection-observer'
import { useAnimation } from 'framer-motion'
import { useEffect } from 'react'

/**
 * SCROLL-TRIGGERED ANIMATION HOOK
 * Automatically triggers animations when elements enter viewport
 */

export function useScrollAnimation(threshold = 0.1, triggerOnce = true) {
  const controls = useAnimation()
  const { ref, inView } = useInView({
    threshold,
    triggerOnce
  })

  useEffect(() => {
    if (inView) {
      controls.start('animate')
    } else if (!triggerOnce) {
      controls.start('initial')
    }
  }, [inView, controls, triggerOnce])

  return { ref, controls, inView }
}
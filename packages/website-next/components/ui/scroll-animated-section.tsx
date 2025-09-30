import { motion } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface ScrollAnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function ScrollAnimatedSection({ 
  children, 
  className = '',
  delay = 0
}: ScrollAnimatedSectionProps) {
  const { ref, controls } = useScrollAnimation()

  const variants = {
    initial: {
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.section
      ref={ref}
      variants={variants}
      initial="initial"
      animate={controls}
      className={className}
    >
      {children}
    </motion.section>
  )
}
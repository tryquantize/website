import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'
import { forwardRef } from 'react'

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'glow'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  icon?: React.ReactNode
  glowColor?: string
  interactive?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    icon,
    glowColor = '#3b82f6',
    interactive = false,
    className = '',
    ...props 
  }, ref) => {
    
    const variants = {
      primary: `
        bg-gradient-to-r from-blue-600 to-blue-500 
        text-white font-semibold
        shadow-lg shadow-blue-500/25
        border border-blue-500/50
        hover:shadow-xl hover:shadow-blue-500/40
        hover:from-blue-500 hover:to-blue-400
        active:from-blue-700 active:to-blue-600
      `,
      
      secondary: `
        bg-white/10 backdrop-blur-sm
        text-white font-medium
        border border-white/20
        shadow-lg shadow-black/20
        hover:bg-white/20 hover:border-white/30
        active:bg-white/5
      `,
      
      ghost: `
        bg-transparent text-white/80
        border border-transparent
        hover:bg-white/5 hover:text-white
        active:bg-white/10
      `,
      
      gradient: `
        bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600
        text-white font-semibold
        shadow-lg shadow-purple-500/25
        hover:shadow-xl hover:shadow-purple-500/40
        bg-size-200 bg-pos-0 hover:bg-pos-100
        transition-all duration-500
      `,
      
      glow: `
        bg-black/50 text-white font-semibold
        border border-white/20
        shadow-lg
        hover:shadow-xl
        hover:border-blue-400/40
        relative overflow-hidden
      `
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-lg',
      md: 'px-6 py-3 text-base rounded-xl',
      lg: 'px-8 py-4 text-lg rounded-xl',
      xl: 'px-10 py-5 text-xl rounded-2xl'
    }

    const buttonVariants = {
      rest: { 
        scale: 1,
        rotateX: 0,
        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`
      },
      hover: { 
        scale: 1.02,
        rotateX: -2,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2)`,
        transition: { 
          duration: 0.2,
          ease: [0.4, 0, 0.2, 1]
        }
      },
      tap: { 
        scale: 0.98,
        rotateX: 0,
        transition: { duration: 0.1 }
      },
      loading: {
        scale: 0.95,
        transition: { duration: 0.2 }
      }
    }

    const glowVariants = {
      rest: { opacity: 0, scale: 0.8 },
      hover: { 
        opacity: 1, 
        scale: 1.1,
        transition: { duration: 0.3 }
      }
    }

    return (
      <motion.button
        ref={ref}
        className={`
          ${variants[variant]}
          ${sizes[size]}
          relative overflow-hidden
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          transform-gpu perspective-1000
          ${interactive ? 'group' : ''}
          ${className}
        `}
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        animate={isLoading ? "loading" : "rest"}
        disabled={isLoading}
        {...props}
      >
        
        {variant === 'glow' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            variants={glowVariants}
            style={{
              background: `linear-gradient(90deg, transparent, ${glowColor}20, transparent)`
            }}
          />
        )}

        {interactive ? (
          <>
            <span className="inline-block transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-0">
              {children}
            </span>
            <div className="absolute top-0 z-10 flex h-full w-full translate-x-8 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
              <span>{children}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-white/30 transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-white/20"></div>
          </>
        ) : (
          <div className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : icon ? (
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            ) : null}
            
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {children}
            </motion.span>
          </div>
        )}

        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 4, opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.4 }}
        />
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
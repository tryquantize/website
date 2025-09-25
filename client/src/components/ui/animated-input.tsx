import { motion } from 'framer-motion'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface AnimatedInputProps {
  label: string
  type?: string
  placeholder?: string
  error?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  icon?: React.ReactNode
  className?: string
}

export function AnimatedInput({
  label,
  type = 'text',
  placeholder,
  error,
  value,
  onChange,
  required,
  icon,
  className = ''
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [inputType, setInputType] = useState(type)

  const hasValue = value.length > 0
  const isPassword = type === 'password'

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    setInputType(showPassword ? 'password' : 'text')
  }

  const containerVariants = {
    rest: {
      borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 0 0 0px transparent'
    },
    focused: {
      borderColor: error ? '#ef4444' : '#3b82f6',
      boxShadow: error 
        ? '0 0 0 2px rgba(239, 68, 68, 0.2)' 
        : '0 0 0 2px rgba(59, 130, 246, 0.2)',
      transition: { duration: 0.2 }
    }
  }

  const labelVariants = {
    rest: {
      y: 0,
      scale: 1,
      color: error ? '#ef4444' : '#a1a1aa'
    },
    focused: {
      y: -24,
      scale: 0.85,
      color: error ? '#ef4444' : '#3b82f6',
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    }
  }

  return (
    <div className={`relative ${className}`}>
      
      <motion.div
        className="relative bg-white/5 backdrop-blur-sm border rounded-xl overflow-hidden"
        variants={containerVariants}
        animate={isFocused || hasValue ? 'focused' : 'rest'}
      >
        
        <motion.label
          className="absolute left-4 top-4 pointer-events-none font-medium"
          variants={labelVariants}
          animate={isFocused || hasValue ? 'focused' : 'rest'}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </motion.label>

        <div className="flex items-center">
          
          {icon && (
            <motion.div
              className="absolute left-4 top-4 text-white/40"
              animate={{
                color: isFocused ? '#3b82f6' : '#a1a1aa'
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          <input
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ''}
            className={`
              w-full bg-transparent text-white placeholder-white/40
              outline-none transition-all duration-200
              ${icon ? 'pl-12 pr-4' : 'px-4'}
              ${isPassword ? 'pr-12' : ''}
              ${isFocused || hasValue ? 'pt-8 pb-2' : 'py-4'}
            `}
          />

          {isPassword && (
            <motion.button
              type="button"
              className="absolute right-4 top-4 text-white/40 hover:text-white"
              onClick={togglePasswordVisibility}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          )}
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'center' }}
        />
      </motion.div>

      <motion.div
        className="overflow-hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: error ? 'auto' : 0, 
          opacity: error ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-red-400 text-sm mt-2 px-1">{error}</p>
      </motion.div>
    </div>
  )
}
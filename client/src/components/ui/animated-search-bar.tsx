import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, Sparkles } from 'lucide-react'
import { useState, useRef } from 'react'
import { AnimatedButton } from './animated-button'

interface AnimatedSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  suggestions?: string[]
}

export function AnimatedSearchBar({ 
  onSearch, 
  placeholder = "Describe what you're looking for...",
  suggestions = [
    "AI tools for e-commerce",
    "Customer service chatbots", 
    "Content generation tools",
    "Marketing automation"
  ]
}: AnimatedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const containerVariants = {
    rest: { 
      scale: 1,
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    focused: { 
      scale: 1.02,
      boxShadow: '0 8px 40px rgba(59, 130, 246, 0.3)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  const particleVariants = {
    rest: { opacity: 0, scale: 0 },
    active: { 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className="relative max-w-2xl mx-auto"
      variants={containerVariants}
      initial="rest"
      animate={isFocused ? "focused" : "rest"}
    >
      
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`
            }}
            variants={particleVariants}
            animate={isTyping ? "active" : "rest"}
            transition={{ delay: i * 0.2 }}
          />
        ))}
      </div>

      <div className="relative">
        
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl"
          animate={{
            opacity: isFocused ? 0.6 : 0,
            scale: isFocused ? 1.05 : 0.95
          }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
          
          <div className="flex items-start gap-4 p-5">
            
            <motion.div
              className="flex-shrink-0 mt-1"
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="w-5 h-5 text-white/60" />
            </motion.div>

            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsTyping(e.target.value.length > 0)
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="
                  w-full bg-transparent text-white placeholder-white/40
                  resize-none outline-none text-lg leading-relaxed
                  min-h-[30px] max-h-[120px]
                "
                rows={1}
                style={{ 
                  height: 'auto',
                  minHeight: '30px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${target.scrollHeight}px`
                }}
              />

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex items-center gap-2 mt-2 text-sm text-white/60"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>AI is analyzing your request...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 mt-1">
              
              <motion.button
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Mic className="w-4 h-4" />
              </motion.button>

              <AnimatedButton
                variant="primary"
                size="sm"
                interactive
                onClick={() => query.trim() && onSearch(query)}
                disabled={!query.trim()}
                className="px-4 py-2"
              >
                Search
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-4 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-white/60 text-sm mb-3">Try searching for:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/80 text-sm hover:bg-white/10 hover:border-white/20"
                  onClick={() => {
                    setQuery(suggestion)
                    inputRef.current?.focus()
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ExternalLink, Star, Bookmark } from 'lucide-react'
import { Button } from './button'

interface AnimatedCardProps {
  tool: {
    id: string
    name: string
    description: string
    features: string[]
    pricing: string
    rating: number
    logo?: string
  }
  onClick?: () => void
}

export function AnimatedCard({ tool, onClick }: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const cardVariants = {
    rest: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0,
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    hover: {
      scale: 1.03,
      rotateX: 5,
      rotateY: 5,
      z: 50,
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) / rect.width
    const deltaY = (e.clientY - centerY) / rect.height

    setMousePosition({ x: deltaX * 10, y: deltaY * 10 })
  }

  return (
    <motion.div
      className="group relative perspective-1000 cursor-pointer"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        transform: isHovered 
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)` 
          : 'translate3d(0, 0, 0)'
      }}
    >
      
      <div className="relative h-full bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100"
          animate={{
            background: [
              'linear-gradient(0deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2), rgba(236,72,153,0.2))',
              'linear-gradient(360deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2), rgba(236,72,153,0.2))'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative p-6 h-full flex flex-col">
          
          <div className="flex items-start justify-between mb-4">
            
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white font-bold text-lg">
                  {tool.name.charAt(0)}
                </span>
              </motion.div>
              
              <div>
                <h3 className="text-white font-semibold text-lg">{tool.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white/60 text-sm">{tool.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                className="p-2 bg-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Bookmark className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                className="p-2 bg-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4 line-clamp-2 flex-grow">
            {tool.description}
          </p>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tool.features.slice(0, 3).map((feature, i) => (
                <motion.span
                  key={feature}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-white/40 text-xs">Starting at</span>
              <p className="text-white font-semibold">{tool.pricing}</p>
            </div>

            <Button 
              variant="secondary" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              Learn More
            </Button>
          </div>

          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <motion.div
        className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100"
        animate={isHovered ? {
          scale: [1, 1.2, 1],
          opacity: [0, 1, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from "@/hooks/use-location"

interface AnimatedLayoutProps {
  children: React.ReactNode
}

export function AnimatedLayout({ children }: AnimatedLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
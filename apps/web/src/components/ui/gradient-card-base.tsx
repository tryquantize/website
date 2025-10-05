import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GradientCardBaseProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
  height?: string;
}

export const GradientCardBase = ({ 
  children, 
  className = "", 
  width = "360px", 
  height = "520px" 
}: GradientCardBaseProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 3;
      const rotateY = (x / rect.width) * 3;
      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative rounded-[20px] overflow-hidden ${className}`}
      style={{
        width,
        height,
        transformStyle: "preserve-3d",
        backgroundColor: "#0e131f",
        boxShadow: "0 -10px 60px 5px rgba(78, 99, 255, 0.15), 0 0 10px 0 rgba(0, 0, 0, 0.3)",
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -3 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        perspective: 1000,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(1px)",
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.6,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Dark background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #000000 0%, #0a0a0a 100%)",
        }}
      />

      {/* Purple/blue glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-10"
        style={{
          background: `
            radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.4) -10%, rgba(79, 70, 229, 0) 70%),
            radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.4) -10%, rgba(79, 70, 229, 0) 70%)
          `,
          filter: "blur(30px)",
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.6,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Central purple glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 z-15"
        style={{
          background: `radial-gradient(circle at bottom center, rgba(161, 58, 229, 0.5) -20%, rgba(79, 70, 229, 0) 60%)`,
          filter: "blur(35px)",
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] z-20"
        style={{
          background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
        animate={{
          boxShadow: isHovered
            ? "0 0 15px 2px rgba(172, 92, 255, 0.6), 0 0 25px 4px rgba(138, 58, 185, 0.4)"
            : "0 0 10px 1px rgba(172, 92, 255, 0.4), 0 0 20px 3px rgba(138, 58, 185, 0.3)",
          opacity: isHovered ? 1 : 0.8,
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Content */}
      <motion.div
        className="relative h-full z-40"
        animate={{
          rotateX: isHovered ? -rotation.x * 0.2 : 0,
          rotateY: isHovered ? -rotation.y * 0.2 : 0
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
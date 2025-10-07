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
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
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
      {/* Blurred background */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        animate={{
          backdropFilter: isHovered ? "blur(25px)" : "blur(20px)",
          backgroundColor: isHovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.1)",
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Content */}
      <motion.div
        className="relative h-full z-20"
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
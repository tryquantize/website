import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientCardBaseProps {
  children: ReactNode;
  className?: string;
  width?: string;
  height?: string;
}

export function GradientCardBase({ children, className, width, height }: GradientCardBaseProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90",
        "border border-white/10",
        "backdrop-blur-sm",
        className
      )}
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
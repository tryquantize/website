import { User } from "lucide-react";

interface UserLogoProps {
  size?: number;
}

export function UserLogo({ size = 24 }: UserLogoProps) {
  return (
    <div 
      className="bg-blue-500 rounded-full flex items-center justify-center text-white"
      style={{ width: size, height: size }}
    >
      <User size={size * 0.6} />
    </div>
  );
}
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
    children: React.ReactNode;
    className?: string;
}

export function SectionBadge({ children, className }: SectionBadgeProps) {
    return (
        <div
            className={cn(
                "inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6",
                "shadow-lg shadow-black/10",
                "hover:bg-white/15 hover:border-white/25 transition-all duration-300",
                className
            )}
        >
            {children}
        </div>
    );
}

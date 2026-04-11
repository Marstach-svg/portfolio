import { cn } from "@/lib/utils"

type BadgeProps = {
  children: React.ReactNode
  variant?: "default" | "accent"
  className?: string
}

/** 技術タグ用ピル型バッジ */
export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" &&
          "bg-surface-elevated text-text-secondary border border-border",
        variant === "accent" && "gradient-border text-accent-blue bg-surface",
        className
      )}
    >
      {children}
    </span>
  )
}

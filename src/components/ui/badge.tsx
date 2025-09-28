import * as React from "react";

import { cn } from "../../lib/utils";

export type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[color:var(--primary)]/10 text-[color:var(--primary)]",
  success: "bg-[#e5f7ed] text-[#1f8f4d]",
  warning: "bg-[#fff6da] text-[#b8860b]",
  danger: "bg-[#fde6ea] text-[#d43852]",
  muted: "bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      variantStyles[variant],
      className,
    )}
    {...props}
  />
));

Badge.displayName = "Badge";

export { Badge };

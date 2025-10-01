import * as React from "react";

import { cn } from "../../lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none items-center rounded-[calc(var(--radius)+4px)] border border-[color:var(--border)] bg-[color:var(--card)] px-4 pr-10 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[color:var(--muted-foreground)]">
      ▾
    </span>
  </div>
));

Select.displayName = "Select";

export { Select };

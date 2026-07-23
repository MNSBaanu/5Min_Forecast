import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-border/70 bg-gradient-surface px-6 py-16 text-center shadow-elegant",
        className,
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          {icon}
        </div>
      )}
      <div className="max-w-md space-y-2">
        <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </div>
  );
}
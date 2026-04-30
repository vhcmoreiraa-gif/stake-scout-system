import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: string;
  variant?: "default" | "success" | "danger" | "warning" | "primary" | "accent";
  className?: string;
}

const variantStyles = {
  default: "bg-secondary/40 text-foreground",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
};

export function StatCard({ label, value, icon: Icon, hint, variant = "default", className }: StatCardProps) {
  return (
    <Card className={cn("card-elevated p-5 rounded-xl", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1.5 truncate">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", variantStyles[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

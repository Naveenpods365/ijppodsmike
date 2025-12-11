import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  delay?: number;
}

export const MetricCard = ({ label, value, change, isPositive, delay = 0 }: MetricCardProps) => {
  return (
    <div 
      className="group relative flex items-center gap-4 p-5 bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:border-primary/30 hover-lift overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        isPositive 
          ? "bg-gradient-to-r from-success/5 via-transparent to-success/5"
          : "bg-gradient-to-r from-destructive/5 via-transparent to-destructive/5"
      )} />

      {/* Floating particles effect */}
      <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:-translate-y-1">
        <Sparkles className={cn(
          "h-3 w-3",
          isPositive ? "text-success" : "text-destructive"
        )} />
      </div>

      <div className={cn(
        "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110",
        isPositive ? "bg-success/10" : "bg-destructive/10"
      )}>
        {isPositive ? (
          <TrendingUp className="h-5 w-5 text-success animate-bounce-soft" />
        ) : (
          <TrendingDown className="h-5 w-5 text-destructive" />
        )}
      </div>

      <div className="relative flex-1">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-card-foreground">{value}</span>
          <span className={cn(
            "text-sm font-bold px-2 py-0.5 rounded-md",
            isPositive 
              ? "text-success bg-success/10" 
              : "text-destructive bg-destructive/10"
          )}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
};

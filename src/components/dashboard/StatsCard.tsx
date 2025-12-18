import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatsCardProps {
    title: string;
    value: ReactNode;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    iconColor?: string;
    delay?: number;
}

export const StatsCard = ({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    iconColor = "bg-primary/10 text-primary",
    delay = 0,
}: StatsCardProps) => {
    const displayValue = (() => {
        if (value === null || value === undefined) return "—";
        if (typeof value === "string" || typeof value === "number")
            return String(value);
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (Array.isArray(value)) {
            return (
                value
                    .filter((v) => v !== null && v !== undefined)
                    .map((v) => {
                        if (typeof v === "string" || typeof v === "number")
                            return String(v);
                        try {
                            return JSON.stringify(v);
                        } catch {
                            return "";
                        }
                    })
                    .filter(Boolean)
                    .join(", ") || "—"
            );
        }
        if (typeof value === "object") {
            const v = value as any;
            if (typeof v?.name === "string") return v.name;
            if (typeof v?.derived_category === "string")
                return v.derived_category;
            if (Array.isArray(v?.matched_keywords))
                return v.matched_keywords.join(", ");
            try {
                return JSON.stringify(value);
            } catch {
                return "—";
            }
        }
        return "—";
    })();
    return (
        <div
            className="group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-500 border border-border/50 hover:border-primary/30 hover-lift overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Animated corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" />

            <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground tracking-wide">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-card-foreground animate-count">
                        {displayValue}
                    </p>
                    {change && (
                        <div
                            className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                                changeType === "positive" &&
                                    "bg-success/10 text-success",
                                changeType === "negative" &&
                                    "bg-destructive/10 text-destructive",
                                changeType === "neutral" &&
                                    "bg-muted text-muted-foreground"
                            )}
                        >
                            {changeType === "positive" && (
                                <span className="text-success">↑</span>
                            )}
                            {changeType === "negative" && (
                                <span className="text-destructive">↓</span>
                            )}
                            {change}
                        </div>
                    )}
                </div>
                <div
                    className={cn(
                        "p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                        iconColor
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>
    );
};

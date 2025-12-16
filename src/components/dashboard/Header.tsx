import { Search, Bell, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export const Header = ({
    title = "Dashboard",
    subtitle = "Welcome back! Here's your deals overview.",
}: HeaderProps) => {
    return (
        <header className="h-20 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
            <div className="h-full px-8 flex items-center justify-between">
                {/* Welcome Text */}
                <div className="animate-slide-down">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-foreground">
                            {title}
                        </h1>
                        <div className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            Live
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                </div>

                {/* Search & Actions */}
                <div
                    className="flex items-center gap-4 animate-slide-down"
                    style={{ animationDelay: "100ms" }}
                >
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Search deals..."
                            className="pl-11 w-72 h-11 bg-background border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md hidden md:block">
                            ⌘K
                        </kbd>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-11 w-11 rounded-xl hover:bg-secondary"
                    >
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-accent rounded-full border-2 border-card animate-pulse" />
                    </Button>

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-xl bg-gradient-to-br from-secondary to-muted overflow-hidden group"
                        >
                            <User className="h-5 w-5 text-secondary-foreground group-hover:scale-110 transition-transform" />
                        </Button>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-success rounded-full border-2 border-card" />
                    </div>
                </div>
            </div>
        </header>
    );
};

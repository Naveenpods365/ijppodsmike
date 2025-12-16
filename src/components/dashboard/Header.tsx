import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export const Header = ({
    title = "Dashboard",
    subtitle = "Welcome back! Here's your deals overview.",
}: HeaderProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [notifications, setNotifications] = useState<
        Array<{ id: string; title: string; time: string; unread: boolean }>
    >([
        {
            id: "n1",
            title: "New deals scraped successfully",
            time: "Just now",
            unread: true,
        },
        {
            id: "n2",
            title: "Coupon created and published",
            time: "12m ago",
            unread: true,
        },
        {
            id: "n3",
            title: "Scheduler run completed",
            time: "1h ago",
            unread: false,
        },
    ]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => n.unread).length,
        [notifications]
    );

    const handleGoSettings = () => {
        navigate("/settings");
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

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

                    {/* <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-11 w-11 rounded-xl hover:bg-secondary"
                            >
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                {unreadCount > 0 ? (
                                    <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 bg-gradient-to-r from-accent to-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card shadow-lg animate-pulse">
                                        {unreadCount}
                                    </span>
                                ) : null}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-[360px] p-0 overflow-hidden rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-xl"
                        >
                            <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-foreground">
                                            Notifications
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {unreadCount > 0
                                                ? `${unreadCount} unread`
                                                : "You're all caught up"}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 rounded-xl"
                                        onClick={markAllRead}
                                        disabled={unreadCount === 0}
                                    >
                                        Mark all read
                                    </Button>
                                </div>
                            </div>

                            <div className="max-h-[320px] overflow-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                        No notifications
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/60">
                                        {notifications.map((n) => (
                                            <button
                                                key={n.id}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors group"
                                                onClick={() =>
                                                    setNotifications((prev) =>
                                                        prev.map((it) =>
                                                            it.id === n.id
                                                                ? {
                                                                      ...it,
                                                                      unread: false,
                                                                  }
                                                                : it
                                                        )
                                                    )
                                                }
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1.5">
                                                        <span
                                                            className={
                                                                n.unread
                                                                    ? "h-2.5 w-2.5 rounded-full bg-primary block shadow-sm shadow-primary/30"
                                                                    : "h-2.5 w-2.5 rounded-full bg-muted block"
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                            {n.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            {n.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover> */}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-[260px] p-2 rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-xl"
                        >
                            <div className="px-2 py-2">
                                <div className="text-sm font-bold text-foreground">
                                    {user?.username || "Admin"}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {user?.email || ""}
                                </div>
                            </div>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem
                                className="rounded-xl px-3 py-2 cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
                                onClick={handleGoSettings}
                            >
                                <Settings className="h-4 w-4 mr-2 text-primary" />
                                <span className="font-medium">Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="rounded-xl px-3 py-2 cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive focus:text-destructive"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                <span className="font-medium">Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

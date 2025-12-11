import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  delay?: number;
}

const NavItem = ({ icon, label, to, badge, delay = 0 }: NavItemProps) => {
  const location = useLocation();
  const active = location.pathname === to;
  
  return (
    <NavLink
      to={to}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group animate-slide-up",
        active
          ? "bg-gradient-to-r from-sidebar-primary/20 to-sidebar-accent text-sidebar-primary shadow-lg shadow-sidebar-primary/10"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={cn(
        "transition-transform duration-300",
        active && "animate-bounce-soft"
      )}>
        {icon}
      </span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs px-2.5 py-1 rounded-full font-bold animate-pulse-glow">
          {badge}
        </span>
      )}
      {active && (
        <Sparkles className="ml-auto h-4 w-4 text-sidebar-primary animate-spin-slow" />
      )}
    </NavLink>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 border-r border-sidebar-border flex flex-col relative overflow-hidden sticky top-0">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sidebar-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-40 -left-20 w-60 h-60 bg-sidebar-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
      </div>

      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border relative">
        <div className="relative group">
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative flex flex-col items-center gap-3 p-4 rounded-2xl bg-sidebar-accent/30 border border-sidebar-border/50 hover:border-sidebar-primary/30 transition-all duration-500 hover:shadow-glow-accent">
            <div className="relative animate-float">
              <img 
                src={logo} 
                alt="iJustPaid" 
                className="h-24 w-auto drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" 
              />
              {/* Sparkle decorations */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-sidebar-primary rounded-full animate-pulse" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '500ms' }} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">
                Deal Scraper
              </h2>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">Dashboard v2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-4 mb-3 animate-fade-in">
          Menu
        </p>
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          to="/"
          delay={100}
        />
        <NavItem
          icon={<Calendar size={20} />}
          label="Scheduler"
          to="/scheduler"
          delay={150}
        />
        <NavItem
          icon={<Ticket size={20} />}
          label="Coupons"
          to="/coupons"
          delay={200}
        />
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          to="/settings"
          delay={250}
        />
      </nav>

      {/* Footer with animated card */}
      <div className="p-4 border-t border-sidebar-border relative">
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-sidebar-primary/10 to-accent/10 border border-sidebar-primary/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-sidebar-primary" />
            <span className="text-xs font-semibold text-sidebar-foreground">Pro Tip</span>
          </div>
          <p className="text-xs text-sidebar-foreground/70 leading-relaxed">
            Enable auto-scheduling to never miss a deal!
          </p>
        </div>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1 animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

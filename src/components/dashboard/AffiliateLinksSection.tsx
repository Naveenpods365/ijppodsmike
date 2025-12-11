import { Plus, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AffiliateLinksSection = () => {
  return (
    <div className="group relative bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-accent/10 to-transparent rounded-tl-full opacity-50" />

      <div className="relative flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Affiliate Links</h3>
          <p className="text-sm text-muted-foreground mt-1">Upload links and track performance</p>
        </div>
        <div className="p-2 rounded-xl bg-accent/10">
          <Link2 className="h-5 w-5 text-accent" />
        </div>
      </div>

      <div className="relative flex gap-3 mb-6">
        <Input 
          placeholder="Paste your affiliate link..." 
          className="flex-1 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
        />
        <Button className="h-12 gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 px-6">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      <div className="relative flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/20 hover:border-primary/30 hover:bg-muted/30 transition-all duration-300 group/empty">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500" />
          <div className="relative p-5 bg-gradient-to-br from-secondary to-muted rounded-2xl mb-4 group-hover/empty:scale-110 transition-transform duration-300">
            <Link2 className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">No affiliate links yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Add your first link above to get started!</p>
        
        <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          <span>Earn up to 15% commission</span>
        </div>
      </div>
    </div>
  );
};

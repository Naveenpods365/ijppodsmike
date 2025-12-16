import { ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DealCardProps {
    title: string;
    discount: string;
    category: string;
    retailer: string;
    imageUrl?: string;
    onPreview?: (category: string) => void;
}

export const DealCard = ({
    title,
    discount,
    category,
    retailer,
    onPreview,
}: DealCardProps) => {
    return (
        <div className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-500 border border-border/50 hover:border-primary/30 hover-lift">
            {/* Image placeholder with gradient */}
            <div className="relative h-44 bg-gradient-to-br from-secondary via-muted to-secondary/80 overflow-hidden">
                {/* Animated pattern overlay */}
                <div className="absolute inset-0 decorative-dots opacity-30" />

                {/* Floating icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-6 rounded-full bg-card/80 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <ShoppingBag className="h-10 w-10 text-primary" />
                    </div>
                </div>

                {/* Badges */}
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-accent to-primary text-accent-foreground font-bold shadow-lg animate-pulse-glow">
                    {discount} OFF
                </Badge>
                <Badge
                    variant="secondary"
                    className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-card-foreground font-medium"
                >
                    {category}
                </Badge>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                        {retailer}
                    </p>
                </div>
                <h4 className="font-bold text-card-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
                    {title}
                </h4>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group/btn"
                    type="button"
                    onClick={() => onPreview?.(category)}
                >
                    <span>Preview Deals</span>
                    <ExternalLink className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </Button>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
        </div>
    );
};

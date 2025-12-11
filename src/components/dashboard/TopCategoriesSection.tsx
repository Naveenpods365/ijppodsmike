import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DealCard } from "./DealCard";

const topDeals = [
  {
    title: "Sony WH-1000XM5 Wireless Headphones",
    discount: "35%",
    category: "Electronics",
    retailer: "Amazon.ca",
  },
  {
    title: "Organic Coffee Beans Premium Blend",
    discount: "25%",
    category: "Food & Beverage",
    retailer: "Costco.ca",
  },
  {
    title: "Luxury Skincare Set with Vitamin C",
    discount: "40%",
    category: "Beauty",
    retailer: "Walmart.ca",
  },
  {
    title: "LEGO Star Wars Millennium Falcon",
    discount: "30%",
    category: "Toys",
    retailer: "BestBuy.ca",
  },
];

export const TopCategoriesSection = () => {
  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute -top-20 left-1/4 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-60 h-60 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Top Categories</h3>
            <p className="text-sm text-muted-foreground">Best performing deals this week</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-2 group">
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {topDeals.map((deal, index) => (
          <div
            key={index}
            className="animate-slide-up opacity-0"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <DealCard {...deal} />
          </div>
        ))}
      </div>
    </div>
  );
};

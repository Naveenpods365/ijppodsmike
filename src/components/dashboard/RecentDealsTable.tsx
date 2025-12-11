import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ClipboardCopy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type DealStatus = "Sent" | "Pending" | "Failed";

interface Deal {
  id: number;
  product: string;
  retailer: string;
  discount: string;
  coupon: string;
  status: DealStatus;
}

const deals: Deal[] = [
  { id: 1, product: "Sony WH-1000XM5", retailer: "Amazon.ca", discount: "35%", coupon: "SAVE35", status: "Sent" },
  { id: 2, product: "Organic Coffee Beans", retailer: "Costco.ca", discount: "25%", coupon: "COFFEE25", status: "Pending" },
  { id: 3, product: "Skincare Set", retailer: "Walmart.ca", discount: "40%", coupon: "BEAUTY40", status: "Sent" },
  { id: 4, product: "LEGO Millennium Falcon", retailer: "BestBuy.ca", discount: "30%", coupon: "TOY30", status: "Sent" },
  { id: 5, product: "Smart Watch Series 8", retailer: "Amazon.ca", discount: "20%", coupon: "WATCH20", status: "Failed" },
];

const tabs = ["All", "Sent", "Pending", "Failed"] as const;

export const RecentDealsTable = () => {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All");

  const filteredDeals = activeTab === "All" 
    ? deals 
    : deals.filter(deal => deal.status === activeTab);

  const getStatusStyles = (status: DealStatus) => {
    switch (status) {
      case "Sent":
        return "bg-success/10 text-success border-success/20";
      case "Pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "Failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  const getTabCount = (tab: typeof tabs[number]) => {
    if (tab === "All") return deals.length;
    return deals.filter(d => d.status === tab).length;
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-card-foreground">Recent Deals</h3>
            <p className="text-sm text-muted-foreground mt-1">Track your deal distribution status</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <ExternalLink className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
                activeTab === tab
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                activeTab === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Retailer</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Discount</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Coupon</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDeals.map((deal, index) => (
              <tr 
                key={deal.id}
                className="group hover:bg-muted/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{deal.product}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">{deal.retailer}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{deal.discount}</span>
                </td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-2 group/copy hover:bg-muted px-2 py-1 rounded-lg transition-colors">
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{deal.coupon}</code>
                    <ClipboardCopy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={cn("text-xs font-semibold", getStatusStyles(deal.status))}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mr-2",
                      deal.status === "Sent" && "bg-success",
                      deal.status === "Pending" && "bg-warning animate-pulse",
                      deal.status === "Failed" && "bg-destructive"
                    )} />
                    {deal.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

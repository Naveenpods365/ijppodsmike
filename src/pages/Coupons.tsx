import { useState } from "react";
import { Ticket, CheckCircle, TrendingUp, Percent, Search, Plus, Copy, Check } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const coupons = [
  {
    code: "SAVE35",
    discount: "35% OFF",
    product: "Sony WH-1000XM5 Wireless Headphones",
    category: "Electronics",
    retailer: "Amazon.ca",
    uses: 234,
    expires: "Dec 31, 2025",
    active: true,
  },
  {
    code: "COFFEE25",
    discount: "25% OFF",
    product: "Organic Coffee Beans Premium Blend",
    category: "Food & Beverage",
    retailer: "Costco.ca",
    uses: 189,
    expires: "Jan 15, 2026",
    active: true,
  },
  {
    code: "BEAUTY40",
    discount: "40% OFF",
    product: "Luxury Skincare Set with Vitamin C",
    category: "Beauty",
    retailer: "Walmart.ca",
    uses: 456,
    expires: "Dec 25, 2025",
    active: true,
  },
  {
    code: "TOY30",
    discount: "30% OFF",
    product: "LEGO Star Wars Millennium Falcon",
    category: "Toys",
    retailer: "BestBuy.ca",
    uses: 312,
    expires: "Jan 31, 2026",
    active: true,
  },
  {
    code: "WATCH20",
    discount: "20% OFF",
    product: "Smart Watch Series 8",
    category: "Electronics",
    retailer: "Amazon.ca",
    uses: 567,
    expires: "Dec 15, 2025",
    active: true,
  },
  {
    code: "KITCHEN15",
    discount: "15% OFF",
    product: "Premium Kitchen Appliance Set",
    category: "Home & Kitchen",
    retailer: "Costco.ca",
    uses: 89,
    expires: "Nov 30, 2025",
    active: false,
  },
];

const CouponCard = ({ coupon, onCopy }: { coupon: typeof coupons[0]; onCopy: (code: string) => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    onCopy(coupon.code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group ${!coupon.active ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <span className="font-mono font-bold text-primary">{coupon.code}</span>
            </div>
            <Badge className="bg-accent/20 text-accent border-accent/30 font-bold">
              {coupon.discount}
            </Badge>
          </div>
          <Badge 
            variant="outline" 
            className={coupon.active 
              ? "bg-success/10 text-success border-success/30" 
              : "bg-muted text-muted-foreground border-muted"
            }
          >
            {coupon.active ? "Active" : "Expired"}
          </Badge>
        </div>

        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{coupon.product}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">{coupon.category}</Badge>
          <span className="text-xs text-muted-foreground">{coupon.retailer}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Used: {coupon.uses} times • Expires: {coupon.expires}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 hover:bg-primary/10 hover:text-primary"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Coupons = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const handleCopy = (code: string) => {
    toast({
      title: "Coupon copied!",
      description: `${code} has been copied to your clipboard.`,
    });
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesFilter = filter === "all" || (filter === "active" && coupon.active) || (filter === "expired" && !coupon.active);
    const matchesSearch = search === "" || 
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      coupon.product.toLowerCase().includes(search.toLowerCase()) ||
      coupon.retailer.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen relative">
        <Header title="Coupons" subtitle="Manage all your discount codes" />
        
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Action Header */}
          <div className="flex items-center justify-end animate-fade-in">
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Add Coupon
            </Button>
          </div>

          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Coupons</p>
                      <p className="text-3xl font-bold text-foreground mt-1">156</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-3xl font-bold text-foreground mt-1">142</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Uses</p>
                      <p className="text-3xl font-bold text-foreground mt-1">12.4K</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Discount</p>
                      <p className="text-3xl font-bold text-foreground mt-1">27%</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Percent className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons by code, product, or retailer..."
                className="pl-11 h-11 bg-background border-border rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="h-11 bg-muted/50">
                <TabsTrigger value="all" className="px-4">All</TabsTrigger>
                <TabsTrigger value="active" className="px-4">Active</TabsTrigger>
                <TabsTrigger value="expired" className="px-4">Expired</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Coupons Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoupons.map((coupon, index) => (
              <div 
                key={coupon.code} 
                className="animate-slide-up opacity-0" 
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <CouponCard coupon={coupon} onCopy={handleCopy} />
              </div>
            ))}
          </section>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No coupons found matching your search.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Coupons;

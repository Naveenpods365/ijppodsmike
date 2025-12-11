import { Package, Send, Tag, Clock, Zap } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { TopCategoriesSection } from "@/components/dashboard/TopCategoriesSection";
import { AffiliateLinksSection } from "@/components/dashboard/AffiliateLinksSection";
import { RecentDealsTable } from "@/components/dashboard/RecentDealsTable";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-success/5 rounded-full blur-3xl" />
      </div>

      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen relative">
        <Header />
        
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: 'forwards' }}>
              <StatsCard
                title="Total Deals"
                value="2,847"
                change="+12% from last week"
                changeType="positive"
                icon={Package}
                iconColor="bg-primary/10 text-primary"
              />
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: 'forwards' }}>
              <StatsCard
                title="Deals Sent"
                value="1,234"
                change="+8% this week"
                changeType="positive"
                icon={Send}
                iconColor="bg-accent/10 text-accent"
              />
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
              <StatsCard
                title="Top Category"
                value="Electronics"
                change="43% engagement"
                changeType="neutral"
                icon={Tag}
                iconColor="bg-warning/10 text-warning"
              />
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: 'forwards' }}>
              <StatsCard
                title="Next Run"
                value="2h 15m"
                change="Auto-scheduled"
                changeType="neutral"
                icon={Clock}
                iconColor="bg-success/10 text-success"
              />
            </div>
          </section>

          {/* Metrics Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: 'forwards' }}>
              <MetricCard label="Total Deals Sent" value="12,487" change="+15.3%" isPositive />
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "150ms", animationFillMode: 'forwards' }}>
              <MetricCard label="Active Users" value="8,234" change="+8.7%" isPositive />
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
              <MetricCard label="Engagement Rate" value="67.8%" change="-2.3%" isPositive={false} />
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "250ms", animationFillMode: 'forwards' }}>
              <MetricCard label="Avg. Discount" value="28.5%" change="+3.2%" isPositive />
            </div>
          </section>

          {/* Chart & Affiliate Links */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-scale-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
              <WeeklyActivityChart />
            </div>
            <div className="animate-scale-in opacity-0" style={{ animationDelay: "300ms", animationFillMode: 'forwards' }}>
              <AffiliateLinksSection />
            </div>
          </section>

          {/* Top Categories */}
          <section className="animate-fade-in opacity-0" style={{ animationDelay: "400ms", animationFillMode: 'forwards' }}>
            <TopCategoriesSection />
          </section>

          {/* Recent Deals Table */}
          <section className="animate-slide-up opacity-0" style={{ animationDelay: "500ms", animationFillMode: 'forwards' }}>
            <RecentDealsTable />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;

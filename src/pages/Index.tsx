import { AffiliateLinksSection } from "@/components/dashboard/AffiliateLinksSection";
import { Header } from "@/components/dashboard/Header";
import { RecentDealsTable } from "@/components/dashboard/RecentDealsTable";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { useDashboardMetricsWebSocket } from "@/hooks/useDashboardMetricsWebSocket";
import { Package, Percent, Tag, Users } from "lucide-react";

const Index = () => {
    const { metrics } = useDashboardMetricsWebSocket();

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
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "0ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <StatsCard
                                title="Total Deals"
                                value={metrics ? metrics.total_deals.toLocaleString() : "—"}
                                icon={Package}
                                iconColor="bg-primary/10 text-primary"
                            />
                        </div>
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "200ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <StatsCard
                                title="Top Category"
                                value={metrics?.top_category?.name || "—"}
                                icon={Tag}
                                iconColor="bg-warning/10 text-warning"
                            />
                        </div>
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "100ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <StatsCard
                                title="Active Groups"
                                value={metrics ? metrics.active_groups.toLocaleString() : "—"}
                                icon={Users}
                                iconColor="bg-success/10 text-success"
                            />
                        </div>
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "150ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <StatsCard
                                title="Avg. Discount"
                                value={metrics ? `${metrics.avg_discount_pct.toFixed(1)}%` : "—"}
                                icon={Percent}
                                iconColor="bg-info/10 text-info"
                            />
                        </div>
                    </section>

                    {/* Chart & Affiliate Links */}
                    <section className="grid grid-cols-1 gap-6">
                        <div
                            className="animate-scale-in opacity-0"
                            style={{
                                animationDelay: "200ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <WeeklyActivityChart />
                        </div>
                        <div
                            className="animate-scale-in opacity-0"
                            style={{
                                animationDelay: "300ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <AffiliateLinksSection />
                        </div>
                    </section>

                    {/* Top Categories */}
                    <section
                        className="animate-fade-in opacity-0"
                        style={{
                            animationDelay: "400ms",
                            animationFillMode: "forwards",
                        }}
                    >
                        {/* <TopCategoriesSection /> */}
                    </section>

                    {/* Recent Deals Table */}
                    <section
                        className="animate-slide-up opacity-0"
                        style={{
                            animationDelay: "500ms",
                            animationFillMode: "forwards",
                        }}
                    >
                        <RecentDealsTable />
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Index;

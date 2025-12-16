import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axiosInstance";
import { useToast } from "@/hooks/use-toast";

type DealStatus = "Sent" | "Pending" | "Failed";

interface Deal {
    id: string;
    title: string;
    shoppingPlatform: string;
    price: number | null;
    discounted: number | null;
    createdAt: string | null;
    link: string | null;
    imageUrl: string | null;
    badge: string;
    status: DealStatus;
}

type ApiRecentDeal = {
    id: string;
    title?: string | null;
    shopping_platform?: string | null;
    price?: number | null;
    discounted?: number | null;
    org_link?: string | null;
    orig_link?: string | null;
    aff_link?: string | null;
    image_url?: string | null;
    badge?: string | null;
    status?: string | null;
    created_at?: string | null;
};

const toDealStatus = (status?: string | null): DealStatus => {
    const s = (status || "").toLowerCase();
    if (s === "sent" || s === "success" || s === "delivered") return "Sent";
    if (s === "failed" || s === "error") return "Failed";
    return "Pending";
};

const formatMoney = (value: number | null | undefined) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return `$${value.toFixed(2)}`;
};

const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
};

const normalizeRecentDeal = (d: ApiRecentDeal): Deal => {
    const link = d.aff_link || d.org_link || d.orig_link || null;

    return {
        id: String(d.id),
        title: d.title || "—",
        shoppingPlatform: d.shopping_platform || "—",
        price: typeof d.price === "number" ? d.price : null,
        discounted: typeof d.discounted === "number" ? d.discounted : null,
        createdAt: d.created_at || null,
        link,
        imageUrl: d.image_url || null,
        badge: d.badge || "—",
        status: toDealStatus(d.status),
    };
};

const tabs = ["All", "Sent", "Pending", "Failed"] as const;

export const RecentDealsTable = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");
    const [deals, setDeals] = useState<Deal[]>([]);

    useEffect(() => {
        let mounted = true;

        const loadRecentDeals = async () => {
            try {
                const res = await api.get("/dashboard/recent-deals");
                const raw = (res.data || []) as ApiRecentDeal[];
                const normalized = Array.isArray(raw)
                    ? raw.map(normalizeRecentDeal)
                    : [];
                if (mounted) setDeals(normalized);
            } catch (e: any) {
                if (mounted) setDeals([]);
                toast({
                    title: "Failed to load recent deals",
                    description: e?.response?.data?.message || e?.message,
                    variant: "destructive",
                });
            }
        };

        loadRecentDeals();
        return () => {
            mounted = false;
        };
    }, [toast]);

    const filteredDeals =
        activeTab === "All"
            ? deals
            : deals.filter((deal) => deal.status === activeTab);

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

    const getTabCount = (tab: (typeof tabs)[number]) => {
        if (tab === "All") return deals.length;
        return deals.filter((d) => d.status === tab).length;
    };

    return (
        <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-xl font-bold text-card-foreground">
                            Scraped Deals
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Latest scraped deals from your sources
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl"
                    >
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
                            <span
                                className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-md",
                                    activeTab === tab
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
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
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Deal
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Platform
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Price
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Discounted
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Date
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Badge
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Link
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredDeals.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                                >
                                    No recent deals.
                                </td>
                            </tr>
                        ) : (
                            filteredDeals?.map((deal, index) => (
                                <tr
                                    key={deal.id}
                                    className="group hover:bg-muted/30 transition-all duration-300 animate-fade-in"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden border border-border/60 flex-shrink-0">
                                                {deal.imageUrl ? (
                                                    <img
                                                        src={deal.imageUrl}
                                                        alt={deal.title}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : null}
                                            </div>
                                            <span className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                {deal.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-success" />
                                            <span className="text-sm text-muted-foreground">
                                                {deal.shoppingPlatform}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-card-foreground">
                                            {formatMoney(deal.price)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                            {formatMoney(deal.discounted)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(deal.createdAt)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-bold bg-accent/20 text-accent border-accent/30"
                                        >
                                            {deal.badge}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 rounded-xl"
                                            disabled={!deal.link}
                                            onClick={() => {
                                                if (!deal.link) return;
                                                window.open(
                                                    deal.link,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                );
                                            }}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            View
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs font-semibold",
                                                getStatusStyles(deal.status)
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full mr-2",
                                                    deal.status === "Sent" &&
                                                        "bg-success",
                                                    deal.status === "Pending" &&
                                                        "bg-warning animate-pulse",
                                                    deal.status === "Failed" &&
                                                        "bg-destructive"
                                                )}
                                            />
                                            {deal.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

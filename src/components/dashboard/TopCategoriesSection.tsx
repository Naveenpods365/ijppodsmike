import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DealCard } from "./DealCard";
import api from "@/lib/axiosInstance";
import { useToast } from "@/hooks/use-toast";

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

type ApiPreviewDeal = {
    id: string;
    title?: string | null;
    category?: string | null;
    shopping_platform?: string | null;
    price?: number | null;
    discounted?: number | null;
    created_at?: string | null;
    image_url?: string | null;
    badge?: string | null;
    status?: string | null;
    org_link?: string | null;
    orig_link?: string | null;
    aff_link?: string | null;
};

type PreviewDeal = {
    id: string;
    title: string;
    category: string;
    platform: string;
    price: number | null;
    discounted: number | null;
    createdAt: string | null;
    imageUrl: string | null;
    badge: string;
    status: "Sent" | "Pending" | "Failed";
    link: string | null;
};

const toDealStatus = (
    status?: string | null
): "Sent" | "Pending" | "Failed" => {
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

const normalizePreviewDeal = (d: ApiPreviewDeal): PreviewDeal => {
    return {
        id: String(d.id),
        title: d.title || "—",
        category: d.category || "—",
        platform: d.shopping_platform || "—",
        price: typeof d.price === "number" ? d.price : null,
        discounted: typeof d.discounted === "number" ? d.discounted : null,
        createdAt: d.created_at || null,
        imageUrl: d.image_url || null,
        badge: d.badge || "—",
        status: toDealStatus(d.status),
        link: d.aff_link || d.org_link || d.orig_link || null,
    };
};

const toCategoryKey = (value: string) =>
    (value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");

export const TopCategoriesSection = () => {
    const { toast } = useToast();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewDeals, setPreviewDeals] = useState<PreviewDeal[]>([]);

    useEffect(() => {
        let mounted = true;

        const loadPreviewDeals = async () => {
            if (!previewOpen) return;

            try {
                setLoadingPreview(true);
                const res = await api.get("/dashboard/recent-deals");
                const raw = (res.data || []) as ApiPreviewDeal[];
                const normalized = Array.isArray(raw)
                    ? raw.map(normalizePreviewDeal)
                    : [];
                if (mounted) setPreviewDeals(normalized);
            } catch (e: any) {
                if (mounted) setPreviewDeals([]);
                toast({
                    title: "Failed to load deals",
                    description: e?.response?.data?.message || e?.message,
                    variant: "destructive",
                });
            } finally {
                if (mounted) setLoadingPreview(false);
            }
        };

        loadPreviewDeals();
        return () => {
            mounted = false;
        };
    }, [previewOpen, toast]);

    const filteredPreviewDeals = useMemo(() => {
        const selectedKey = toCategoryKey(selectedCategory);
        if (!selectedKey) return previewDeals;
        return previewDeals.filter((d) => {
            const dealKey = toCategoryKey(d.category);
            return dealKey === selectedKey;
        });
    }, [previewDeals, selectedCategory]);

    const handlePreview = (category: string) => {
        setSelectedCategory(category);
        setPreviewOpen(true);
    };

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
                        <h3 className="text-xl font-bold text-foreground">
                            Categories
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Best performing deals this week
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 gap-2 group"
                >
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
                            animationFillMode: "forwards",
                        }}
                    >
                        <DealCard {...deal} onPreview={handlePreview} />
                    </div>
                ))}
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="w-[92vw] max-w-none h-[80vh] p-0 overflow-hidden border-border/60 bg-card">
                    <div className="flex flex-col h-full">
                        <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
                            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_55%)]" />
                            <DialogHeader className="p-6">
                                <DialogTitle>Preview Deals</DialogTitle>
                                <DialogDescription>
                                    {selectedCategory
                                        ? `Category: ${selectedCategory}`
                                        : "All categories"}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-6 flex-1 overflow-hidden">
                            <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden h-full">
                                <div className="overflow-auto h-full">
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
                                            {loadingPreview ? (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-6 py-10 text-center text-sm text-muted-foreground"
                                                    >
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : filteredPreviewDeals.length ===
                                              0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-6 py-10 text-center text-sm text-muted-foreground"
                                                    >
                                                        No deals found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredPreviewDeals.map(
                                                    (deal, index) => (
                                                        <tr
                                                            key={deal.id}
                                                            className="group hover:bg-muted/30 transition-all duration-300 animate-fade-in"
                                                            style={{
                                                                animationDelay: `${
                                                                    index * 35
                                                                }ms`,
                                                            }}
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden border border-border/60 flex-shrink-0">
                                                                        {deal.imageUrl ? (
                                                                            <img
                                                                                src={
                                                                                    deal.imageUrl
                                                                                }
                                                                                alt={
                                                                                    deal.title
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                                loading="lazy"
                                                                            />
                                                                        ) : null}
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                                        {
                                                                            deal.title
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {
                                                                        deal.platform
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-semibold text-card-foreground">
                                                                    {formatMoney(
                                                                        deal.price
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                                                    {formatMoney(
                                                                        deal.discounted
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {formatDate(
                                                                        deal.createdAt
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/20 text-accent px-2.5 py-1 text-xs font-bold">
                                                                    {deal.badge}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="gap-2 rounded-xl"
                                                                    disabled={
                                                                        !deal.link
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            !deal.link
                                                                        )
                                                                            return;
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
                                                                <span
                                                                    className={
                                                                        deal.status ===
                                                                        "Sent"
                                                                            ? "inline-flex items-center rounded-full border border-success/20 bg-success/10 text-success px-2.5 py-1 text-xs font-semibold"
                                                                            : deal.status ===
                                                                              "Failed"
                                                                            ? "inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive px-2.5 py-1 text-xs font-semibold"
                                                                            : "inline-flex items-center rounded-full border border-warning/20 bg-warning/10 text-warning px-2.5 py-1 text-xs font-semibold"
                                                                    }
                                                                >
                                                                    {
                                                                        deal.status
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

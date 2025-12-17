import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getRunDeals } from "@/redux/slice/schedulerSlice";
import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const getStatusStyles = (status: string) => {
    switch (status) {
        case "Sent":
            return "bg-success/10 text-success border-success/20";
        case "Pending":
            return "bg-warning/10 text-warning border-warning/20";
        case "Failed":
            return "bg-destructive/10 text-destructive border-destructive/20";
        default:
            return "bg-muted text-muted-foreground border-muted";
    }
};

// Normalization logic adapted from RecentDealsTable
const formatMoney = (value: number | null | undefined) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "—";
    return `$${value.toFixed(2)}`;
};

const normalizeDeal = (d: any) => {
    const link = d.aff_link || d.org_link || d.orig_link || null;
    return {
        id: String(d.id),
        title: d.title || "—",
        shoppingPlatform: d.shopping_platform || "—",
        price: typeof d.price === "number" ? d.price : null,
        discounted: typeof d.discounted === "number" ? d.discounted : null,
        link,
        imageUrl: d.image_url || null,
        date: d.created_at ? new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : "—",
        time: d.created_at ? new Date(d.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : "—",
        status: d.status || "Pending",
    };
};

interface DealsPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    runId?: string | null;
}

const DealsPopup = ({ open, onOpenChange, runId }: DealsPopupProps) => {
    const dispatch = useDispatch();
    const { runDeals, runDealsLoading } = useSelector((state: any) => state.scheduler);

    useEffect(() => {
        if (open && runId) {
            dispatch(getRunDeals(runId));
        }
    }, [open, runId, dispatch]);

    const deals = Array.isArray(runDeals) ? runDeals.map(normalizeDeal) : [];
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1200px] bg-card border-border/60 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 shrink-0">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_55%)]" />
                    <DialogHeader className="p-6">
                        <DialogTitle>Recent Run Deals</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    {runDealsLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No deals found for this run.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-card">
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Platform
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {deals.map((deal) => (
                                    <tr
                                        key={deal.id}
                                        className="hover:bg-muted/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {deal.imageUrl ? (
                                                    <img
                                                        src={deal.imageUrl}
                                                        alt={deal.title}
                                                        className="h-10 w-10 rounded-lg object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                                                        <span className="text-xs text-muted-foreground">No Img</span>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-foreground truncate max-w-[200px]" title={deal.title}>
                                                            {deal.title}
                                                        </p>
                                                        {deal.link && (
                                                            <a
                                                                href={deal.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="capitalize">
                                                {deal.shoppingPlatform}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {deal.discounted ? (
                                                    <>
                                                        <span className="text-sm font-medium text-success block">
                                                            {formatMoney(deal.discounted)}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground line-through block">
                                                            {formatMoney(deal.price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-sm font-medium text-foreground">
                                                        {formatMoney(deal.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                {deal.date}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                {deal.time}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant="outline"
                                                className={cn("capitalize", getStatusStyles(deal.status))}
                                            >
                                                {deal.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DealsPopup;

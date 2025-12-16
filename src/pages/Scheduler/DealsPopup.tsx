import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

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

const dummyDeals = [
    {
        id: "1",
        title: "Gymax 28\" Pink Dollhouse w/ Furniture Rooms 3 Levels Young Girls Toy",
        shoppingPlatform: "walmart",
        price: 109.99,
        discounted: 109.99,
        coupons: [],
        badge: "-",
        link: "https://walmart.com",
        imageUrl: "https://i5.walmartimages.com/asr/1111111.jpg", // Placeholder
        date: "Dec 16, 2025",
        time: "14:30",
        status: "Pending",
    },
    {
        id: "2",
        title: "2 Set Diy Bird House Wind Chime Kits, Wooden Birdhouse Kit Crafts for Kids",
        shoppingPlatform: "walmart",
        price: 12.99,
        discounted: 10.99,
        coupons: ["15% OFF"],
        badge: "15% OFF",
        link: "https://walmart.com",
        imageUrl: null,
        date: "Dec 16, 2025",
        time: "14:25",
        status: "Pending",
    },
    {
        id: "3",
        title: "Baby Rattles Toy, Car Seat Travel Hanging Toys for Develop baby's tactile senses",
        shoppingPlatform: "walmart",
        price: 27.98,
        discounted: 13.99,
        coupons: ["50% OFF"],
        badge: "50% OFF",
        link: "https://walmart.com",
        imageUrl: null,
        date: "Dec 16, 2025",
        time: "14:20",
        status: "Pending",
    },
    {
        id: "4",
        title: "Barbie Vacation House Playset with 30+ Pieces, Toy for 3 Year Olds & Up",
        shoppingPlatform: "walmart",
        price: 169.97,
        discounted: 169.97,
        coupons: [],
        badge: "-",
        link: "https://walmart.com",
        imageUrl: null,
        date: "Dec 16, 2025",
        time: "14:15",
        status: "Pending",
    },
    {
        id: "5",
        title: "Crayola Pokémon Art Case, Pokémon Art Case",
        shoppingPlatform: "walmart",
        price: 25.97,
        discounted: 22.97,
        coupons: ["12% OFF"],
        badge: "12% OFF",
        link: "https://walmart.com",
        imageUrl: null,
        date: "Dec 16, 2025",
        time: "14:10",
        status: "Pending",
    },
];

interface DealsPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DealsPopup = ({ open, onOpenChange }: DealsPopupProps) => {
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

                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-card">
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
                                    Time
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
                            {dummyDeals.map((deal) => (
                                <tr
                                    key={deal.id}
                                    className="group hover:bg-muted/30 transition-all duration-300"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden border border-border/60 flex-shrink-0 flex items-center justify-center">
                                                {deal.imageUrl ? (
                                                    <img
                                                        src={deal.imageUrl}
                                                        alt={deal.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No Img</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-[200px]" title={deal.title}>
                                                {deal.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-success" />
                                            <span className="text-sm text-muted-foreground capitalize">
                                                {deal.shoppingPlatform}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-card-foreground">
                                            ${deal.price.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                            ${deal.discounted.toFixed(2)}
                                        </span>
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
                                            className="text-xs font-bold bg-accent/20 text-accent border-accent/30 whitespace-nowrap"
                                        >
                                            {deal.badge}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 rounded-xl h-8"
                                            onClick={() => window.open(deal.link, "_blank")}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs font-semibold whitespace-nowrap",
                                                getStatusStyles(deal.status)
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full mr-2",
                                                    deal.status === "Sent" && "bg-success",
                                                    deal.status === "Pending" && "bg-warning animate-pulse",
                                                    deal.status === "Failed" && "bg-destructive"
                                                )}
                                            />
                                            {deal.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DealsPopup;

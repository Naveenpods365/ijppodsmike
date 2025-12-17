import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
    ExternalLink,
    Link2,
    MessageCircle,
    Pencil,
    Plus,
    Send,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axiosInstance";

type ApiAffiliateLink = {
    id: string;
    url?: string | null;
    title?: string | null;
    retailer?: string | null;
    category?: string | null;
    discount_label?: string | null;
    active?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type AffiliateLink = {
    id: string;
    url: string;
    productTitle: string;
    retailer: string;
    category: string;
    discountAmount: string;
    sendToTelegram: boolean;
    sendToWhatsapp: boolean;
};

export const AffiliateLinksSection = () => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [links, setLinks] = useState<AffiliateLink[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [saving, setSaving] = useState(false);

    const [url, setUrl] = useState("");
    const [productTitle, setProductTitle] = useState("");
    const [retailer, setRetailer] = useState("");
    const [category, setCategory] = useState("");
    const [discountAmount, setDiscountAmount] = useState("");
    const [sendToTelegram, setSendToTelegram] = useState(true);
    const [sendToWhatsapp, setSendToWhatsapp] = useState(true);

    const resetForm = () => {
        setUrl("");
        setProductTitle("");
        setRetailer("");
        setCategory("");
        setDiscountAmount("");
        setSendToTelegram(true);
        setSendToWhatsapp(true);
    };

    const openCreate = () => {
        setEditingId(null);
        resetForm();
        setOpen(true);
    };

    const openEdit = (l: AffiliateLink) => {
        setEditingId(l.id);
        setUrl(l.url);
        setProductTitle(l.productTitle);
        setRetailer(l.retailer);
        setCategory(l.category);
        setDiscountAmount(l.discountAmount);
        setSendToTelegram(l.sendToTelegram);
        setSendToWhatsapp(l.sendToWhatsapp);
        setOpen(true);
    };

    const buildShareMessage = (l: AffiliateLink) => {
        const parts: string[] = [];
        if (l.productTitle) parts.push(l.productTitle);
        if (l.discountAmount) parts.push(l.discountAmount);
        if (l.retailer) parts.push(`Retailer: ${l.retailer}`);
        if (l.category) parts.push(`Category: ${l.category}`);
        if (l.url) parts.push(l.url);
        return parts.join("\n");
    };

    const handleSendTelegram = (l: AffiliateLink) => {
        if (!l.url) {
            toast({
                title: "Link is missing",
                variant: "destructive",
            });
            return;
        }

        const text = buildShareMessage(l);
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
            l.url
        )}&text=${encodeURIComponent(text)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    const handleSendWhatsApp = (l: AffiliateLink) => {
        if (!l.url) {
            toast({
                title: "Link is missing",
                variant: "destructive",
            });
            return;
        }

        const text = buildShareMessage(l);
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    useEffect(() => {
        let mounted = true;

        const loadAffiliateLinks = async () => {
            try {
                if (mounted) setLoadingLinks(true);
                const res = await api.get("/affiliate");
                const raw = (res.data || []) as unknown;
                const arr: ApiAffiliateLink[] = Array.isArray(raw)
                    ? (raw as ApiAffiliateLink[])
                    : ((raw as any)?.data as ApiAffiliateLink[]) || [];

                const normalized: AffiliateLink[] = arr.map((a) => ({
                    id: String(a.id),
                    url: a.url || "",
                    productTitle: a.title || "",
                    retailer: a.retailer || "",
                    category: a.category || "",
                    discountAmount: a.discount_label || "",
                    sendToTelegram: true,
                    sendToWhatsapp: true,
                }));

                if (mounted) setLinks(normalized);
            } catch (e: any) {
                if (mounted) setLinks([]);
                toast({
                    title: "Failed to load affiliate links",
                    description: e?.response?.data?.message || e?.message,
                    variant: "destructive",
                });
            } finally {
                if (mounted) setLoadingLinks(false);
            }
        };

        loadAffiliateLinks();
        return () => {
            mounted = false;
        };
    }, [toast]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            toast({
                title: "Affiliate Link URL is required",
                variant: "destructive",
            });
            return;
        }

        const apiPayload = {
            url: url.trim(),
            title: productTitle.trim(),
            retailer: retailer.trim(),
            category: category.trim(),
            discount_label: discountAmount.trim(),
        };

        if (editingId) {
            try {
                setSaving(true);
                const res = await api.patch(
                    `/affiliate/${editingId}`,
                    apiPayload
                );
                const updated = (res.data || null) as ApiAffiliateLink | null;

                const updatedItem: AffiliateLink = {
                    id: String(updated?.id || editingId),
                    url: updated?.url || apiPayload.url,
                    productTitle: updated?.title || apiPayload.title,
                    retailer: updated?.retailer || apiPayload.retailer,
                    category: updated?.category || apiPayload.category,
                    discountAmount:
                        updated?.discount_label || apiPayload.discount_label,
                    sendToTelegram,
                    sendToWhatsapp,
                };

                setLinks((prev) =>
                    prev.map((it) =>
                        it.id === editingId ? { ...it, ...updatedItem } : it
                    )
                );

                toast({
                    title: "Affiliate link updated",
                    description: "Your changes have been saved.",
                });
                setOpen(false);
                setEditingId(null);
                resetForm();
            } catch (e: any) {
                toast({
                    title: "Failed to update affiliate link",
                    description: e?.response?.data?.message || e?.message,
                    variant: "destructive",
                });
            } finally {
                setSaving(false);
            }
            return;
        }

        try {
            setSaving(true);
            const res = await api.post("/affiliate", apiPayload);
            const created = (res.data || null) as ApiAffiliateLink | null;
            if (created?.id) {
                const newItem: AffiliateLink = {
                    id: String(created.id),
                    url: created.url || apiPayload.url,
                    productTitle: created.title || apiPayload.title,
                    retailer: created.retailer || apiPayload.retailer,
                    category: created.category || apiPayload.category,
                    discountAmount:
                        created.discount_label || apiPayload.discount_label,
                    sendToTelegram,
                    sendToWhatsapp,
                };
                setLinks((prev) => [newItem, ...prev]);
            } else {
                const fallback: AffiliateLink = {
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    url: apiPayload.url,
                    productTitle: apiPayload.title,
                    retailer: apiPayload.retailer,
                    category: apiPayload.category,
                    discountAmount: apiPayload.discount_label,
                    sendToTelegram,
                    sendToWhatsapp,
                };
                setLinks((prev) => [fallback, ...prev]);
            }

            toast({
                title: "Affiliate link added",
                description: "Your affiliate link has been saved.",
            });
            setOpen(false);
            resetForm();
        } catch (e: any) {
            toast({
                title: "Failed to add affiliate link",
                description: e?.response?.data?.message || e?.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const hasLinks = useMemo(() => links.length > 0, [links.length]);

    return (
        <div className="group relative bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden h-[560px] flex flex-col">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-accent/10 to-transparent rounded-tl-full opacity-50" />

            <div className="relative flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-lg font-bold text-card-foreground">
                        Affiliate Links
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Upload links and track performance
                    </p>
                </div>
                {/* <div className="p-2 rounded-xl bg-accent/10">
                    <Link2 className="h-5 w-5 text-accent" />
                </div> */}
                <div className="relative flex justify-end mb-6">
                    <Button
                        className="h-12 gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 px-6"
                        type="button"
                        onClick={openCreate}
                    >
                        <Plus className="h-4 w-4" />
                        Add New Affiliate Link
                    </Button>
                </div>
            </div>

            <div className="relative flex-1 min-h-0">
                {loadingLinks ? (
                    <div className="relative h-full overflow-auto rounded-xl border border-border/60 bg-background/40">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-[#F8F9F8]">
                                <tr className="border-b border-border ">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Retailer
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Telegram
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        WhatsApp
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <tr key={`al-s-${idx}`}>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-[160px]" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-[120px]" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-4 w-[120px]" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-6 w-[90px] rounded-lg" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-6 w-[60px] rounded-full" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-6 w-[60px] rounded-full" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-9 w-9 rounded-xl" />
                                                <Skeleton className="h-9 w-9 rounded-xl" />
                                                <Skeleton className="h-9 w-9 rounded-xl" />
                                                <Skeleton className="h-9 w-9 rounded-xl" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : hasLinks ? (
                    <div className="relative h-full overflow-auto rounded-xl border border-border/60 bg-background/40">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10 bg-[#F8F9F8]">
                                <tr className="border-b border-border ">
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Retailer
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Telegram
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        WhatsApp
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {links.map((l) => (
                                    <tr
                                        key={l.id}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold text-card-foreground">
                                                {l.productTitle || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                {l.retailer || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-muted-foreground">
                                                {l.category || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                                                {l.discountAmount || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    l.sendToTelegram
                                                        ? "bg-success/10 text-success border-success/20"
                                                        : "bg-muted text-muted-foreground"
                                                }
                                            >
                                                {l.sendToTelegram
                                                    ? "On"
                                                    : "Off"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    l.sendToWhatsapp
                                                        ? "bg-success/10 text-success border-success/20"
                                                        : "bg-muted text-muted-foreground"
                                                }
                                            >
                                                {l.sendToWhatsapp
                                                    ? "On"
                                                    : "Off"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl"
                                                    onClick={() => openEdit(l)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl"
                                                    disabled={
                                                        !l.url ||
                                                        !l.sendToTelegram
                                                    }
                                                    onClick={() =>
                                                        handleSendTelegram(l)
                                                    }
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl"
                                                    disabled={
                                                        !l.url ||
                                                        !l.sendToWhatsapp
                                                    }
                                                    onClick={() =>
                                                        handleSendWhatsApp(l)
                                                    }
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl"
                                                    disabled={!l.url}
                                                    onClick={() => {
                                                        if (!l.url) return;
                                                        window.open(
                                                            l.url,
                                                            "_blank",
                                                            "noopener,noreferrer"
                                                        );
                                                    }}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="relative h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl bg-muted/20 hover:border-primary/30 hover:bg-muted/30 transition-all duration-300 group/empty">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-0 group-hover/empty:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-5 bg-gradient-to-br from-secondary to-muted rounded-2xl mb-4 group-hover/empty:scale-110 transition-transform duration-300">
                                <Link2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            No affiliate links yet
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Add a new affiliate link to get started!
                        </p>

                        <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            <Sparkles className="h-3 w-3" />
                            <span>Earn up to 15% commission</span>
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) {
                        setEditingId(null);
                        resetForm();
                    }
                }}
            >
                <DialogContent className="w-[92vw] max-w-[720px] p-0 overflow-hidden border-border/60 bg-card">
                    <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_55%)]" />
                        <DialogHeader className="p-6">
                            <DialogTitle>
                                {editingId
                                    ? "Edit Affiliate Link"
                                    : "Add New Affiliate Link"}
                            </DialogTitle>
                            <DialogDescription>
                                Fill in the details and optionally auto-share to
                                your groups.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="affiliate_url">
                                Affiliate Link URL *
                            </Label>
                            <Input
                                id="affiliate_url"
                                placeholder="https://amazon.ca/dp/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-11"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product_title">
                                    Product Title
                                </Label>
                                <Input
                                    id="product_title"
                                    placeholder="Sony WH-1000XM5 Headphones"
                                    value={productTitle}
                                    onChange={(e) =>
                                        setProductTitle(e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="retailer">Retailer</Label>
                                <Input
                                    id="retailer"
                                    placeholder="Amazon.ca"
                                    value={retailer}
                                    onChange={(e) =>
                                        setRetailer(e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="Electronics"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discount">
                                    Discount Amount
                                </Label>
                                <Input
                                    id="discount"
                                    placeholder="35% OFF"
                                    value={discountAmount}
                                    onChange={(e) =>
                                        setDiscountAmount(e.target.value)
                                    }
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-foreground">
                                        Send to Telegram
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Auto-share to your groups
                                    </div>
                                </div>
                                <Switch
                                    checked={sendToTelegram}
                                    onCheckedChange={setSendToTelegram}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-foreground">
                                        Send to WhatsApp
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Auto-share to your groups
                                    </div>
                                </div>
                                <Switch
                                    checked={sendToWhatsapp}
                                    onCheckedChange={setSendToWhatsapp}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    setEditingId(null);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                            >
                                {editingId ? "Update" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

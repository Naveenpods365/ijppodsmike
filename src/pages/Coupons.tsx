import { useEffect, useState } from "react";
import {
    Ticket,
    CheckCircle,
    TrendingUp,
    Percent,
    Search,
    Plus,
    Copy,
    Check,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axiosInstance";

type ApiCouponCard = {
    id?: string;
    code?: string | null;
    title?: string | null;
    image_url?: string | null;
    discount_text?: string | null;
    coupon_code?: string | null;
    discount_percent?: number | null;
    rating?: number | null;
    reviews_count?: number | null;
    link?: string | null;
    group_id?: string | null;
    group_name?: string | null;
    platform?: string | null;
    created_at?: string | null;
    expires_at?: string | null;
    expires_on?: string | null;
    expiry_date?: string | null;
    uses?: number | null;
    uses_count?: number | null;
    used_count?: number | null;
    usage_count?: number | null;
    category?: string | null;
    category_name?: string | null;
    active?: boolean | null;
    is_active?: boolean | null;
    status?: string | null;
};

const toGroupId = (retailer: string) => {
    const slug = (retailer || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return slug || "retailer";
};

type Coupon = {
    id: string;
    code: string;
    discount: string;
    product: string;
    category: string;
    retailer: string;
    uses: number;
    expires: string;
    active: boolean;
};

const formatDate = (value: string | null | undefined) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
};

const normalizeCoupon = (c: ApiCouponCard): Coupon => {
    const expiresRaw = c.expires_at || c.expires_on || c.expiry_date;

    const discount =
        c.discount_text ||
        (typeof c.discount_percent === "number"
            ? `${c.discount_percent}% OFF`
            : "");

    const activeFromStatus =
        typeof c.status === "string"
            ? c.status.toLowerCase() === "active"
            : undefined;

    return {
        id: String(c.id || c.coupon_code || c.title || Math.random()),
        code: c.code || c.coupon_code || "",
        discount,
        product: c.title || "",
        category: c.category_name || c.category || "",
        retailer: c.group_name || "",
        uses: (c.uses ??
            c.uses_count ??
            c.used_count ??
            c.usage_count ??
            0) as number,
        expires: formatDate(expiresRaw),
        active: (c.active ??
            c.is_active ??
            activeFromStatus ??
            true) as boolean,
    };
};

const CouponCard = ({
    coupon,
    onCopy,
}: {
    coupon: Coupon;
    onCopy: (code: string) => void;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code);
        setCopied(true);
        onCopy(coupon.code);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card
            className={`relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group ${
                !coupon.active ? "opacity-60" : ""
            }`}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <span className="font-mono font-bold text-primary">
                                {coupon.code}
                            </span>
                        </div>
                        <Badge className="bg-accent/20 text-accent border-accent/30 font-bold">
                            {coupon.discount}
                        </Badge>
                    </div>
                    <Badge
                        variant="outline"
                        className={
                            coupon.active
                                ? "bg-success/10 text-success border-success/30"
                                : "bg-muted text-muted-foreground border-muted"
                        }
                    >
                        {coupon.active ? "Active" : "Expired"}
                    </Badge>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                    {coupon.product}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                        {coupon.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                        {coupon.retailer}
                    </span>
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
                        {copied ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs">
                            {copied ? "Copied!" : "Copy"}
                        </span>
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
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [creatingCoupon, setCreatingCoupon] = useState(false);
    const [newCode, setNewCode] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newGroupName, setNewGroupName] = useState("");
    const [newDiscountPercent, setNewDiscountPercent] = useState("");
    const [newUsesCount, setNewUsesCount] = useState("");
    const [newExpiresAt, setNewExpiresAt] = useState("");

    const handleCopy = (code: string) => {
        toast({
            title: "Coupon copied!",
            description: `${code} has been copied to your clipboard.`,
        });
    };

    const loadCoupons = async () => {
        try {
            setLoadingCoupons(true);
            const res = await api.get("/coupons/cards/");
            const raw = (res.data || []) as ApiCouponCard[];
            const normalized = Array.isArray(raw)
                ? raw.map(normalizeCoupon)
                : [];
            setCoupons(normalized);
        } catch (e: any) {
            setCoupons([]);
            toast({
                title: "Failed to load coupons",
                description: e?.response?.data?.message || e?.message,
                variant: "destructive",
            });
        } finally {
            setLoadingCoupons(false);
        }
    };

    useEffect(() => {
        loadCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetNewCouponForm = () => {
        setNewCode("");
        setNewTitle("");
        setNewCategory("");
        setNewGroupName("");
        setNewDiscountPercent("");
        setNewUsesCount("");
        setNewExpiresAt("");
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setCreatingCoupon(true);
            const discountPercent = Number(newDiscountPercent);
            const usesCountRaw =
                newUsesCount.trim() === "" ? null : Number(newUsesCount);

            const expiresAtIso =
                newExpiresAt.trim() === ""
                    ? null
                    : new Date(newExpiresAt).toISOString();

            const payload: Record<string, any> = {
                code: newCode,
                title: newTitle,
                category: newCategory,
                group_id: toGroupId(newGroupName),
                group_name: newGroupName,
                discount_percent: discountPercent,
            };

            if (
                typeof usesCountRaw === "number" &&
                !Number.isNaN(usesCountRaw)
            ) {
                payload.uses_count = usesCountRaw;
            }
            if (expiresAtIso) {
                payload.expires_at = expiresAtIso;
            }

            await api.post("/coupons/cards", payload);

            toast({
                title: "Coupon created",
                description: "New coupon has been added successfully.",
            });
            setAddOpen(false);
            resetNewCouponForm();
            await loadCoupons();
        } catch (e: any) {
            toast({
                title: "Failed to create coupon",
                description: e?.response?.data?.message || e?.message,
                variant: "destructive",
            });
        } finally {
            setCreatingCoupon(false);
        }
    };

    const filteredCoupons = coupons.filter((coupon) => {
        const matchesFilter =
            filter === "all" ||
            (filter === "active" && coupon.active) ||
            (filter === "expired" && !coupon.active);
        const matchesSearch =
            search === "" ||
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
                <Header
                    title="Coupons"
                    subtitle="Manage all your discount codes"
                />

                <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                    {/* Action Header */}
                    <div className="flex items-center justify-end animate-fade-in">
                        <Dialog open={addOpen} onOpenChange={setAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
                                    <Plus className="h-4 w-4" />
                                    Add Coupon
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden border-border/60 bg-card">
                                <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
                                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.12),transparent_55%)]" />
                                    <DialogHeader className="p-6">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                                                <Ticket className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <DialogTitle>
                                                    Add New Coupon
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Create a coupon card for
                                                    your channels.
                                                </DialogDescription>
                                            </div>
                                        </div>
                                    </DialogHeader>
                                </div>

                                <form
                                    onSubmit={handleCreateCoupon}
                                    className="p-6 space-y-5"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="newCode">
                                                Code
                                            </Label>
                                            <Input
                                                id="newCode"
                                                value={newCode}
                                                onChange={(e) =>
                                                    setNewCode(e.target.value)
                                                }
                                                placeholder="SAVE35"
                                                required
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newCategory">
                                                Category
                                            </Label>
                                            <Input
                                                id="newCategory"
                                                value={newCategory}
                                                onChange={(e) =>
                                                    setNewCategory(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Electronics"
                                                required
                                                className="h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newTitle">Title</Label>
                                        <Input
                                            id="newTitle"
                                            value={newTitle}
                                            onChange={(e) =>
                                                setNewTitle(e.target.value)
                                            }
                                            placeholder="Sony WH-1000XM5 Wireless Headphones"
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newGroupName">
                                            Retailer
                                        </Label>
                                        <Input
                                            id="newGroupName"
                                            value={newGroupName}
                                            onChange={(e) =>
                                                setNewGroupName(e.target.value)
                                            }
                                            placeholder="Amazon.ca"
                                            required
                                            className="h-11"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="newDiscountPercent">
                                                    Discount %
                                                </Label>
                                                <Input
                                                    id="newDiscountPercent"
                                                    type="number"
                                                    step="0.01"
                                                    value={newDiscountPercent}
                                                    onChange={(e) =>
                                                        setNewDiscountPercent(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="35"
                                                    required
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newUsesCount">
                                                    Uses Count
                                                </Label>
                                                <Input
                                                    id="newUsesCount"
                                                    type="number"
                                                    value={newUsesCount}
                                                    onChange={(e) =>
                                                        setNewUsesCount(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="234"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newExpiresAt">
                                                Expiry
                                            </Label>
                                            <Input
                                                id="newExpiresAt"
                                                type="datetime-local"
                                                value={newExpiresAt}
                                                onChange={(e) =>
                                                    setNewExpiresAt(
                                                        e.target.value
                                                    )
                                                }
                                                className="h-11 w-full"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Optional. Leave empty for no
                                                expiry.
                                            </p>
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setAddOpen(false);
                                                resetNewCouponForm();
                                            }}
                                            disabled={creatingCoupon}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={creatingCoupon}
                                            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                                        >
                                            {creatingCoupon
                                                ? "Creating..."
                                                : "Create Coupon"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats Row */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "0ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Coupons
                                            </p>
                                            <p className="text-3xl font-bold text-foreground mt-1">
                                                156
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Ticket className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "100ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Active
                                            </p>
                                            <p className="text-3xl font-bold text-foreground mt-1">
                                                142
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-success" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "200ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Uses
                                            </p>
                                            <p className="text-3xl font-bold text-foreground mt-1">
                                                12.4K
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                            <TrendingUp className="h-6 w-6 text-accent" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div
                            className="animate-slide-up opacity-0"
                            style={{
                                animationDelay: "300ms",
                                animationFillMode: "forwards",
                            }}
                        >
                            <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Avg. Discount
                                            </p>
                                            <p className="text-3xl font-bold text-foreground mt-1">
                                                27%
                                            </p>
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
                    <div
                        className="flex flex-col sm:flex-row gap-4 animate-fade-in"
                        style={{
                            animationDelay: "200ms",
                            animationFillMode: "forwards",
                        }}
                    >
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
                                <TabsTrigger value="all" className="px-4">
                                    All
                                </TabsTrigger>
                                <TabsTrigger value="active" className="px-4">
                                    Active
                                </TabsTrigger>
                                <TabsTrigger value="expired" className="px-4">
                                    Expired
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Coupons Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCoupons.map((coupon, index) => (
                            <div
                                key={coupon.id}
                                className="animate-slide-up opacity-0"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animationFillMode: "forwards",
                                }}
                            >
                                <CouponCard
                                    coupon={coupon}
                                    onCopy={handleCopy}
                                />
                            </div>
                        ))}
                    </section>

                    {!loadingCoupons && coupons.length === 0 && (
                        <div className="text-center py-12">
                            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                No coupons yet.
                            </p>
                        </div>
                    )}

                    {!loadingCoupons &&
                        coupons.length > 0 &&
                        filteredCoupons.length === 0 && (
                            <div className="text-center py-12">
                                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    No coupons found matching your search.
                                </p>
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
};

export default Coupons;

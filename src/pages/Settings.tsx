import { useCallback, useEffect, useState } from "react";
import {
    User,
    Send,
    Shield,
    MessageCircle,
    Check,
    X,
    Eye,
    EyeOff,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axiosInstance";

const Settings = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("profile");
    const [activeSection, setActiveSection] = useState<string>("profile");
    const [loadingProfile, setLoadingProfile] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    // Password reset states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    // Observe section visibility to highlight active link
    useEffect(() => {
        const ids = ["profile", "telegram", "security", "whatsapp"];
        const elements = ids
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];
        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Pick the entry nearest to the top when multiple intersect
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top
                    );
                const current = (visible[0] || entries[0])?.target as
                    | HTMLElement
                    | undefined;
                if (current?.id) setActiveSection(current.id);
            },
            {
                root: document.querySelector("main"),
                rootMargin: "-20% 0px -60% 0px",
                threshold: [0, 0.25, 0.5, 1],
            }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    // Load current profile
    const loadProfile = useCallback(async () => {
        setLoadingProfile(true);
        const candidates = ["/admins/me", "/admin/me", "/auth/me"]; // try in order
        let lastErr: any = null;
        for (const path of candidates) {
            try {
                const res = await api.get(path);
                // eslint-disable-next-line no-console
                console.log("[settings] load profile ok", path, res.status);
                const u = res.data || {};
                setFirstName(u.first_name || "");
                setLastName(u.last_name || "");
                setEmail(u.email || "");
                setPhone(u.phone_number || "");
                setBio(u.bio || "");
                setLoadingProfile(false);
                return; // success
            } catch (e: any) {
                lastErr = e;
                // eslint-disable-next-line no-console
                console.warn(
                    "[settings] load profile failed",
                    path,
                    e?.response?.status || e?.message
                );
            }
        }
        toast({
            title: "Failed to load profile",
            description:
                lastErr?.response?.data?.message ||
                lastErr?.message ||
                "Could not reach profile endpoint.",
            variant: "destructive",
        });
        setLoadingProfile(false);
    }, [toast]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                first_name: firstName,
                last_name: lastName,
                phone_number: phone || null,
                bio: bio || null,
            };
            // eslint-disable-next-line no-console
            console.log("[settings] patch /admins/me", payload);
            // Try multiple PATCH endpoints, first that works
            let res: any = null;
            let stored: any = null;
            try {
                stored = JSON.parse(
                    localStorage.getItem("auth:user") || "null"
                );
            } catch {}
            const uid = stored?.id || stored?._id || stored?.admin_id;
            const idPatch = uid ? [`/admins/${uid}`, `/admin/${uid}`] : [];
            const patchCandidates = [
                "/admins/me",
                "/admin/me",
                "/auth/me",
                ...idPatch,
            ];
            let lastErr: any = null;
            for (const path of patchCandidates) {
                try {
                    res = await api.patch(path, payload);
                    // eslint-disable-next-line no-console
                    console.log(
                        "[settings] saved ok (PATCH)",
                        path,
                        res.status
                    );
                    break;
                } catch (e: any) {
                    lastErr = e;
                    // eslint-disable-next-line no-console
                    console.warn(
                        "[settings] save failed (PATCH)",
                        path,
                        e?.response?.status || e?.message
                    );
                    // Try PUT fallback on same endpoint
                    try {
                        res = await api.put(path, payload);
                        // eslint-disable-next-line no-console
                        console.log(
                            "[settings] saved ok (PUT)",
                            path,
                            res.status
                        );
                        break;
                    } catch (e2: any) {
                        lastErr = e2;
                        // eslint-disable-next-line no-console
                        console.warn(
                            "[settings] save failed (PUT)",
                            path,
                            e2?.response?.status || e2?.message
                        );
                    }
                }
            }
            if (!res)
                throw lastErr || new Error("No matching endpoint for PATCH");
            // eslint-disable-next-line no-console
            console.log("[settings] saved", res.status, res.data);
            await loadProfile();
            toast({
                title: "Settings saved!",
                description: "Your changes have been saved successfully.",
            });
        } catch (e: any) {
            toast({
                title: "Failed to save settings",
                description: e?.response?.data?.message || e?.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleTestTelegram = () => {
        toast({
            title: "Test message sent",
            description: "Check your Telegram channel for the test message.",
        });
    };

    const handleTestWhatsApp = () => {
        toast({
            title: "Connection tested",
            description: "WhatsApp connection is working properly.",
        });
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        // Additional password strength validation can be added here
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return;
        }

        try {
            setSaving(true);
            await api.post("/auth/password-reset", {
                email: email,
                old_password: currentPassword,
                new_password: newPassword,
            });

            setPasswordSuccess("Password updated successfully!");
            // Reset form
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            toast({
                title: "Success",
                description: "Your password has been updated successfully.",
            });
        } catch (error: any) {
            console.error("Password reset failed:", error);
            const errorMessage =
                error?.response?.data?.message ||
                "Failed to update password. Please try again.";
            setPasswordError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

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
                    title="Settings"
                    subtitle="Manage your account and preferences"
                />

                <main className="flex-1 p-8 overflow-y-auto scroll-smooth">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sticky left navigation */}
                        <aside className="lg:col-span-3">
                            <div className="sticky">
                                <nav className="rounded-xl border border-border/60 bg-card/60 backdrop-blur p-2 shadow-sm">
                                    {[
                                        {
                                            id: "profile",
                                            label: "Profile",
                                            icon: <User className="h-4 w-4" />,
                                        },
                                        {
                                            id: "telegram",
                                            label: "Telegram",
                                            icon: <Send className="h-4 w-4" />,
                                        },
                                        {
                                            id: "security",
                                            label: "Security",
                                            icon: (
                                                <Shield className="h-4 w-4" />
                                            ),
                                        },
                                        {
                                            id: "whatsapp",
                                            label: "WhatsApp",
                                            icon: (
                                                <MessageCircle className="h-4 w-4" />
                                            ),
                                        },
                                    ].map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                                                ${
                                                    activeSection === item.id
                                                        ? "bg-primary/10 text-primary shadow-inner"
                                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                                }
                                            `}
                                        >
                                            <span className="shrink-0">
                                                {item.icon}
                                            </span>
                                            <span className="truncate">
                                                {item.label}
                                            </span>
                                            {activeSection === item.id && (
                                                <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Scrollable right content */}
                        <section className="lg:col-span-9 space-y-8">
                            {/* Profile */}
                            <div
                                id="profile"
                                className="scroll-mt-24 space-y-6"
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                                    <CardHeader>
                                        <CardTitle>
                                            Profile Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your personal details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">
                                                    First Name
                                                </Label>
                                                <Input
                                                    id="firstName"
                                                    value={firstName}
                                                    onChange={(e) =>
                                                        setFirstName(
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={loadingProfile}
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">
                                                    Last Name
                                                </Label>
                                                <Input
                                                    id="lastName"
                                                    value={lastName}
                                                    onChange={(e) =>
                                                        setLastName(
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={loadingProfile}
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                disabled
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                disabled={loadingProfile}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                placeholder="Tell us about yourself..."
                                                value={bio}
                                                onChange={(e) =>
                                                    setBio(e.target.value)
                                                }
                                                disabled={loadingProfile}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Telegram */}
                            <div
                                id="telegram"
                                className="scroll-mt-24 space-y-6"
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>
                                                    Telegram Integration
                                                </CardTitle>
                                                <CardDescription>
                                                    Send deals to your channel
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="bg-muted text-muted-foreground border-muted gap-1.5"
                                            >
                                                <X className="h-3 w-3" />
                                                Not Connected
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Send className="h-5 w-5 text-primary" />
                                                <span className="font-medium">
                                                    Telegram Bot
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Send deals to your channel
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="botToken">
                                                Bot Token
                                            </Label>
                                            <Input
                                                id="botToken"
                                                type="password"
                                                placeholder="Enter your Telegram bot token"
                                                className="h-11"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Get your bot token from
                                                @BotFather on Telegram
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="channelId">
                                                Channel/Chat ID
                                            </Label>
                                            <Input
                                                id="channelId"
                                                placeholder="Enter your channel or chat ID"
                                                className="h-11"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Use @username for public
                                                channels or numeric ID for
                                                private chats
                                            </p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={handleTestTelegram}
                                            className="gap-2"
                                        >
                                            <Send className="h-4 w-4" />
                                            Send Test Message
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Security */}
                            <div
                                id="security"
                                className="scroll-mt-24 space-y-6"
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>
                                            Update your account password
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            onSubmit={handlePasswordReset}
                                            className="space-y-4"
                                        >
                                            {passwordError && (
                                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                                    {passwordError}
                                                </div>
                                            )}
                                            {passwordSuccess && (
                                                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                                                    {passwordSuccess}
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">
                                                    Current Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPassword"
                                                        type={
                                                            showCurrentPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Enter current password"
                                                        className="h-11 pr-10"
                                                        value={currentPassword}
                                                        onChange={(e) =>
                                                            setCurrentPassword(
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() =>
                                                            setShowCurrentPassword(
                                                                !showCurrentPassword
                                                            )
                                                        }
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        type={
                                                            showNewPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Enter new password"
                                                        className="h-11 pr-10"
                                                        value={newPassword}
                                                        onChange={(e) =>
                                                            setNewPassword(
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() =>
                                                            setShowNewPassword(
                                                                !showNewPassword
                                                            )
                                                        }
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Must be at least 8
                                                    characters long
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">
                                                    Confirm New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={
                                                            showConfirmPassword
                                                                ? "text"
                                                                : "password"
                                                        }
                                                        placeholder="Confirm new password"
                                                        className="h-11 pr-10 w-full"
                                                        value={confirmPassword}
                                                        onChange={(e) =>
                                                            setConfirmPassword(
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword
                                                            )
                                                        }
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-5 w-5" />
                                                        ) : (
                                                            <Eye className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <Button
                                                    type="submit"
                                                    className="w-full h-11 bg-primary hover:bg-primary/90"
                                                    disabled={saving}
                                                >
                                                    {saving
                                                        ? "Updating..."
                                                        : "Update Password"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* WhatsApp */}
                            <div
                                id="whatsapp"
                                className="scroll-mt-24 space-y-6"
                            >
                                <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>
                                                    WhatsApp Integration
                                                </CardTitle>
                                                <CardDescription>
                                                    Send deals to WhatsApp
                                                    groups
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-success/20 text-success border-success/30 gap-1.5">
                                                <Check className="h-3 w-3" />
                                                Active
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                                                        <MessageCircle className="h-5 w-5 text-success" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            WhatsApp Connected
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            +1 (555) 123-4567
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-success/10 text-success border-success/30"
                                                >
                                                    Active
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="groupId">
                                                Broadcast Group ID
                                            </Label>
                                            <Input
                                                id="groupId"
                                                defaultValue="120363XXX@g.us"
                                                className="h-11"
                                            />
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={handleTestWhatsApp}
                                            className="gap-2"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            Test Connection
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>
                    </div>

                    {/* Save Button */}
                    <div
                        className="flex justify-end animate-fade-in"
                        style={{ animationDelay: "200ms" }}
                    >
                        <Button
                            onClick={handleSave}
                            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
                        >
                            <Check className="h-4 w-4" />
                            Save All Changes
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;

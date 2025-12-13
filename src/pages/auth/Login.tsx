import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [logoError, setLogoError] = useState(false);

    const bgUrl = "/login-bg.png"; // place file in public/login-bg.png
    const [bgAvailable, setBgAvailable] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        const img = new Image();
        img.onload = () => mounted && setBgAvailable(true);
        img.onerror = () => mounted && setBgAvailable(false);
        img.src = bgUrl;
        return () => {
            mounted = false;
        };
    }, [bgUrl]);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || "/";

    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            toast({
                title: "Login failed",
                description:
                    err?.response?.data?.message ||
                    err?.message ||
                    "Please check your credentials and try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">
            {/* Background image layer if available */}
            {bgAvailable && (
                <div
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-left-top bg-no-repeat"
                    style={{
                        backgroundImage: `url('${bgUrl}')`,
                        backgroundSize: "cover",
                    }}
                />
            )}
            {/* Light gradient overlay to match reference */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-white/80 via-white/85 to-white" />
            {/* Decorative subtle glow */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rounded-full bg-[#4CAF3D]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
                {/* Left visual/logo area */}
                <div className="relative lg:col-span-6 flex items-center justify-center py-12 lg:py-0">
                    <div className="relative z-10 flex flex-col items-center justify-center text-center gap-4">
                        {!logoError ? (
                            <img
                                src={logo}
                                alt="IJustPaid Logo"
                                className="w-40 sm:w-52 md:w-64 lg:w-72 drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-opacity duration-500"
                                loading="eager"
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <div className="flex items-center gap-3">
                                <ShieldCheck
                                    className="text-[#4CAF3D]"
                                    size={28}
                                />
                                <span className="text-2xl font-semibold text-gray-800">
                                    IJUSTPAID
                                </span>
                            </div>
                        )}
                        <p className="max-w-sm text-sm text-gray-600 hidden md:block">
                            Welcome back. Sign in to access your dashboard and
                            manage your marketing campaigns effortlessly.
                        </p>
                    </div>
                </div>

                {/* Right form card */}
                <div className="lg:col-span-6 flex items-center justify-center px-4 sm:px-6 md:px-8">
                    <Card className="w-full max-w-[460px] border-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_10px_30px_rgba(17,24,39,0.08)]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-[#4CAF3D]">
                                <Lock size={18} />
                                <CardTitle className="text-2xl font-semibold">
                                    Sign In
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="h-11 bg-[#F5F7F8] focus-visible:ring-[#4CAF3D]"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••••••••"
                                            className="h-11 pr-11 bg-[#F5F7F8] focus-visible:ring-[#4CAF3D]"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                        <button
                                            type="button"
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <Checkbox id="remember" />
                                        <span>Remember Me</span>
                                    </label>
                                    <a
                                        href="#"
                                        className="text-sm text-[#4CAF3D] hover:underline"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                                <CardFooter className="p-0 pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-[#4CAF3D] hover:bg-[#43a437] transition-transform active:scale-[0.99] disabled:opacity-60"
                                        disabled={submitting}
                                    >
                                        Sign In
                                    </Button>
                                </CardFooter>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;

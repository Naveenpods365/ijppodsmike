import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Scheduler from "./pages/Scheduler/Scheduler";
import Coupons from "./pages/Coupons";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen flex flex-col">
                <BrowserRouter>
                    <AuthProvider>
                        <div className="flex-1">
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/" element={<Index />} />
                                    <Route
                                        path="/scheduler"
                                        element={<Scheduler />}
                                    />
                                    <Route
                                        path="/coupons"
                                        element={<Coupons />}
                                    />
                                    <Route
                                        path="/settings"
                                        element={<Settings />}
                                    />
                                </Route>
                                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </div>
                    </AuthProvider>
                </BrowserRouter>
            </div>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;

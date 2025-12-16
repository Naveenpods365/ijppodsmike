import logo from "@/assets/logo.png";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ScrapingLoadingPopupProps {
    open: boolean;
}

const ScrapingLoadingPopup = ({ open }: ScrapingLoadingPopupProps) => {
    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none flex flex-col items-center justify-center pointer-events-none [&>button]:hidden">
                <div className="relative group">
                    {/* Glow effect behind logo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl opacity-100 animate-pulse-glow" />

                    <div className="relative flex flex-col items-center gap-6 p-8 rounded-3xl bg-sidebar-accent/30 border border-sidebar-border/50 backdrop-blur-md shadow-2xl">
                        <div className="relative animate-float">
                            <img
                                src={logo}
                                alt="Processing"
                                className="h-32 w-auto drop-shadow-2xl"
                            />
                            {/* Sparkle decorations */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-sidebar-primary rounded-full animate-bounce" />
                            <div
                                className="absolute -bottom-2 -left-2 w-3 h-3 bg-accent rounded-full animate-bounce"
                                style={{ animationDelay: "500ms" }}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-white tracking-tight animate-pulse">
                                Processing
                            </h2>
                            <p className="text-sm text-white/70">
                                Fetching the best deals for you...
                            </p>
                        </div>

                        {/* Loading Bar */}
                        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary via-accent to-primary w-full animate-loader"></div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ScrapingLoadingPopup;

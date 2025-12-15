import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { scrapeBestBuy, scrapeCostco, scrapeWalmart, setIsOpenScrapperSelectPopup } from "@/redux/slice/schedulerSlice";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const ScrapperSelectPopup = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const {
        isOpenScrapperSelectPopup,
        scrapeCostcoLoading,
        scrapeBestBuyLoading,
        scrapeWalmartLoading
    } = useSelector((state: any) => state.scheduler);

    const handleOpenChange = (open) => {
        dispatch(setIsOpenScrapperSelectPopup(open));
    };

    const handleScrape = async (scraperName, action, payload) => {
        try {
            await dispatch(action(payload)).unwrap();
            toast({
                title: "Success",
                description: `${scraperName} triggered successfully.`,
                variant: "default",
                className: "bg-success text-white border-none",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to trigger ${scraperName}: ${error || "Unknown error"}`,
                variant: "destructive",
            });
        }
    };

    const buttonStyle =
        "gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 w-full text-white";

    return (
        <Dialog open={isOpenScrapperSelectPopup} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/50 backdrop-blur-sm">
                <DialogHeader>
                    <DialogTitle>Select Scraper</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Button
                        className={buttonStyle}
                        onClick={() => handleScrape("Costco Scraper", scrapeCostco, { keyword: "OFF", max_pages: 2 })}
                        disabled={scrapeCostcoLoading}
                    >
                        {scrapeCostcoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Costco Scraper
                    </Button>
                    <Button
                        className={buttonStyle}
                        onClick={() => handleScrape("Best Buy Scraper", scrapeBestBuy, { collection_id: "16074", max_pages: 10 })}
                        disabled={scrapeBestBuyLoading}
                    >
                        {scrapeBestBuyLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Best Buy Scraper
                    </Button>
                    <Button
                        className={buttonStyle}
                        onClick={() => handleScrape("Walmart Scraper", scrapeWalmart, { keyword: "OFF", max_pages: 5 })}
                        disabled={scrapeWalmartLoading}
                    >
                        {scrapeWalmartLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Walmart Scraper
                    </Button>
                    <Button className={buttonStyle} onClick={() => console.log("Amazon Scraper")}>
                        Amazon Scraper
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ScrapperSelectPopup;

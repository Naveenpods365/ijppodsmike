import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getScheduledJobs, scheduleBestBuy, scheduleCostco, scheduleWalmart, setIsOpenAddSchedulerPopup } from "@/redux/slice/schedulerSlice";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const daysOfWeekOptions = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const AddSchedulerPopup = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const {
    isOpenAddSchedulerPopup,
    scheduleCostcoLoading,
    scheduleBestBuyLoading,
    scheduleWalmartLoading
  } = useSelector((state: any) => state.scheduler);

  const [step, setStep] = useState(1);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  // Form State
  const [jobId, setJobId] = useState("");
  const [time, setTime] = useState(""); // hh:mm format
  const [selectedDays, setSelectedDays] = useState([]);

  const handleOpenChange = (open) => {
    dispatch(setIsOpenAddSchedulerPopup(open));
    if (!open) {
      // Reset state on close
      setStep(1);
      setSelectedRetailer(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setJobId("");
    setTime("");
    setSelectedDays([]);
  };

  const handleRetailerSelect = (retailer) => {
    setSelectedRetailer(retailer);
    setStep(2);
  };

  const handleDayToggle = (dayId) => {
    if (dayId === "*") {
      if (selectedDays.includes("*")) {
        setSelectedDays([]);
      } else {
        setSelectedDays(["*"]);
      }
    } else {
      if (selectedDays.includes("*")) {
        setSelectedDays([dayId]);
      } else {
        if (selectedDays.includes(dayId)) {
          setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
          setSelectedDays([...selectedDays, dayId]);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!jobId || !time || selectedDays.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Job ID, Time, Days of Week).",
        variant: "destructive",
      });
      return;
    }

    const [hour, minute] = time.split(":").map(Number);
    const daysString = selectedDays.includes("*") ? "*" : selectedDays.join(",");

    const payload = {
      mode: "cron",
      job_id: jobId,
      hour,
      minute,
      days_of_week: daysString,
    };

    let action;
    if (selectedRetailer === "Costco") action = scheduleCostco;
    if (selectedRetailer === "Best Buy") action = scheduleBestBuy;
    if (selectedRetailer === "Walmart") action = scheduleWalmart;

    try {
      await dispatch(action(payload)).unwrap();
      toast({
        title: "Success",
        description: `Schedule for ${selectedRetailer} created successfully.`,
        variant: "default",
        className: "bg-success text-white border-none",
      });
      dispatch(getScheduledJobs());
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create schedule: ${error || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const buttonStyle = "gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 w-full text-white";
  const getLoadingState = () => {
    if (selectedRetailer === "Costco") return scheduleCostcoLoading;
    if (selectedRetailer === "Best Buy") return scheduleBestBuyLoading;
    if (selectedRetailer === "Walmart") return scheduleWalmartLoading;
    return false;
  };

  return (
    <Dialog open={isOpenAddSchedulerPopup} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 2 && (
              <Button variant="ghost" size="icon" className="mr-2 h-6 w-6" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 1 ? "Add New Schedule" : `${selectedRetailer} Schedule`}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              <Button className={buttonStyle} onClick={() => handleRetailerSelect("Costco")}>Costco Schedule</Button>
              <Button className={buttonStyle} onClick={() => handleRetailerSelect("Best Buy")}>Best Buy Schedule</Button>
              <Button className={buttonStyle} onClick={() => handleRetailerSelect("Walmart")}>Walmart Schedule</Button>
              <Button className={buttonStyle} onClick={() => console.log("Amazon Schedule")}>Amazon Schedule</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Job ID</Label>
                <Input placeholder="e.g. costco_daily_8am" value={jobId} onChange={(e) => setJobId(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  <div
                    className={`border rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${selectedDays.includes("*")
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-input"
                      }`}
                    onClick={() => handleDayToggle("*")}
                  >
                    Select All
                  </div>
                  {daysOfWeekOptions.map((day) => (
                    <div
                      key={day.id}
                      className={`border rounded-lg px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${(selectedDays.includes(day.id) || selectedDays.includes("*"))
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-background hover:bg-muted border-input"
                        } ${selectedDays.includes("*") ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => !selectedDays.includes("*") && handleDayToggle(day.id)}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className={`w-full ${buttonStyle}`}
                onClick={handleSubmit}
                disabled={getLoadingState()}
              >
                {getLoadingState() && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSchedulerPopup;

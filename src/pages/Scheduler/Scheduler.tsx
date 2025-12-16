import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useSchedulerMetricsWebSocket } from "@/hooks/useSchedulerMetricsWebSocket";
import { formatNextRunTime } from "@/lib/dateUtils";
import { getRecentRuns, getScheduledJobs, setIsOpenAddSchedulerPopup, setIsOpenScrapperSelectPopup, toggleSchedule } from "@/redux/slice/schedulerSlice";
import { Calendar, CheckCircle, Clock, Loader2, Play, Plus, Zap } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddSchedulerPopup from "./AddSchedulerPopup.tsx";
import DealsPopup from "./DealsPopup";
import ScrapingLoadingPopup from "./ScrapingLoadingPopup";
import ScrapperSelectPopup from "./ScrapperSelectPopup";

const durationSecondsToText = (seconds) => {
  if (typeof seconds !== 'number') return "-";
  const duration = moment.duration(seconds, 'seconds');
  const minutes = Math.floor(duration.asMinutes());
  const secs = Math.floor(duration.asSeconds()) % 60;
  return `${minutes}m ${secs}s`;
};

const formatNextRunInSeconds = (seconds) => {
  if (!seconds && seconds !== 0) return "-";
  const duration = moment.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = Math.floor(duration.minutes());
  return `${hours}h ${minutes}m`;
};

const Scheduler = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const {
    scheduledJobs,
    scheduledJobsLoading,
    recentRuns,
    recentRunsLoading,
    scrapeCostcoLoading,
    scrapeBestBuyLoading,
    scrapeWalmartLoading
  } = useSelector((state: any) => state.scheduler);

  const { metrics } = useSchedulerMetricsWebSocket();

  const isLoading = scrapeCostcoLoading || scrapeBestBuyLoading || scrapeWalmartLoading;

  const [showDealsPopup, setShowDealsPopup] = useState(false);

  useEffect(() => {
    dispatch(getScheduledJobs());
    dispatch(getRecentRuns());
  }, [dispatch]);

  const handleToggleSchedule = async (id, isActive) => {
    try {
      await dispatch(toggleSchedule({ id, is_active: isActive })).unwrap();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule status.",
        variant: "destructive",
      });
    }
  };

  const schedules = scheduledJobs?.map((job) => ({
    id: job.id,
    time: job.time,
    frequency: Array.isArray(job.days)
      ? job.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")
      : "Daily",
    active: job.is_active,
    retailers: job.retailer,
    next: formatNextRunTime(job.next_run),
  })) || [
      {
        time: "08:00 AM",
        frequency: "Daily",
        active: true,
        retailers: "Amazon.ca",
        next: "Tomorrow at 8:00 AM",
      },
      {
        time: "12:00 PM",
        frequency: "Daily",
        active: true,
        retailers: "BestBuy.ca",
        next: "Today at 12:00 PM",
      },
    ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen relative">
        <Header title="Scheduler" subtitle="Automate your deal broadcasts" />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* Scheduler Status Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/20">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-success">Scheduler Active</span>
              </div>
            </div>
            <Button
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
              onClick={() => dispatch(setIsOpenScrapperSelectPopup(true))}
            >
              <Play className="h-4 w-4" />
              Get New Deals
            </Button>
          </div>

          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "0ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Schedules</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{metrics.active_schedules}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Next Run</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{formatNextRunInSeconds(metrics.next_run_in_seconds)}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Runs Today</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{metrics.runs_today}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-up opacity-0" style={{ animationDelay: "300ms", animationFillMode: 'forwards' }}>
              <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{metrics.success_rate.toFixed(1)}%</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Scheduled Runs */}
          <section className="animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: 'forwards' }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Scheduled Runs</CardTitle>
                <Button
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
                  onClick={() => dispatch(setIsOpenAddSchedulerPopup(true))}
                >
                  <Plus className="h-4 w-4" />
                  Add New Schedule
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/50 transition-colors">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[80px]">
                          <p className="text-lg font-bold text-foreground">{schedule.time}</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[120px] truncate" title={schedule.frequency}>{schedule.frequency}</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <Switch checked={schedule.active} onCheckedChange={(checked) => handleToggleSchedule(schedule.id, checked)} />
                          <Badge variant={schedule.active ? "default" : "secondary"} className={schedule.active ? "bg-success/20 text-success border-success/30" : ""}>
                            {schedule.active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Retailers</p>
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs">

                          <Badge variant="outline" className="text-xs">
                            {schedule.retailers}
                          </Badge>

                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Next: {schedule.next}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Recent Runs Table */}
          <section className="animate-slide-up opacity-0" style={{ animationDelay: "400ms", animationFillMode: 'forwards' }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                {recentRunsLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/50 transition-colors">
                    <Table>
                      <TableHeader className="bg-background sticky top-0 z-10">
                        <TableRow className="border-border/50">
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Deals Found</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentRuns?.map((run, index) => (
                          <TableRow
                            key={index}
                            className="border-border/50 animate-fade-in hover:bg-muted/50 cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                            onClick={() => setShowDealsPopup(true)}
                          >
                            <TableCell className="font-medium">{formatNextRunTime(run.finished_at)}</TableCell>
                            <TableCell>{run.deals_found}</TableCell>
                            <TableCell>{run.sent}</TableCell>
                            <TableCell>{durationSecondsToText(run.duration_seconds)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  run.status === "success"
                                    ? "bg-success/10 text-success border-success/30"
                                    : run.status === "partial"
                                      ? "bg-warning/10 text-warning border-warning/30"
                                      : "bg-destructive/10 text-destructive border-destructive/30"
                                }
                              >
                                {run.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
      <ScrapperSelectPopup />
      <AddSchedulerPopup />
      <ScrapperSelectPopup />
      <AddSchedulerPopup />
      <DealsPopup open={showDealsPopup} onOpenChange={setShowDealsPopup} />
      <ScrapingLoadingPopup open={isLoading} />
    </div>
  );
};

export default Scheduler;

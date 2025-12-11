import { Clock, Play, Calendar, CheckCircle, Pause, Plus, Zap } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schedules = [
  {
    time: "08:00 AM",
    frequency: "Daily",
    active: true,
    retailers: ["Amazon.ca", "Walmart.ca"],
    next: "Tomorrow at 8:00 AM",
  },
  {
    time: "12:00 PM",
    frequency: "Daily",
    active: true,
    retailers: ["BestBuy.ca", "Costco.ca"],
    next: "Today at 12:00 PM",
  },
  {
    time: "06:00 PM",
    frequency: "Daily",
    active: true,
    retailers: ["Amazon.ca", "BestBuy.ca", "Walmart.ca", "Costco.ca"],
    next: "Today at 6:00 PM",
  },
  {
    time: "11:00 PM",
    frequency: "Daily",
    active: false,
    retailers: ["Amazon.ca"],
    next: "Paused",
  },
];

const recentRuns = [
  { date: "Today, 8:00 AM", found: 234, sent: 234, duration: "2m 34s", status: "Success" },
  { date: "Yesterday, 6:00 PM", found: 189, sent: 189, duration: "2m 12s", status: "Success" },
  { date: "Yesterday, 12:00 PM", found: 156, sent: 156, duration: "1m 58s", status: "Success" },
  { date: "Yesterday, 8:00 AM", found: 201, sent: 198, duration: "2m 45s", status: "Partial" },
  { date: "2 days ago, 6:00 PM", found: 0, sent: 0, duration: "0m 15s", status: "Failed" },
];

const Scheduler = () => {
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
            <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
              <Play className="h-4 w-4" />
              Run Now
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
                      <p className="text-3xl font-bold text-foreground mt-1">3</p>
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
                      <p className="text-3xl font-bold text-foreground mt-1">2h 15m</p>
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
                      <p className="text-3xl font-bold text-foreground mt-1">2</p>
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
                      <p className="text-3xl font-bold text-foreground mt-1">98.5%</p>
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
              </CardHeader>
              <CardContent className="space-y-4">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-foreground">{schedule.time}</p>
                          <p className="text-xs text-muted-foreground">{schedule.frequency}</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <Switch checked={schedule.active} />
                          <Badge variant={schedule.active ? "default" : "secondary"} className={schedule.active ? "bg-success/20 text-success border-success/30" : ""}>
                            {schedule.active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Retailers</p>
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                          {schedule.retailers.map((retailer, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {retailer}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Next: {schedule.next}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Schedule Button */}
                <Button variant="outline" className="w-full gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5">
                  <Plus className="h-4 w-4" />
                  Add New Schedule
                </Button>
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Deals Found</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRuns.map((run, index) => (
                      <TableRow 
                        key={index} 
                        className="border-border/50 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                      >
                        <TableCell className="font-medium">{run.date}</TableCell>
                        <TableCell>{run.found}</TableCell>
                        <TableCell>{run.sent}</TableCell>
                        <TableCell>{run.duration}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              run.status === "Success" 
                                ? "bg-success/10 text-success border-success/30" 
                                : run.status === "Partial"
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
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Scheduler;

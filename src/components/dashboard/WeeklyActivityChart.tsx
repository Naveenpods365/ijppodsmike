import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { day: "Mon", value: 1234 },
  { day: "Tue", value: 1567 },
  { day: "Wed", value: 1423 },
  { day: "Thu", value: 1789 },
  { day: "Fri", value: 2134 },
  { day: "Sat", value: 2456 },
  { day: "Sun", value: 1884 },
];

export const WeeklyActivityChart = () => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="group relative bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-50" />

      <div className="relative flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Weekly Activity</h3>
          <p className="text-sm text-muted-foreground mt-1">Deal distribution this week</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-sm font-semibold text-success">+18%</span>
        </div>
      </div>

      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="15%">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              width={45}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.5)", radius: 8 }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
                padding: "12px 16px",
              }}
              labelStyle={{ color: "hsl(var(--card-foreground))", fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: "hsl(var(--primary))" }}
              formatter={(value: number) => [`${value.toLocaleString()} deals`, '']}
            />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 4, 4]}
              maxBarSize={50}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.value === maxValue ? "url(#barGradientHover)" : "url(#barGradient)"}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="relative flex justify-center gap-6 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-b from-primary to-accent" />
          <span className="text-xs text-muted-foreground">Daily Deals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-b from-accent to-primary" />
          <span className="text-xs text-muted-foreground">Peak Day</span>
        </div>
      </div>
    </div>
  );
};

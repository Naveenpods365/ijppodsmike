import { AUTH_TOKEN_KEY } from "@/lib/axiosInstance";
import { useEffect, useRef, useState } from "react";

export type SchedulerMetrics = {
    active_schedules: number;
    next_run_in_seconds: number;
    runs_today: number;
    success_rate: number;
};

type WebSocketMessage = {
    type: string;
    scheduler_active: boolean;
    active_schedules: number;
    next_run_in_seconds: number;
    runs_today: number;
    success_rate: number;
    generated_at: string;
};

export const useSchedulerMetricsWebSocket = () => {
    const [metrics, setMetrics] = useState<SchedulerMetrics>({
        active_schedules: 0,
        next_run_in_seconds: 0,
        runs_today: 0,
        success_rate: 0,
    });
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return;

            const wsUrl = `wss://dealscraper.rohans.uno/api/ws/scheduler/overview?token=${token}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("Scheduler Overview WebSocket Connected");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    if (data.type === "scheduler_overview") {
                        setMetrics({
                            active_schedules: data.active_schedules,
                            next_run_in_seconds: data.next_run_in_seconds,
                            runs_today: data.runs_today,
                            success_rate: data.success_rate,
                        });
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onclose = () => {
                console.log("Scheduler Overview WebSocket Disconnected");
                setIsConnected(false);
                //reconnect after 5 seconds
                setTimeout(() => {
                    if (wsRef.current?.readyState === WebSocket.CLOSED) {
                        connect();
                    }
                }, 5000);
            };

            ws.onerror = (error) => {
                console.error("Scheduler Overview WebSocket Error:", error);
                ws.close();
            };

            wsRef.current = ws;
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    return { metrics, isConnected };
};

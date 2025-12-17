import { AUTH_TOKEN_KEY } from "@/lib/axiosInstance";
import { useEffect, useRef, useState } from "react";

export type DashboardTilesPayload = {
    total_deals: number;
    deals_sent: number;
    top_category: {
        name: string;
        count: number;
    };
    active_groups: number;
    avg_discount_pct: number;
    next_run_in_seconds: number | null;
};

type WebSocketMessage = {
    type: string;
    payload: DashboardTilesPayload;
};

export const useDashboardMetricsWebSocket = () => {
    const [metrics, setMetrics] = useState<DashboardTilesPayload | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return;

            const wsUrl = `wss://dealscraper.rohans.uno/api/ws/dashboard/tiles?token=${token}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("Dashboard Tiles WebSocket Connected");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    if (data.type === "dashboard_tiles") {
                        setMetrics(data.payload);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onclose = () => {
                console.log("Dashboard Tiles WebSocket Disconnected");
                setIsConnected(false);
                // reconnect after 5 seconds
                setTimeout(() => {
                    if (wsRef.current?.readyState === WebSocket.CLOSED) {
                        connect();
                    }
                }, 5000);
            };

            ws.onerror = (error) => {
                console.error("Dashboard Tiles WebSocket Error:", error);
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

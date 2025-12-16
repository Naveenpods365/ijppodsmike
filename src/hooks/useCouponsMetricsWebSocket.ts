import { AUTH_TOKEN_KEY } from "@/lib/axiosInstance";
import { useEffect, useRef, useState } from "react";

export type CouponsMetrics = {
    total_coupons: number;
    active_coupons: number;
    total_uses: number;
    avg_discount: number;
};

type WebSocketMessage = {
    type: string;
    metrics: CouponsMetrics;
    generated_at: string;
};

export const useCouponsMetricsWebSocket = () => {
    const [metrics, setMetrics] = useState<CouponsMetrics>({
        total_coupons: 0,
        active_coupons: 0,
        total_uses: 0,
        avg_discount: 0,
    });
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) return;

            const wsUrl = `wss://dealscraper.rohans.uno/api/ws/coupons/metrics?token=${token}`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("Coupons Metrics WebSocket Connected");
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);
                    if (data.type === "coupons_metrics" && data.metrics) {
                        console.log(data)
                        setMetrics({
                            total_coupons: data.metrics.total_coupons,
                            active_coupons: data.metrics.active_coupons,
                            total_uses: data.metrics.total_uses,
                            avg_discount: data.metrics.avg_discount,
                        });
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };

            ws.onclose = () => {
                console.log("Coupons Metrics WebSocket Disconnected");
                setIsConnected(false);
                // Simple reconnect logic after 5 seconds
                setTimeout(() => {
                    if (wsRef.current?.readyState === WebSocket.CLOSED) {
                        connect();
                    }
                }, 5000);
            };

            ws.onerror = (error) => {
                console.error("Coupons Metrics WebSocket Error:", error);
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

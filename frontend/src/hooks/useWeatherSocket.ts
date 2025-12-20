'use client';

/**
 * useWeatherSocket Hook
 * =====================
 * Custom hook for WebSocket connection to the sensor stream.
 * Handles connection, reconnection, and data parsing.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useSensorStore } from '@/store/useSensorStore';
import { WS_URL } from '@/lib/utils';

interface WebSocketPayload {
    farm_id: string;
    sensors: {
        temperature: number;
        humidity: number;
        pressure: number;
        soil_moisture: number;
        rainfall: number;
        wind_speed?: number;
        is_raining: boolean;
        simulation_tick: number;
        timestamp: string;
    };
    alerts: Array<{
        type: string;
        severity: string;
        title: string;
        message: string;
    }>;
    simulation_status: string;
}

interface UseWeatherSocketOptions {
    farmId: string;
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export function useWeatherSocket({
    farmId,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
}: UseWeatherSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        setConnectionStatus,
        updateReadings,
        addAlert,
        setSimulationStatus,
    } = useSensorStore();

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setConnectionStatus('connecting');

        try {
            const ws = new WebSocket(`${WS_URL}/ws/sensors/${farmId}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('🌱 Connected to Agri-Nexus sensor stream');
                setConnectionStatus('connected');
                reconnectAttemptsRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketPayload = JSON.parse(event.data);

                    // Skip connection confirmation messages
                    if ('type' in data && data.type === 'connection') {
                        return;
                    }

                    // Update sensor readings
                    if (data.sensors) {
                        updateReadings(data.sensors);
                    }

                    // Process alerts
                    if (data.alerts && data.alerts.length > 0) {
                        data.alerts.forEach((alert) => {
                            addAlert({
                                type: alert.type as 'CRITICAL_DRY' | 'STORM_WARNING' | 'HEAT_WARNING' | 'FROST_WARNING' | 'DISEASE_RISK',
                                severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
                                title: alert.title,
                                message: alert.message,
                            });
                        });
                    }

                    // Update simulation status
                    if (data.simulation_status) {
                        setSimulationStatus(data.simulation_status);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                setConnectionStatus('disconnected');
                wsRef.current = null;

                // Attempt reconnection with exponential backoff
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const backoffTime = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current);
                    console.log(`Reconnecting in ${backoffTime}ms...`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, backoffTime);
                } else {
                    setConnectionStatus('error');
                    console.error('Max reconnection attempts reached');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setConnectionStatus('error');
        }
    }, [farmId, setConnectionStatus, updateReadings, addAlert, setSimulationStatus, reconnectInterval, maxReconnectAttempts]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        setConnectionStatus('disconnected');
    }, [setConnectionStatus]);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        connect,
        disconnect,
        isConnected: useSensorStore((state) => state.isConnected),
        connectionStatus: useSensorStore((state) => state.connectionStatus),
    };
}

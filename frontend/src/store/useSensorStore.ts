/**
 * Sensor Store
 * ============
 * Zustand store for managing real-time sensor data and alerts.
 */

import { create } from 'zustand';

// Types
export interface SensorReading {
    temperature: number;
    humidity: number;
    pressure: number;
    soil_moisture: number;
    rainfall: number;
    wind_speed?: number;
    is_raining: boolean;
    simulation_tick: number;
    timestamp: string;
}

export interface Alert {
    id: string;
    type: 'CRITICAL_DRY' | 'STORM_WARNING' | 'HEAT_WARNING' | 'FROST_WARNING' | 'DISEASE_RISK';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: Date;
}

interface HistoricalDataPoint {
    time: string;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    pressure: number;
    [key: string]: string | number;
}

interface SensorState {
    // Connection status
    isConnected: boolean;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

    // Current readings
    currentReadings: SensorReading | null;

    // Historical data (for charts)
    historicalData: HistoricalDataPoint[];
    maxHistoricalPoints: number;

    // Alerts
    alerts: Alert[];

    // Simulation info
    simulationStatus: string;

    // Actions
    setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
    updateReadings: (readings: SensorReading) => void;
    addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
    dismissAlert: (id: string) => void;
    clearAlerts: () => void;
    setSimulationStatus: (status: string) => void;
    reset: () => void;
}

export const useSensorStore = create<SensorState>((set, get) => ({
    // Initial state
    isConnected: false,
    connectionStatus: 'disconnected',
    currentReadings: null,
    historicalData: [],
    maxHistoricalPoints: 100,
    alerts: [],
    simulationStatus: 'standby',

    // Actions
    setConnectionStatus: (status) =>
        set({
            connectionStatus: status,
            isConnected: status === 'connected',
        }),

    updateReadings: (readings) => {
        const { historicalData, maxHistoricalPoints } = get();

        // Create new historical data point
        const newPoint: HistoricalDataPoint = {
            time: new Date().toLocaleTimeString(),
            temperature: readings.temperature,
            humidity: readings.humidity,
            soil_moisture: readings.soil_moisture,
            pressure: readings.pressure,
        };

        // Add to history, keeping only last N points
        const newHistory = [...historicalData, newPoint].slice(-maxHistoricalPoints);

        set({
            currentReadings: readings,
            historicalData: newHistory,
        });
    },

    addAlert: (alertData) => {
        const newAlert: Alert = {
            ...alertData,
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
        };

        set((state) => ({
            alerts: [...state.alerts.slice(-9), newAlert], // Keep max 10 alerts
        }));
    },

    dismissAlert: (id) =>
        set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id),
        })),

    clearAlerts: () => set({ alerts: [] }),

    setSimulationStatus: (status) => set({ simulationStatus: status }),

    reset: () =>
        set({
            isConnected: false,
            connectionStatus: 'disconnected',
            currentReadings: null,
            historicalData: [],
            alerts: [],
            simulationStatus: 'standby',
        }),
}));

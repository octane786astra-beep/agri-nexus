/**
 * Simulation Mode Store
 * =====================
 * Global store for managing full simulation mode state.
 * When enabled, the app uses mock data instead of API calls.
 */

import { create } from 'zustand';

interface SimulationModeState {
    // Whether full simulation mode is active
    isSimulationMode: boolean;

    // Toggle simulation mode on/off
    toggleSimulationMode: () => void;

    // Explicitly set simulation mode
    setSimulationMode: (enabled: boolean) => void;
}

export const useSimulationModeStore = create<SimulationModeState>((set) => ({
    isSimulationMode: false,

    toggleSimulationMode: () => set((state) => ({
        isSimulationMode: !state.isSimulationMode
    })),

    setSimulationMode: (enabled) => set({ isSimulationMode: enabled }),
}));

/**
 * API Client
 * ==========
 * HTTP client for communicating with the FastAPI backend.
 */

import { API_URL } from './utils';

// Types
export interface FullScanRequest {
    lat: number;
    lon: number;
    farm_size?: number;
    budget?: number;
    soil_type?: string;
}

export interface CropFeasibility {
    crop_name: string;
    feasibility_score: number;
    roi_estimate?: number;
    growing_season?: string;
    requirements: Record<string, string>;
    risks: string[];
}

export interface RiskAssessment {
    risk_type: string;
    probability: number;
    description: string;
    mitigation?: string;
}

export interface FullScanResponse {
    location: {
        city?: string;
        state?: string;
        country?: string;
        elevation_meters?: number;
        terrain_type?: string;
    };
    soil_analysis: Record<string, unknown>;
    weather_analysis: {
        current: Record<string, unknown>;
        estimated_annual_rainfall: number;
        climate_zone: string;
        current_alerts: unknown[];
        trends?: {
            monthly_temperature: Array<{ month: string; avg_temp: number }>;
            monthly_rainfall: Array<{ month: string; rainfall_mm: number }>;
            annual_rainfall_mm: number;
            seasons: Record<string, { period: string; conditions: string; suitable_crops: string[] }>;
            current_season: string;
            climate_summary: string;
        };
    };
    crop_recommendations: CropFeasibility[];
    risks: RiskAssessment[];
    economic_analysis?: Record<string, unknown>;
    market_analysis?: {
        crop_analysis: Array<{
            crop: string;
            current_price_per_quintal: number | string;
            msp_per_quintal?: number | string;
            price_trend: string;
            price_change_percent: number;
            demand_level: string;
            supply_status: string;
            export_potential?: string;
            market_outlook: string;
        }>;
        regional_market: {
            major_market: string;
            specialty: string;
        };
        market_summary: string;
        best_time_to_sell: string;
        price_source: string;
    };
    generated_at: string;
}

export interface ROIResponse {
    crop: string;
    farm_size_acres: number;
    analysis: {
        yield_per_acre_kg: number;
        total_yield_kg: number;
        market_price_per_kg: number;
        gross_revenue: number;
        estimated_cost: number;
        net_profit: number;
        roi_percentage: number;
        growing_days: number;
    };
    investment_status: string;
    breakeven_price: number;
}

export interface SimulationState {
    tick_count: number;
    virtual_hour: number;
    virtual_time: string;
    environment: {
        temperature: number;
        humidity: number;
        pressure: number;
        soil_moisture: number;
        rainfall: number;
    };
    weather: {
        is_raining: boolean;
        rain_intensity: number;
        rain_ticks_remaining: number;
        wind_speed: number;
    };
    alerts: Array<{
        type: string;
        severity: string;
        title: string;
        message: string;
    }>;
}

// API Client Class
class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `API Error: ${response.status}`);
        }

        return response.json();
    }

    // Health Check
    async healthCheck(): Promise<{ status: string; message: string }> {
        return this.request('/api/health');
    }

    // Test Connectivity
    async testConnection(): Promise<{ success: boolean; message: string }> {
        return this.request('/api/v1/test');
    }

    // ============================================
    // Research Endpoints
    // ============================================

    async fullScan(data: FullScanRequest): Promise<FullScanResponse> {
        return this.request('/api/research/full-scan', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCropRecommendations(params: {
        soil_type?: string;
        temp?: number;
        humidity?: number;
        rainfall?: number;
        limit?: number;
    }): Promise<{ recommendations: CropFeasibility[] }> {
        const query = new URLSearchParams();
        if (params.soil_type) query.set('soil_type', params.soil_type);
        if (params.temp) query.set('temp', params.temp.toString());
        if (params.humidity) query.set('humidity', params.humidity.toString());
        if (params.rainfall) query.set('rainfall', params.rainfall.toString());
        if (params.limit) query.set('limit', params.limit.toString());

        return this.request(`/api/research/crops?${query.toString()}`);
    }

    async calculateROI(
        crop: string,
        acres: number,
        budget: number
    ): Promise<ROIResponse> {
        return this.request(
            `/api/analysis/roi?crop=${encodeURIComponent(crop)}&acres=${acres}&budget=${budget}`,
            { method: 'POST' }
        );
    }

    async geoLookup(
        lat: number,
        lon: number
    ): Promise<{
        city?: string;
        state?: string;
        country?: string;
        elevation_meters?: number;
        terrain_type?: string;
        slope?: { percentage: number; recommendation: string };
        frost_risk?: { is_prone: boolean; message: string };
    }> {
        return this.request(`/api/geo/lookup?lat=${lat}&lon=${lon}`);
    }

    // ============================================
    // Simulation Control Endpoints
    // ============================================

    async getSimulationState(): Promise<SimulationState> {
        return this.request('/api/sim/state');
    }

    async triggerRain(intensity?: number, duration?: number): Promise<{ success: boolean; message: string }> {
        return this.request('/api/sim/rain', {
            method: 'POST',
            body: JSON.stringify({ intensity, duration }),
        });
    }

    async triggerDrought(): Promise<{ success: boolean; message: string }> {
        return this.request('/api/sim/drought', { method: 'POST' });
    }

    async resetSimulation(): Promise<{ success: boolean; message: string }> {
        return this.request('/api/sim/reset', { method: 'POST' });
    }

    async timeJump(hours: number): Promise<{ success: boolean; new_time: string }> {
        return this.request(`/api/sim/time-jump?hours=${hours}`, { method: 'POST' });
    }
}

// Export singleton instance
export const api = new ApiClient();

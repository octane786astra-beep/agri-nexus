'use client';

/**
 * Irrigation Scheduler Component
 * ==============================
 * Smart irrigation recommendations based on sensor data.
 */

import { useSensorStore } from '@/store/useSensorStore';

interface CropWaterNeed {
    crop: string;
    waterPerDay: number;
    nextWatering: string;
    status: 'urgent' | 'soon' | 'ok';
}

export default function IrrigationScheduler() {
    const { currentReadings } = useSensorStore();
    const soilMoisture = currentReadings?.soil_moisture || 50;
    const temperature = currentReadings?.temperature || 28;

    const waterNeeded = soilMoisture < 40;
    const urgentWater = soilMoisture < 25;

    const crops: CropWaterNeed[] = [
        {
            crop: 'Rice Paddy',
            waterPerDay: 8,
            nextWatering: waterNeeded ? 'Now!' : '2 hours',
            status: urgentWater ? 'urgent' : waterNeeded ? 'soon' : 'ok'
        },
        {
            crop: 'Vegetables',
            waterPerDay: 5,
            nextWatering: waterNeeded ? '30 min' : '4 hours',
            status: waterNeeded ? 'soon' : 'ok'
        },
        {
            crop: 'Fruit Trees',
            waterPerDay: 12,
            nextWatering: '6 hours',
            status: 'ok'
        },
    ];

    const totalWaterToday = crops.reduce((sum, c) => sum + c.waterPerDay, 0);

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">water_drop</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold">Irrigation</h3>
                    <p className="text-white/50 text-xs">Smart water management</p>
                </div>
            </div>

            {/* Current Status */}
            <div className={`p-4 rounded-2xl mb-5 ${urgentWater
                    ? 'bg-red-500/15 border border-red-500/30'
                    : waterNeeded
                        ? 'bg-amber-500/15 border border-amber-500/30'
                        : 'bg-emerald-500/15 border border-emerald-500/30'
                }`}>
                <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-medium ${urgentWater ? 'text-red-400' : waterNeeded ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                        {urgentWater ? '⚠️ URGENT: Water Now!' : waterNeeded ? '💧 Watering Soon' : '✓ Moisture OK'}
                    </span>
                    <span className="text-white/60 text-xs">{soilMoisture.toFixed(0)}% moisture</span>
                </div>

                {/* Moisture Gauge */}
                <div className="h-3 bg-black/20 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${urgentWater
                                ? 'bg-gradient-to-r from-red-400 to-red-500'
                                : waterNeeded
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                    : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            }`}
                        style={{ width: `${soilMoisture}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-white/40">
                    <span>Dry</span>
                    <span>Optimal</span>
                    <span>Wet</span>
                </div>
            </div>

            {/* Daily Water Usage */}
            <div className="p-3 rounded-xl bg-white/5 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Daily water requirement</span>
                    <span className="text-cyan-400 font-bold">{totalWaterToday} L/m²</span>
                </div>
            </div>

            {/* Crop Schedule */}
            <h4 className="text-white/50 text-xs font-medium mb-3">CROP SCHEDULE</h4>
            <div className="space-y-2">
                {crops.map((crop) => (
                    <div
                        key={crop.crop}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all"
                    >
                        <div>
                            <p className="text-white text-sm font-medium">{crop.crop}</p>
                            <p className="text-white/40 text-xs">{crop.waterPerDay} L/m² daily</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-medium ${crop.status === 'urgent' ? 'text-red-400' :
                                    crop.status === 'soon' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                {crop.nextWatering}
                            </p>
                            <p className="text-white/30 text-[10px]">next water</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Temperature Impact */}
            <div className="mt-5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex gap-2">
                    <span className="material-icons-round text-blue-400 text-sm">thermostat</span>
                    <div>
                        <p className="text-blue-200/80 text-xs">
                            At {temperature.toFixed(0)}°C, evaporation is {temperature > 35 ? 'high' : 'moderate'}.
                            {temperature > 35 && ' Consider evening irrigation to reduce water loss.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

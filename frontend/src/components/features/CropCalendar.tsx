'use client';

/**
 * Crop Calendar Component
 * =======================
 * Shows planting and harvesting timeline for seasonal crops.
 */

import { useState, useEffect } from 'react';

interface CropSeason {
    name: string;
    plantMonth: string;
    harvestMonth: string;
    duration: string;
    icon: string;
    status: 'active' | 'upcoming' | 'completed';
}

const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) return 'Kharif';
    if (month >= 10 || month <= 2) return 'Rabi';
    return 'Zaid';
};

const cropData: Record<string, CropSeason[]> = {
    'Kharif': [
        { name: 'Rice', plantMonth: 'June', harvestMonth: 'Nov', duration: '120-150 days', icon: '🌾', status: 'active' },
        { name: 'Cotton', plantMonth: 'May', harvestMonth: 'Dec', duration: '150-180 days', icon: '🌿', status: 'active' },
        { name: 'Maize', plantMonth: 'June', harvestMonth: 'Sep', duration: '90-110 days', icon: '🌽', status: 'completed' },
        { name: 'Groundnut', plantMonth: 'June', harvestMonth: 'Oct', duration: '100-130 days', icon: '🥜', status: 'active' },
    ],
    'Rabi': [
        { name: 'Wheat', plantMonth: 'Nov', harvestMonth: 'Apr', duration: '120-150 days', icon: '🌾', status: 'upcoming' },
        { name: 'Mustard', plantMonth: 'Oct', harvestMonth: 'Feb', duration: '110-140 days', icon: '🌼', status: 'upcoming' },
        { name: 'Chickpea', plantMonth: 'Oct', harvestMonth: 'Mar', duration: '100-140 days', icon: '🫘', status: 'upcoming' },
        { name: 'Potato', plantMonth: 'Oct', harvestMonth: 'Feb', duration: '90-120 days', icon: '🥔', status: 'upcoming' },
    ],
    'Zaid': [
        { name: 'Watermelon', plantMonth: 'Mar', harvestMonth: 'Jun', duration: '80-100 days', icon: '🍉', status: 'upcoming' },
        { name: 'Cucumber', plantMonth: 'Feb', harvestMonth: 'May', duration: '55-70 days', icon: '🥒', status: 'upcoming' },
        { name: 'Muskmelon', plantMonth: 'Feb', harvestMonth: 'May', duration: '70-90 days', icon: '🍈', status: 'upcoming' },
    ],
};

export default function CropCalendar() {
    const [season, setSeason] = useState(getCurrentSeason());
    const seasons = ['Kharif', 'Rabi', 'Zaid'];

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">calendar_month</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold">Crop Calendar</h3>
                    <p className="text-white/50 text-xs">Season: {season}</p>
                </div>
            </div>

            {/* Season Tabs */}
            <div className="flex gap-2 mb-5">
                {seasons.map((s) => (
                    <button
                        key={s}
                        onClick={() => setSeason(s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${season === s
                                ? 'bg-white/15 text-white'
                                : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Crop List */}
            <div className="space-y-3">
                {cropData[season]?.map((crop) => (
                    <div
                        key={crop.name}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{crop.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-white font-medium text-sm">{crop.name}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${crop.status === 'active'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : crop.status === 'upcoming'
                                                ? 'bg-amber-500/20 text-amber-400'
                                                : 'bg-white/10 text-white/50'
                                        }`}>
                                        {crop.status}
                                    </span>
                                </div>
                                <p className="text-white/40 text-xs mt-1">
                                    {crop.plantMonth} → {crop.harvestMonth} • {crop.duration}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {crop.status === 'active' && (
                            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                    style={{ width: '65%' }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tips */}
            <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-2">
                    <span className="material-icons-round text-amber-400 text-sm">lightbulb</span>
                    <p className="text-amber-200/80 text-xs">
                        {season === 'Kharif' && 'Monitor monsoon patterns for irrigation planning'}
                        {season === 'Rabi' && 'Prepare land after Kharif harvest for winter crops'}
                        {season === 'Zaid' && 'Ensure irrigation - no monsoon support in summer'}
                    </p>
                </div>
            </div>
        </div>
    );
}

'use client';

/**
 * Market Prices Component
 * =======================
 * Live mandi prices for crops.
 */

import { useState } from 'react';

interface CropPrice {
    crop: string;
    icon: string;
    price: number;
    msp: number | null;
    change: number;
    unit: string;
}

const marketData: CropPrice[] = [
    { crop: 'Rice (Paddy)', icon: '🌾', price: 2450, msp: 2183, change: 5.2, unit: 'quintal' },
    { crop: 'Wheat', icon: '🌾', price: 2380, msp: 2125, change: -1.8, unit: 'quintal' },
    { crop: 'Cotton', icon: '🌿', price: 7350, msp: 6620, change: 8.3, unit: 'quintal' },
    { crop: 'Sugarcane', icon: '🎋', price: 365, msp: 315, change: 2.1, unit: 'quintal' },
    { crop: 'Soybean', icon: '🫘', price: 5200, msp: 4600, change: -3.5, unit: 'quintal' },
    { crop: 'Groundnut', icon: '🥜', price: 6950, msp: 6377, change: 4.7, unit: 'quintal' },
    { crop: 'Onion', icon: '🧅', price: 2800, msp: null, change: 12.5, unit: 'quintal' },
    { crop: 'Potato', icon: '🥔', price: 1650, msp: null, change: -5.2, unit: 'quintal' },
    { crop: 'Tomato', icon: '🍅', price: 3200, msp: null, change: 22.4, unit: 'quintal' },
];

export default function MarketPrices() {
    const [filter, setFilter] = useState<'all' | 'grains' | 'vegetables'>('all');

    const filteredData = marketData.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'grains') return item.msp !== null;
        if (filter === 'vegetables') return item.msp === null;
        return true;
    });

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">store</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold">Market Prices</h3>
                    <p className="text-white/50 text-xs">Live mandi rates</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                {(['all', 'grains', 'vegetables'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all capitalize ${filter === f
                                ? 'bg-white/15 text-white'
                                : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Price List */}
            <div className="space-y-2">
                {filteredData.map((item) => (
                    <div
                        key={item.crop}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="text-white text-sm font-medium">{item.crop}</p>
                                    <p className="text-white/40 text-xs">
                                        {item.msp ? `MSP: ₹${item.msp}` : 'Market price'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-bold">₹{item.price.toLocaleString()}</p>
                                <div className={`flex items-center justify-end gap-0.5 text-xs ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    <span className="material-icons-round text-sm">
                                        {item.change >= 0 ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {Math.abs(item.change)}%
                                </div>
                            </div>
                        </div>

                        {/* MSP Comparison Bar */}
                        {item.msp && (
                            <div className="mt-2">
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.price >= item.msp
                                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                                : 'bg-gradient-to-r from-red-400 to-red-500'
                                            }`}
                                        style={{ width: `${Math.min((item.price / item.msp) * 50, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] mt-1 text-white/30">
                                    {item.price >= item.msp
                                        ? `${((item.price - item.msp) / item.msp * 100).toFixed(0)}% above MSP ✓`
                                        : `${((item.msp - item.price) / item.msp * 100).toFixed(0)}% below MSP`}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Market Info */}
            <div className="mt-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex gap-2">
                    <span className="material-icons-round text-emerald-400 text-sm">info</span>
                    <p className="text-emerald-200/80 text-xs">
                        Prices from major APMC mandis. MSP (Minimum Support Price) is the government-guaranteed price.
                    </p>
                </div>
            </div>
        </div>
    );
}

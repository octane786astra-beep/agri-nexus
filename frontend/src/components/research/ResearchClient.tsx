'use client';

/**
 * Deep Research Page
 * ==================
 * AI-powered farm analysis with full scan and crop recommendations.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Search,
    Loader2,
    Leaf,
    AlertTriangle,
    TrendingUp,
    Droplets,
    Thermometer,
    Mountain
} from 'lucide-react';
import { api, type FullScanResponse, type CropFeasibility } from '@/lib/api';
import FloatingCard from '@/components/ui/FloatingCard';
import { cn } from '@/lib/utils';

export default function ResearchClient() {
    const [lat, setLat] = useState('12.9716');
    const [lon, setLon] = useState('77.5946');
    const [farmSize, setFarmSize] = useState('5');
    const [budget, setBudget] = useState('100000');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<FullScanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.fullScan({
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                farm_size: parseFloat(farmSize),
                budget: parseFloat(budget),
            });
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Scan failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-6">
            {/* Header */}
            <motion.header
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-white">
                    🔬 Deep <span className="text-emerald-400">Research</span>
                </h1>
                <p className="text-white/60 mt-1">AI-powered farm analysis and crop recommendations</p>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <FloatingCard floating={false} glowColor="blue" className="lg:col-span-1">
                    <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        Location Parameters
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-white/60 text-sm">Latitude</label>
                            <input
                                type="number"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                step="0.0001"
                            />
                        </div>

                        <div>
                            <label className="text-white/60 text-sm">Longitude</label>
                            <input
                                type="number"
                                value={lon}
                                onChange={(e) => setLon(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                step="0.0001"
                            />
                        </div>

                        <div>
                            <label className="text-white/60 text-sm">Farm Size (acres)</label>
                            <input
                                type="number"
                                value={farmSize}
                                onChange={(e) => setFarmSize(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-white/60 text-sm">Budget (₹)</label>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <motion.button
                            onClick={handleScan}
                            disabled={isLoading}
                            className={cn(
                                'w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all',
                                isLoading
                                    ? 'bg-emerald-500/30 text-emerald-300 cursor-not-allowed'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            )}
                            whileHover={isLoading ? {} : { scale: 1.02 }}
                            whileTap={isLoading ? {} : { scale: 0.98 }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Scanning Satellite...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Run Deep Scan
                                </>
                            )}
                        </motion.button>

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </FloatingCard>

                {/* Results */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {result && (
                            <>
                                {/* Location Info */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <FloatingCard floating={false} glowColor="green">
                                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                            <Mountain className="w-5 h-5 text-green-400" />
                                            Location Analysis
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-white/50">City</span>
                                                <p className="text-white font-medium">{result.location.city || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <span className="text-white/50">State</span>
                                                <p className="text-white font-medium">{result.location.state || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <span className="text-white/50">Elevation</span>
                                                <p className="text-white font-medium">{result.location.elevation_meters?.toFixed(0) || '--'}m</p>
                                            </div>
                                            <div>
                                                <span className="text-white/50">Terrain</span>
                                                <p className="text-white font-medium">{result.location.terrain_type || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </FloatingCard>
                                </motion.div>

                                {/* Crop Recommendations */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <FloatingCard floating={false} glowColor="purple">
                                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                            <Leaf className="w-5 h-5 text-purple-400" />
                                            Crop Recommendations
                                        </h3>
                                        <div className="space-y-3">
                                            {result.crop_recommendations.map((crop, index) => (
                                                <CropCard key={crop.crop_name} crop={crop} rank={index + 1} />
                                            ))}
                                        </div>
                                    </FloatingCard>
                                </motion.div>

                                {/* Risks */}
                                {result.risks.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <FloatingCard floating={false} glowColor="red">
                                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                                Risk Assessment
                                            </h3>
                                            <div className="space-y-3">
                                                {result.risks.map((risk, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-red-300 font-medium">{risk.risk_type}</span>
                                                            <span className="text-red-400 text-sm">{risk.probability}% probability</span>
                                                        </div>
                                                        <p className="text-white/70 text-sm">{risk.description}</p>
                                                        {risk.mitigation && (
                                                            <p className="text-green-400 text-xs mt-2">💡 {risk.mitigation}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </FloatingCard>
                                    </motion.div>
                                )}

                                {/* Weather Trends */}
                                {result.weather_analysis?.trends && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <FloatingCard floating={false} glowColor="blue">
                                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                <Thermometer className="w-5 h-5 text-blue-400" />
                                                Weather Trends
                                            </h3>

                                            {/* Climate Summary */}
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-4">
                                                <p className="text-blue-300 text-sm">
                                                    {result.weather_analysis.trends.climate_summary}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">
                                                    Current Season: <span className="text-blue-400 font-medium uppercase">
                                                        {result.weather_analysis.trends.current_season}
                                                    </span> | Annual Rainfall: {result.weather_analysis.trends.annual_rainfall_mm}mm
                                                </p>
                                            </div>

                                            {/* Seasonal Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {Object.entries(result.weather_analysis.trends?.seasons || {}).map(([key, season]: [string, any]) => (
                                                    <div
                                                        key={key}
                                                        className={`p-3 rounded-lg border ${result.weather_analysis.trends?.current_season === key
                                                            ? 'bg-emerald-500/20 border-emerald-500/30'
                                                            : 'bg-white/5 border-white/10'
                                                            }`}
                                                    >
                                                        <h4 className="text-white font-medium capitalize mb-1">
                                                            {key} {result.weather_analysis.trends?.current_season === key && '(Current)'}
                                                        </h4>
                                                        <p className="text-white/50 text-xs mb-2">{season.period}</p>
                                                        <p className="text-white/70 text-xs">{season.conditions}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </FloatingCard>
                                    </motion.div>
                                )}

                                {/* Market Analysis */}
                                {result.market_analysis && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <FloatingCard floating={false} glowColor="yellow">
                                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-yellow-400" />
                                                Market Demand & Supply
                                            </h3>

                                            {/* Regional Market */}
                                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
                                                <p className="text-yellow-300 text-sm font-medium">
                                                    📍 {result.market_analysis.regional_market?.major_market || 'Local APMC Market'}
                                                </p>
                                                <p className="text-white/60 text-xs mt-1">
                                                    Specialty: {result.market_analysis.regional_market?.specialty || 'Various crops'}
                                                </p>
                                            </div>

                                            {/* Crop Market Analysis */}
                                            <div className="space-y-3">
                                                {result.market_analysis.crop_analysis?.map((crop: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-white/5 border border-white/10 rounded-lg"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="text-white font-medium">{crop.crop}</h4>
                                                            <span className={`text-sm font-medium ${crop.price_trend === 'rising' ? 'text-green-400' :
                                                                crop.price_trend === 'falling' ? 'text-red-400' : 'text-yellow-400'
                                                                }`}>
                                                                {crop.price_trend === 'rising' ? '📈' : crop.price_trend === 'falling' ? '📉' : '➡️'}
                                                                {crop.price_change_percent > 0 ? '+' : ''}{crop.price_change_percent}%
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-white/50">Price/Quintal</span>
                                                                <p className="text-white">₹{crop.current_price_per_quintal}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-white/50">Demand</span>
                                                                <p className={`capitalize ${crop.demand_level === 'very high' || crop.demand_level === 'high'
                                                                    ? 'text-green-400' : 'text-yellow-400'
                                                                    }`}>{crop.demand_level}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-white/50">Supply</span>
                                                                <p className={`capitalize ${crop.supply_status === 'shortage' ? 'text-green-400' :
                                                                    crop.supply_status === 'surplus' ? 'text-red-400' : 'text-yellow-400'
                                                                    }`}>{crop.supply_status}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-white/50">Export</span>
                                                                <p className="text-blue-400 capitalize">{crop.export_potential}</p>
                                                            </div>
                                                        </div>

                                                        <p className="text-white/60 text-xs mt-2">{crop.market_outlook}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-white/40 text-xs mt-4 text-center">
                                                {result.market_analysis.price_source}
                                            </p>
                                        </FloatingCard>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Empty State */}
                    {!result && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 text-white/40">
                            <Search className="w-12 h-12 mb-4" />
                            <p>Enter location parameters and run a Deep Scan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Crop Card Component
function CropCard({ crop, rank }: { crop: CropFeasibility; rank: number }) {
    const scoreColor =
        crop.feasibility_score >= 70 ? 'text-green-400' :
            crop.feasibility_score >= 50 ? 'text-yellow-400' : 'text-red-400';

    return (
        <motion.div
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-colors"
            whileHover={{ x: 4 }}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center justify-center">
                        {rank}
                    </span>
                    <h4 className="text-white font-medium">{crop.crop_name}</h4>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-white/50 text-xs">Score</span>
                        <p className={cn('font-bold', scoreColor)}>{crop.feasibility_score.toFixed(0)}%</p>
                    </div>
                    {crop.roi_estimate && (
                        <div className="text-right">
                            <span className="text-white/50 text-xs">ROI</span>
                            <p className="text-green-400 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {crop.roi_estimate.toFixed(0)}%
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {crop.growing_season && (
                <p className="text-white/50 text-sm mb-2">📅 {crop.growing_season}</p>
            )}

            {crop.risks.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {crop.risks.map((risk, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                            {risk}
                        </span>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

'use client';

/**
 * Features Sidebar
 * ================
 * iOS Liquid Glass themed sidebar with additional farm tools.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CropCalendar from './CropCalendar';
import DiseaseDetection from './DiseaseDetection';
import IrrigationScheduler from './IrrigationScheduler';
import HistoricalAnalytics from './HistoricalAnalytics';
import WeatherForecast from './WeatherForecast';
import MarketPrices from './MarketPrices';

type FeatureKey = 'calendar' | 'disease' | 'irrigation' | 'analytics' | 'weather' | 'market' | null;

interface FeatureItem {
    key: FeatureKey;
    icon: string;
    label: string;
    color: string;
}

const features: FeatureItem[] = [
    { key: 'calendar', icon: 'calendar_month', label: 'Crop Calendar', color: 'from-amber-400 to-orange-500' },
    { key: 'disease', icon: 'biotech', label: 'Disease Scan', color: 'from-rose-400 to-red-500' },
    { key: 'irrigation', icon: 'water_drop', label: 'Irrigation', color: 'from-cyan-400 to-blue-500' },
    { key: 'analytics', icon: 'analytics', label: 'Analytics', color: 'from-purple-400 to-violet-500' },
    { key: 'weather', icon: 'cloud', label: 'Weather', color: 'from-sky-400 to-blue-500' },
    { key: 'market', icon: 'store', label: 'Market', color: 'from-emerald-400 to-green-500' },
];

export default function FeaturesSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState<FeatureKey>(null);

    const handleFeatureClick = (key: FeatureKey) => {
        if (activeFeature === key) {
            setActiveFeature(null);
        } else {
            setActiveFeature(key);
        }
    };

    const renderFeatureContent = () => {
        switch (activeFeature) {
            case 'calendar': return <CropCalendar />;
            case 'disease': return <DiseaseDetection />;
            case 'irrigation': return <IrrigationScheduler />;
            case 'analytics': return <HistoricalAnalytics />;
            case 'weather': return <WeatherForecast />;
            case 'market': return <MarketPrices />;
            default: return null;
        }
    };

    return (
        <>
            {/* Toggle Button - iOS Style */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-6 top-24 z-40 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="material-icons-round text-white/90 text-xl">
                    {isOpen ? 'close' : 'apps'}
                </span>
            </motion.button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-6 top-40 z-40 flex gap-4"
                    >
                        {/* Feature Icons Column */}
                        <div
                            className="flex flex-col gap-3 p-3 rounded-3xl"
                            style={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                            }}
                        >
                            {features.map((feature, index) => (
                                <motion.button
                                    key={feature.key}
                                    onClick={() => handleFeatureClick(feature.key)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeFeature === feature.key
                                            ? `bg-gradient-to-br ${feature.color} shadow-lg`
                                            : 'hover:bg-white/10'
                                        }`}
                                    style={{
                                        boxShadow: activeFeature === feature.key
                                            ? '0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                            : 'none',
                                    }}
                                >
                                    <span className={`material-icons-round text-xl ${activeFeature === feature.key ? 'text-white' : 'text-white/70 group-hover:text-white'
                                        }`}>
                                        {feature.icon}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                                        {feature.label}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Feature Content Panel */}
                        <AnimatePresence mode="wait">
                            {activeFeature && (
                                <motion.div
                                    key={activeFeature}
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="w-[340px] max-h-[calc(100vh-200px)] overflow-y-auto rounded-3xl"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                                        backdropFilter: 'blur(40px)',
                                        WebkitBackdropFilter: 'blur(40px)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {renderFeatureContent()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && activeFeature && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveFeature(null)}
                        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>
        </>
    );
}

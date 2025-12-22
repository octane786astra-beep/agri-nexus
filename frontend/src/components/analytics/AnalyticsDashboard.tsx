'use client';

/**
 * Analytics Dashboard Page
 * ========================
 * Comprehensive farm analytics with all features and AI chatbot.
 */

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useSensorStore } from '@/store/useSensorStore';
import { API_URL } from '@/lib/utils';
import CropCalendar from '@/components/features/CropCalendar';
import DiseaseDetection from '@/components/features/DiseaseDetection';
import IrrigationScheduler from '@/components/features/IrrigationScheduler';
import HistoricalAnalytics from '@/components/features/HistoricalAnalytics';
import WeatherForecast from '@/components/features/WeatherForecast';
import MarketPrices from '@/components/features/MarketPrices';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Embedded Chatbot for Analytics
function AnalyticsChatBot() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history: messages.slice(-6) })
            });

            if (!response.ok) throw new Error('Chat failed');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Could not connect to AI. Please check if backend is running.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <div className="text-center text-white/40 py-8">
                        <span className="material-icons-round text-4xl mb-2">smart_toy</span>
                        <p className="text-sm">Ask Krishi Mitra about your farm</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/10 text-gray-200'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 px-4 py-3 rounded-2xl">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about crops, weather, irrigation..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50"
                    >
                        <span className="material-icons-round text-lg">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Feature Card Wrapper
function FeatureCard({ title, icon, color, children }: {
    title: string;
    icon: string;
    color: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            }}
        >
            {children}
        </motion.div>
    );
}

export default function AnalyticsDashboard() {
    const { currentReadings } = useSensorStore();
    const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'disease' | 'irrigation' | 'market'>('overview');

    const tabs = [
        { key: 'overview', label: 'Overview', icon: 'dashboard' },
        { key: 'calendar', label: 'Calendar', icon: 'calendar_month' },
        { key: 'disease', label: 'Disease', icon: 'biotech' },
        { key: 'irrigation', label: 'Irrigation', icon: 'water_drop' },
        { key: 'market', label: 'Market', icon: 'store' },
    ];

    return (
        <div className="min-h-screen px-4 md:px-8 py-4 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl md:text-4xl font-medium text-white">
                        📊 Analytics <span className="text-emerald-400">Hub</span>
                    </h1>
                    <p className="text-white/50 mt-1">Comprehensive farm intelligence & AI assistant</p>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/40 text-xs">Temperature</p>
                        <p className="text-white font-bold">{(currentReadings?.temperature || 0).toFixed(1)}°C</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/40 text-xs">Soil Moisture</p>
                        <p className="text-emerald-400 font-bold">{(currentReadings?.soil_moisture || 0).toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span className="material-icons-round text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Feature */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <FeatureCard title="Weather" icon="cloud" color="sky">
                                    <WeatherForecast />
                                </FeatureCard>
                                <FeatureCard title="Analytics" icon="analytics" color="purple">
                                    <HistoricalAnalytics />
                                </FeatureCard>
                            </motion.div>
                        )}

                        {activeTab === 'calendar' && (
                            <motion.div
                                key="calendar"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <FeatureCard title="Crop Calendar" icon="calendar_month" color="amber">
                                    <CropCalendar />
                                </FeatureCard>
                            </motion.div>
                        )}

                        {activeTab === 'disease' && (
                            <motion.div
                                key="disease"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <FeatureCard title="Disease Detection" icon="biotech" color="rose">
                                    <DiseaseDetection />
                                </FeatureCard>
                            </motion.div>
                        )}

                        {activeTab === 'irrigation' && (
                            <motion.div
                                key="irrigation"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <FeatureCard title="Irrigation Scheduler" icon="water_drop" color="cyan">
                                    <IrrigationScheduler />
                                </FeatureCard>
                            </motion.div>
                        )}

                        {activeTab === 'market' && (
                            <motion.div
                                key="market"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <FeatureCard title="Market Prices" icon="store" color="emerald">
                                    <MarketPrices />
                                </FeatureCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column - AI Chatbot */}
                <div className="lg:col-span-1">
                    <div
                        className="h-[600px] rounded-3xl overflow-hidden flex flex-col"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <span className="material-icons-round text-white">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Krishi Mitra</h3>
                                <p className="text-emerald-100 text-xs">AI Farm Assistant</p>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <AnalyticsChatBot />
                    </div>
                </div>
            </div>
        </div>
    );
}

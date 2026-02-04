'use client';

/**
 * Reimagined Dashboard - Elegant Glass Design
 * ============================================
 * Features Playfair Display headers, glass panels, and ApexCharts
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSensorStore } from '@/store/useSensorStore';
import { useSimulationModeStore } from '@/store/useSimulationModeStore';
import { useWeatherSocket } from '@/hooks/useWeatherSocket';
import { formatTemp, formatPercent } from '@/lib/utils';

// Dynamic imports for ApexCharts and Leaflet (SSR disabled)
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
const DashboardMap = dynamic(() => import('./DashboardMap'), { ssr: false });

interface DashboardClientProps {
    farmId?: string;
}

export default function DashboardClient({ farmId = 'demo-farm-001' }: DashboardClientProps) {
    useWeatherSocket({ farmId });

    const { currentReadings, historicalData, alerts, isConnected } = useSensorStore();
    const { isSimulationMode, toggleSimulationMode } = useSimulationModeStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('Good Morning');
    const clickCountRef = useRef(0);
    const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Handle triple-click on greeting to toggle simulation mode
    const handleGreetingClick = () => {
        clickCountRef.current += 1;
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

        if (clickCountRef.current >= 3) {
            toggleSimulationMode();
            clickCountRef.current = 0;
        } else {
            clickTimerRef.current = setTimeout(() => {
                clickCountRef.current = 0;
            }, 500);
        }
    };

    // Keyboard shortcut: Ctrl+Shift+S for simulation mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                toggleSimulationMode();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSimulationMode]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now);
            const hour = now.getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 17) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Prepare chart data from historical data
    const tempChartData = useMemo(() => {
        return historicalData.slice(-20).map(d => d.temperature);
    }, [historicalData]);

    const moistureChartData = useMemo(() => {
        return historicalData.slice(-20).map(d => d.soil_moisture);
    }, [historicalData]);

    // Calculate gauge percentages
    const tempPercent = ((currentReadings?.temperature || 0) / 50) * 100;
    const humidityPercent = currentReadings?.humidity || 0;
    const soilPercent = currentReadings?.soil_moisture || 0;
    const rainPercent = ((currentReadings?.rainfall || 0) / 10) * 100;

    // Chart options
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            background: 'transparent',
            fontFamily: 'Inter, sans-serif',
            animations: { enabled: true, speed: 800 }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        grid: {
            show: true,
            borderColor: 'rgba(255,255,255,0.05)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            show: true,
            labels: { style: { colors: '#6b7280', fontSize: '10px' } }
        },
        theme: { mode: 'dark' },
        tooltip: {
            theme: 'dark',
            style: { fontFamily: 'Inter, sans-serif', fontSize: '12px' },
            x: { show: false }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        }
    };

    return (
        <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto text-gray-200 min-h-screen">
            {/* Background texture */}
            <div className="bg-texture"></div>
            <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/40 via-transparent to-black pointer-events-none z-0"></div>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                <div>
                    <h1
                        onClick={handleGreetingClick}
                        className="font-display text-4xl md:text-5xl font-medium text-gray-100 drop-shadow-sm tracking-wide cursor-default select-none"
                    >
                        {greeting}, <span className="text-emerald-400">Farmer</span>
                        {isSimulationMode && (
                            <span className="ml-3 px-2 py-1 text-xs font-sans bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 animate-pulse">
                                🎮 SIM MODE
                            </span>
                        )}
                    </h1>
                    <div className="flex items-center gap-2 mt-3 text-gray-400 font-sans font-light tracking-wide">
                        <span className="material-icons-round text-lg">calendar_today</span>
                        <span>{currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="opacity-60 text-sm ml-1">
                            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-emerald-400/80 text-sm font-medium tracking-wide font-sans">
                        <span className="relative flex h-2 w-2">
                            {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                        {isConnected ? 'Live Sensors Connected' : 'Connecting...'}
                    </div>
                </div>

                <button className="glass-panel h-12 w-12 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95 relative">
                    <span className="material-icons-round">notifications_none</span>
                    {alerts.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                            {alerts.length}
                        </span>
                    )}
                </button>
            </header>

            {/* Main Grid */}
            <main className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                {/* Left Column */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    {/* Location Card */}
                    <div className="glass-panel rounded-2xl p-0 h-72 flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            <div className="p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white border border-white/10">
                                <span className="material-icons-round text-sm">location_on</span>
                            </div>
                            <h3 className="font-display font-medium text-white drop-shadow-md tracking-wide">Farm Location</h3>
                        </div>
                        <div className="absolute inset-0 z-0 bg-slate-900">
                            {/* Leaflet Map */}
                            <DashboardMap lat={12.9716} lon={77.5946} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 z-10">
                            <div className="glass-panel bg-black/60 rounded-xl p-4 text-xs shadow-lg backdrop-blur-md border border-white/5">
                                <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                                    <span className="font-display font-bold text-gray-100 text-base">Bangalore</span>
                                    <span className="text-gray-400 font-sans tracking-wide uppercase text-[10px]">Karnataka</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-400 font-sans">
                                    <span>Elevation: 920m</span>
                                    <span className="text-right">Plateau</span>
                                    <span>Season: Rabi</span>
                                    <span className="text-right text-emerald-400 font-bold">Current</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weather Card */}
                    <div className="glass-panel bg-gradient-to-b from-emerald-900/40 to-black/40 rounded-2xl p-6 flex flex-col justify-between text-white flex-grow min-h-[280px] relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <span className="material-icons-round text-emerald-200/80">
                                {currentReadings?.is_raining ? 'water_drop' : 'wb_sunny'}
                            </span>
                            <h3 className="font-display text-lg tracking-wide text-gray-200">Weather Now</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center my-4 relative z-10">
                            <span className="material-icons-round text-emerald-100/90 text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ animationDuration: '4s' }}>
                                {currentReadings?.is_raining ? 'water_drop' : 'wb_sunny'}
                            </span>
                            <div className="text-center mt-4">
                                <span className="text-6xl font-display font-medium tracking-tight text-white">
                                    {(currentReadings?.temperature || 0).toFixed(1)}
                                    <span className="text-3xl align-top font-sans font-light ml-1 opacity-70">°C</span>
                                </span>
                                <div className="flex items-center justify-center gap-2 text-emerald-100/70 mt-2 font-sans font-light tracking-widest text-xs uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span>{currentReadings?.is_raining ? 'Raining' : 'Clear Sky'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4 relative z-10">
                            <div className="text-center hover:bg-white/5 rounded-lg p-2 transition-colors">
                                <span className="material-icons-round text-blue-200/70 text-xl mb-1">water_drop</span>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-sans mb-1">Humidity</p>
                                <p className="font-display text-xl text-white">{formatPercent(currentReadings?.humidity || 0)}</p>
                            </div>
                            <div className="text-center hover:bg-white/5 rounded-lg p-2 transition-colors">
                                <span className="material-icons-round text-cyan-200/70 text-xl mb-1">air</span>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-sans mb-1">Wind</p>
                                <p className="font-display text-xl text-white">{(currentReadings?.wind_speed || 0).toFixed(1)} <span className="text-xs font-sans font-light opacity-60">km/h</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Card */}
                    {alerts.length > 0 ? (
                        <div className="bg-gradient-to-br from-amber-600/90 to-amber-800/90 rounded-2xl p-5 shadow-lg shadow-amber-900/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <span className="material-icons-round text-amber-200">warning_amber</span>
                                <h3 className="font-display font-medium text-lg tracking-wide">Actions Required</h3>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 mt-2 backdrop-blur-md border border-white/10 relative z-10">
                                <p className="text-base font-sans font-medium leading-snug">{alerts[0]?.title}</p>
                                <p className="text-xs font-sans font-light opacity-80 tracking-wide mt-2">{alerts[0]?.message}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-800/30 rounded-2xl p-5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-icons-round text-emerald-400">check_circle</span>
                                <h3 className="font-display font-medium text-lg tracking-wide text-white">All Systems Normal</h3>
                            </div>
                            <p className="text-sm text-emerald-200/70 font-sans">No actions required at this time.</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Gauges & Charts */}
                <div className="md:col-span-9 flex flex-col gap-6">
                    {/* Sensor Gauges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <GaugeCard label="Temperature" value={(currentReadings?.temperature || 0).toFixed(1)} unit="CELSIUS" percent={tempPercent} color="#60a5fa" icon="thermostat" />
                        <GaugeCard label="Humidity" value={(currentReadings?.humidity || 0).toFixed(1)} unit="PERCENT" percent={humidityPercent} color="#22d3ee" icon="water_drop" />
                        <GaugeCard label="Soil Status" value={(currentReadings?.soil_moisture || 0).toFixed(1)} unit="MOISTURE" percent={soilPercent} color="#a3e635" icon="grass" />
                        <GaugeCard label="Rainfall" value={(currentReadings?.rainfall || 0).toFixed(1)} unit="MM" percent={rainPercent} color="#60a5fa" icon="cloud" />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[340px]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-200 font-display text-xl tracking-wide">Temperature History</h3>
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                </div>
                            </div>
                            <div className="flex-grow w-full">
                                <Chart
                                    options={{ ...chartOptions, colors: ['#34d399'] }}
                                    series={[{ name: 'Temperature', data: tempChartData }]}
                                    type="area"
                                    height="100%"
                                />
                            </div>
                        </div>

                        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[340px]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-200 font-display text-xl tracking-wide">Soil Moisture History</h3>
                                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                            </div>
                            <div className="flex-grow w-full">
                                <Chart
                                    options={{ ...chartOptions, colors: ['#0ea5e9'], stroke: { ...chartOptions.stroke, curve: 'smooth' } }}
                                    series={[{ name: 'Moisture', data: moistureChartData }]}
                                    type="area"
                                    height="100%"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="glass-panel bg-black/40 rounded-2xl p-8 text-white backdrop-blur-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <span className="material-icons-round text-emerald-400/80">query_stats</span>
                            <h3 className="font-display text-xl tracking-wide font-medium">System Status</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <StatusCard label="Sim Ticks" value={currentReadings?.simulation_tick || 0} color="text-sky-300" />
                            <StatusCard label="Pressure" value={`${(currentReadings?.pressure || 1013).toFixed(0)} hPa`} color="text-blue-300" />
                            <StatusCard label="Data Points" value={historicalData.length} color="text-purple-300" />
                            <StatusCard label="Active Alerts" value={alerts.length} color="text-amber-300" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Gauge Card Component
function GaugeCard({ label, value, unit, percent, color, icon }: {
    label: string; value: string; unit: string; percent: number; color: string; icon: string
}) {
    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

    return (
        <div className="glass-panel glass-panel-light rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[200px] hover:bg-white/10 transition-colors duration-300">
            <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                    <circle className="text-white/5" cx="72" cy="72" fill="transparent" r="60" stroke="currentColor" strokeWidth="6" />
                    <circle
                        cx="72" cy="72" fill="transparent" r="60"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ filter: `drop-shadow(0 0 8px ${color}60)`, transition: 'stroke-dashoffset 0.8s ease-out' }}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="material-icons-round mb-2 opacity-80" style={{ color }}>{icon}</span>
                    <span className="text-3xl font-display font-medium text-white">{value}</span>
                    <span className="text-xs text-gray-400 font-sans tracking-widest mt-1">{unit}</span>
                </div>
            </div>
            <p className="mt-4 text-sm font-display tracking-wide text-gray-300">{label}</p>
        </div>
    );
}

// Status Card Component
function StatusCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="bg-white/5 rounded-xl p-5 text-center hover:bg-white/10 transition-colors cursor-default border border-white/5">
            <div className={`text-3xl font-display font-medium ${color}`}>{value}</div>
            <div className="text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em] font-sans">{label}</div>
        </div>
    );
}

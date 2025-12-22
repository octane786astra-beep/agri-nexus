'use client';

/**
 * Historical Analytics Component
 * ==============================
 * Shows 7/30/90 day trend charts for sensor data.
 */

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSensorStore } from '@/store/useSensorStore';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TimeRange = '7d' | '30d' | '90d';

// Generate simulated historical data
const generateHistoricalData = (days: number, baseValue: number, variance: number) => {
    const data = [];
    const now = Date.now();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const value = baseValue + (Math.random() - 0.5) * variance;
        data.push({
            x: date.getTime(),
            y: Math.round(value * 10) / 10
        });
    }
    return data;
};

export default function HistoricalAnalytics() {
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [metric, setMetric] = useState<'temperature' | 'humidity' | 'moisture'>('temperature');

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    const chartData = useMemo(() => {
        const config = {
            temperature: { base: 32, variance: 12, color: '#f97316', unit: '°C' },
            humidity: { base: 65, variance: 30, color: '#22d3ee', unit: '%' },
            moisture: { base: 55, variance: 40, color: '#22c55e', unit: '%' },
        };
        return generateHistoricalData(days, config[metric].base, config[metric].variance);
    }, [days, metric]);

    const avgValue = (chartData.reduce((sum, d) => sum + d.y, 0) / chartData.length).toFixed(1);
    const maxValue = Math.max(...chartData.map(d => d.y)).toFixed(1);
    const minValue = Math.min(...chartData.map(d => d.y)).toFixed(1);

    const colors = {
        temperature: '#f97316',
        humidity: '#22d3ee',
        moisture: '#22c55e',
    };

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            sparkline: { enabled: false },
            toolbar: { show: false },
            zoom: { enabled: false },
            background: 'transparent',
        },
        stroke: { curve: 'smooth', width: 2 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100],
            },
        },
        colors: [colors[metric]],
        xaxis: {
            type: 'datetime',
            labels: {
                show: true,
                style: { colors: '#ffffff50', fontSize: '10px' },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: "MMM 'yy",
                    day: 'dd MMM',
                    hour: 'HH:mm',
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                show: true,
                style: { colors: '#ffffff50', fontSize: '10px' },
            },
        },
        grid: {
            show: true,
            borderColor: '#ffffff10',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: 'dark',
            x: { format: 'dd MMM yyyy' },
        },
    };

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">analytics</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold">Analytics</h3>
                    <p className="text-white/50 text-xs">Historical trends</p>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 mb-4">
                {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeRange === range
                                ? 'bg-white/15 text-white'
                                : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                    </button>
                ))}
            </div>

            {/* Metric Selector */}
            <div className="flex gap-2 mb-4">
                {(['temperature', 'humidity', 'moisture'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMetric(m)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${metric === m
                                ? 'bg-white/15 text-white'
                                : 'text-white/50 hover:text-white/70'
                            }`}
                    >
                        <span className="material-icons-round text-sm">
                            {m === 'temperature' ? 'thermostat' : m === 'humidity' ? 'water_drop' : 'grass'}
                        </span>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-40 -mx-2">
                <Chart
                    options={chartOptions}
                    series={[{ name: metric, data: chartData }]}
                    type="area"
                    height="100%"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-white/40 text-[10px] mb-1">Average</p>
                    <p className="text-white font-bold">{avgValue}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-white/40 text-[10px] mb-1">Max</p>
                    <p className="text-emerald-400 font-bold">{maxValue}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-white/40 text-[10px] mb-1">Min</p>
                    <p className="text-cyan-400 font-bold">{minValue}</p>
                </div>
            </div>
        </div>
    );
}

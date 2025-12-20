'use client';

/**
 * LiveChart - Clean Professional Style
 * =====================================
 */

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiveChartProps {
    data: Array<{ time?: string;[key: string]: unknown }>;
    dataKey?: string;
    title?: string;
    label?: string;
    unit: string;
    color?: string;
    className?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
    unit: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-white/50 text-xs">{label}</p>
                <p className="text-white font-semibold text-sm">
                    {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value} {unit}
                </p>
            </div>
        );
    }
    return null;
}

export default function LiveChart({
    data,
    dataKey = 'value',
    title,
    label,
    unit,
    color = '#22c55e',
    className,
}: LiveChartProps) {
    const displayLabel = title || label || 'Chart';
    const gradientId = `gradient-${dataKey}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <motion.div
            className={cn('bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5', className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h3 className="text-white font-medium text-sm mb-4">{displayLabel}</h3>

            <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="time" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip unit={unit} />} />
                    <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

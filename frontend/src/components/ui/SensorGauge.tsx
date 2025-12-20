'use client';

/**
 * SensorGauge - Clean Professional Style
 * ======================================
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface SensorGaugeProps {
    value: number;
    min?: number;
    max?: number;
    label: string;
    unit: string;
    size?: number;
    strokeWidth?: number;
    color?: 'green' | 'blue' | 'red' | 'yellow' | 'cyan' | 'purple';
    icon?: LucideIcon;
}

const colorClasses = {
    green: { stroke: '#22c55e', text: 'text-green-400' },
    blue: { stroke: '#3b82f6', text: 'text-blue-400' },
    red: { stroke: '#ef4444', text: 'text-red-400' },
    yellow: { stroke: '#eab308', text: 'text-yellow-400' },
    cyan: { stroke: '#06b6d4', text: 'text-cyan-400' },
    purple: { stroke: '#a855f7', text: 'text-purple-400' },
};

export default function SensorGauge({
    value,
    min = 0,
    max = 100,
    label,
    unit,
    size = 80,
    strokeWidth = 5,
    color = 'green',
    icon: Icon,
}: SensorGaugeProps) {
    const colors = colorClasses[color];
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={colors.stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {Icon && <Icon className={cn('w-3.5 h-3.5 mb-0.5', colors.text)} />}
                    <span className={cn('text-lg font-semibold', colors.text)}>{value.toFixed(1)}</span>
                    <span className="text-white/30 text-[10px]">{unit}</span>
                </div>
            </div>
            <span className="mt-2 text-[11px] font-medium text-white/50">{label}</span>
        </div>
    );
}

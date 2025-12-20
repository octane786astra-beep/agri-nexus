'use client';

/**
 * Loading Skeleton Components
 * ===========================
 * Holographic loading placeholders for the Anti-Gravity UI.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) {
    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    };

    return (
        <div
            className={cn(
                'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
                variantClasses[variant],
                className
            )}
            style={{ width, height }}
        />
    );
}

/**
 * Sensor Card Skeleton
 */
export function SensorCardSkeleton() {
    return (
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton variant="circular" width={20} height={20} />
                <Skeleton variant="text" width={80} height={16} />
            </div>
            <div className="flex justify-center">
                <Skeleton variant="circular" width={100} height={100} />
            </div>
        </div>
    );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
    return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
            <Skeleton variant="text" width={120} height={20} className="mb-4" />
            <div className="h-[200px] flex items-end justify-between gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        variant="rectangular"
                        width="4%"
                        height={`${30 + Math.random() * 60}%`}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Dashboard Skeleton - Full page loading state
 */
export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-6">
            {/* Header */}
            <div className="mb-8">
                <Skeleton variant="text" width={300} height={32} className="mb-2" />
                <Skeleton variant="text" width={200} height={16} />
            </div>

            {/* Sensor Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SensorCardSkeleton key={i} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
        </div>
    );
}

/**
 * Research Skeleton
 */
export function ResearchSkeleton() {
    return (
        <div className="space-y-6">
            {/* Location Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                <Skeleton variant="text" width={150} height={20} className="mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton variant="text" width={60} height={12} className="mb-1" />
                            <Skeleton variant="text" width={80} height={16} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Crop Cards */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                <Skeleton variant="text" width={180} height={20} className="mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} variant="rectangular" height={80} />
                    ))}
                </div>
            </div>
        </div>
    );
}

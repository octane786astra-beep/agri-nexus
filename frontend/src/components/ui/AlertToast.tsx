'use client';

/**
 * AlertToast Component
 * ====================
 * Holographic toast notification for system alerts.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Droplets, Thermometer, Wind, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Alert {
    id: string;
    type: 'CRITICAL_DRY' | 'STORM_WARNING' | 'HEAT_WARNING' | 'FROST_WARNING' | 'DISEASE_RISK';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: Date;
}

interface AlertToastProps {
    alert: Alert;
    onDismiss?: (id: string) => void;
}

const alertConfigs = {
    CRITICAL_DRY: {
        icon: Droplets,
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/50',
        iconColor: 'text-orange-400',
        glowColor: 'shadow-orange-500/30',
    },
    STORM_WARNING: {
        icon: Wind,
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/50',
        iconColor: 'text-purple-400',
        glowColor: 'shadow-purple-500/30',
    },
    HEAT_WARNING: {
        icon: Thermometer,
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50',
        iconColor: 'text-red-400',
        glowColor: 'shadow-red-500/30',
    },
    FROST_WARNING: {
        icon: Thermometer,
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        iconColor: 'text-blue-400',
        glowColor: 'shadow-blue-500/30',
    },
    DISEASE_RISK: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        iconColor: 'text-yellow-400',
        glowColor: 'shadow-yellow-500/30',
    },
};

const severityPulse = {
    critical: 'animate-pulse',
    high: '',
    medium: '',
    low: '',
};

export default function AlertToast({ alert, onDismiss }: AlertToastProps) {
    const config = alertConfigs[alert.type] || alertConfigs.DISEASE_RISK;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={cn(
                'backdrop-blur-xl border rounded-xl p-4 shadow-2xl',
                'min-w-[320px] max-w-[400px]',
                config.bgColor,
                config.borderColor,
                config.glowColor,
                severityPulse[alert.severity]
            )}
        >
            {/* Holographic scan line effect */}
            <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <motion.div
                    className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ y: ['-100%', '400%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            <div className="relative flex items-start gap-3">
                <div className={cn('p-2 rounded-lg bg-black/30', config.iconColor)}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold text-sm">{alert.title}</h4>
                        {onDismiss && (
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className="text-white/40 hover:text-white/80 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <p className="text-white/70 text-xs mt-1 line-clamp-2">{alert.message}</p>

                    <div className="flex items-center gap-2 mt-2">
                        <span
                            className={cn(
                                'text-xs px-2 py-0.5 rounded-full uppercase font-medium',
                                alert.severity === 'critical' && 'bg-red-500/30 text-red-300',
                                alert.severity === 'high' && 'bg-orange-500/30 text-orange-300',
                                alert.severity === 'medium' && 'bg-yellow-500/30 text-yellow-300',
                                alert.severity === 'low' && 'bg-green-500/30 text-green-300'
                            )}
                        >
                            {alert.severity}
                        </span>
                        <span className="text-white/40 text-xs">
                            {alert.timestamp.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * AlertContainer - Container for multiple alerts
 */
interface AlertContainerProps {
    alerts: Alert[];
    onDismiss?: (id: string) => void;
}

export function AlertContainer({ alerts, onDismiss }: AlertContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {alerts.map((alert) => (
                    <AlertToast key={alert.id} alert={alert} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
}

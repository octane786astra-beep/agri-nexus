'use client';

/**
 * Simulation Control Panel
 * ========================
 * "God Mode" panel for controlling the simulation during demos.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudRain,
    Sun,
    RotateCcw,
    Clock,
    ChevronDown,
    ChevronUp,
    Zap,
    Droplets
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SimControlPanelProps {
    className?: string;
}

export default function SimControlPanel({ className }: SimControlPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAction = async (action: string, fn: () => Promise<{ message?: string; success?: boolean }>) => {
        setIsLoading(action);
        try {
            const result = await fn();
            showMessage(result.message || 'Action completed', 'success');
        } catch (error) {
            showMessage(error instanceof Error ? error.message : 'Action failed', 'error');
        } finally {
            setIsLoading(null);
        }
    };

    const controls = [
        {
            id: 'rain',
            label: 'Trigger Rain',
            icon: CloudRain,
            color: 'blue',
            action: () => api.triggerRain(0.8, 30),
        },
        {
            id: 'drought',
            label: 'Trigger Drought',
            icon: Sun,
            color: 'orange',
            action: () => api.triggerDrought(),
        },
        {
            id: 'reset',
            label: 'Reset Simulation',
            icon: RotateCcw,
            color: 'green',
            action: () => api.resetSimulation(),
        },
        {
            id: 'time-6',
            label: 'Skip 6 Hours',
            icon: Clock,
            color: 'purple',
            action: () => api.timeJump(6),
        },
    ];

    const colorClasses = {
        blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30',
        orange: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30',
        green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30',
        purple: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30',
    };

    return (
        <div className={cn('fixed bottom-4 right-4 z-50', className)}>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 backdrop-blur-xl bg-black/60 border border-white/20 rounded-full px-4 py-2 text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">God Mode</span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </motion.button>

            {/* Control Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 right-0 w-64 backdrop-blur-xl bg-black/80 border border-white/20 rounded-xl p-4 shadow-2xl"
                    >
                        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-cyan-400" />
                            Simulation Controls
                        </h3>

                        <div className="space-y-2">
                            {controls.map((control) => {
                                const Icon = control.icon;
                                const isControlLoading = isLoading === control.id;

                                return (
                                    <motion.button
                                        key={control.id}
                                        onClick={() => handleAction(control.id, control.action)}
                                        disabled={isLoading !== null}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all',
                                            colorClasses[control.color as keyof typeof colorClasses],
                                            isLoading && 'opacity-50 cursor-not-allowed'
                                        )}
                                        whileHover={isLoading ? {} : { x: 4 }}
                                        whileTap={isLoading ? {} : { scale: 0.98 }}
                                    >
                                        {isControlLoading ? (
                                            <motion.div
                                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                        ) : (
                                            <Icon className="w-4 h-4" />
                                        )}
                                        <span className="text-sm">{control.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Message Toast */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className={cn(
                                        'mt-3 px-3 py-2 rounded-lg text-xs text-center',
                                        message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                    )}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

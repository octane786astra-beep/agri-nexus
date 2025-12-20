'use client';

/**
 * WeatherOverlay Component
 * ========================
 * Dynamic weather effects overlay (rain droplets, heat haze).
 */

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface WeatherOverlayProps {
    isRaining: boolean;
    temperature: number;
    rainIntensity?: number;
}

export default function WeatherOverlay({
    isRaining,
    temperature,
    rainIntensity = 0.5,
}: WeatherOverlayProps) {
    // Generate rain drops
    const rainDrops = useMemo(() => {
        if (!isRaining) return [];

        const dropCount = Math.floor(50 * rainIntensity);
        return Array.from({ length: dropCount }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 2,
            duration: 0.5 + Math.random() * 0.5,
            height: 15 + Math.random() * 20,
        }));
    }, [isRaining, rainIntensity]);

    const showHeatHaze = temperature > 35;

    return (
        <>
            {/* Rain Effect */}
            {isRaining && (
                <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
                    {rainDrops.map((drop) => (
                        <motion.div
                            key={drop.id}
                            className="absolute w-0.5 bg-gradient-to-b from-blue-400/60 to-transparent rounded-full"
                            style={{
                                left: drop.left,
                                height: drop.height,
                            }}
                            initial={{ top: '-5%', opacity: 0 }}
                            animate={{ top: '105%', opacity: [0, 1, 1, 0] }}
                            transition={{
                                duration: drop.duration,
                                delay: drop.delay,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    ))}

                    {/* Rain mist at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-500/10 to-transparent" />
                </div>
            )}

            {/* Heat Haze Effect */}
            {showHeatHaze && (
                <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(255, 100, 0, 0.05) 100%)',
                        }}
                        animate={{
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Shimmer lines */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute left-0 right-0 h-px"
                            style={{
                                top: `${20 + i * 15}%`,
                                background: 'linear-gradient(90deg, transparent, rgba(255,200,100,0.2), transparent)',
                            }}
                            animate={{
                                scaleY: [1, 2, 1],
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{
                                duration: 2 + i * 0.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

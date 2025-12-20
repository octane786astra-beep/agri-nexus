'use client';

/**
 * Dynamic Background - Clean Professional Style
 * ==============================================
 * Subtle, modern gradient background based on time.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface DynamicBackgroundProps {
    isRaining?: boolean;
    temperature?: number;
}

export default function DynamicBackground({ isRaining }: DynamicBackgroundProps) {
    const [isNight, setIsNight] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            setIsNight(hour >= 18 || hour < 6);
        };
        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Memoize rain drops
    const rainDrops = useMemo(() => {
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: `${(i * 2.5) + Math.random()}%`,
            delay: Math.random() * 1,
            duration: 0.8 + Math.random() * 0.3,
        }));
    }, []);

    return (
        <div className="fixed inset-0 z-0">
            {/* Clean gradient background */}
            <div
                className="absolute inset-0 transition-all duration-1000"
                style={{
                    background: isNight
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
                        : 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)',
                }}
            />

            {/* Subtle mesh gradient overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: isNight
                        ? 'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)'
                        : 'radial-gradient(ellipse at 20% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                }}
            />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Rain Effect - Clean and subtle */}
            <AnimatePresence>
                {isRaining && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {rainDrops.map((drop) => (
                            <motion.div
                                key={drop.id}
                                className="absolute w-[1px] h-8 bg-gradient-to-b from-transparent via-blue-400/30 to-blue-400/50 rounded-full"
                                style={{ left: drop.left, top: '-40px' }}
                                animate={{ y: ['0vh', '105vh'] }}
                                transition={{
                                    duration: drop.duration,
                                    repeat: Infinity,
                                    delay: drop.delay,
                                    ease: 'linear',
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

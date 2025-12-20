'use client';

/**
 * FloatingCard Component
 * ======================
 * A glassmorphism card with floating animation and optional drag support.
 * Core component of the "Anti-Gravity" UI design.
 */

import { motion, type MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FloatingCardProps extends MotionProps {
    children: ReactNode;
    className?: string;
    /** Enable floating animation */
    floating?: boolean;
    /** Enable drag interaction */
    draggable?: boolean;
    /** Glow color: 'green' | 'blue' | 'red' | 'yellow' | 'purple' */
    glowColor?: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

const glowColors = {
    green: 'shadow-green-500/20 hover:shadow-green-500/40',
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/40',
    red: 'shadow-red-500/20 hover:shadow-red-500/40',
    yellow: 'shadow-yellow-500/20 hover:shadow-yellow-500/40',
    purple: 'shadow-purple-500/20 hover:shadow-purple-500/40',
};

const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export default function FloatingCard({
    children,
    className,
    floating = true,
    draggable = false,
    glowColor = 'green',
    size = 'md',
    ...motionProps
}: FloatingCardProps) {
    // Floating animation configuration
    const floatingAnimation = floating
        ? {
            y: [0, -8, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut' as const,
            },
        }
        : undefined;

    return (
        <motion.div
            className={cn(
                // Base glassmorphism styles
                'backdrop-blur-xl bg-white/10 border border-white/20',
                'rounded-2xl shadow-2xl',
                // Glow effect
                glowColors[glowColor],
                'shadow-lg',
                // Size
                sizeClasses[size],
                // Transitions
                'transition-all duration-300',
                // Custom classes
                className
            )}
            animate={floatingAnimation}
            drag={draggable}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            whileHover={{ scale: 1.02 }}
            whileTap={draggable ? { scale: 0.98 } : undefined}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}

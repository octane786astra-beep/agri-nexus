'use client';

/**
 * Navigation Component
 * ====================
 * Glass panel navigation matching the reimagined design.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/analytics', label: 'Analytics', icon: 'analytics' },
    { href: '/research', label: 'Research', icon: 'science' },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                className="glass-panel flex items-center gap-1 rounded-full px-1.5 py-1.5 shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <span className="material-icons-round text-lg">spa</span>
                    <span className="text-sm font-sans font-medium hidden sm:inline">Agri-Nexus</span>
                </div>

                {/* Nav Items */}
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={cn(
                                    'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-sans font-medium transition-all',
                                    isActive
                                        ? 'bg-emerald-500/10 text-emerald-300 shadow-sm ring-1 ring-emerald-500/20 backdrop-blur-md font-bold'
                                        : 'text-gray-400 hover:text-white'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="material-icons-round text-lg">{item.icon}</span>
                                <span className="hidden sm:inline">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>
        </nav>
    );
}

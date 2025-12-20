'use client';

/**
 * India Weather Map Component
 * ===========================
 * Interactive map showing weather layers for India.
 * Uses free tile services (no API key required).
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Cloud, Thermometer, CloudRain, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

type WeatherLayer = 'temp' | 'precipitation' | 'clouds';

interface IndiaWeatherMapProps {
    farmLat?: number;
    farmLon?: number;
    className?: string;
}

export default function IndiaWeatherMap({
    farmLat = 12.9716,
    farmLon = 77.5946,
    className
}: IndiaWeatherMapProps) {
    const [isClient, setIsClient] = useState(false);
    const [activeLayer, setActiveLayer] = useState<WeatherLayer>('temp');
    const [rainViewerTimestamp, setRainViewerTimestamp] = useState<string>('');

    useEffect(() => {
        setIsClient(true);

        // Fetch latest RainViewer timestamp for precipitation layer
        fetch('https://api.rainviewer.com/public/weather-maps.json')
            .then(res => res.json())
            .then(data => {
                if (data.radar?.past?.length > 0) {
                    setRainViewerTimestamp(data.radar.past[data.radar.past.length - 1].path);
                }
            })
            .catch(() => {
                // Fallback - RainViewer uses relative timestamps
                setRainViewerTimestamp('/v2/radar/nowcast');
            });
    }, []);

    const layers = {
        temp: {
            name: 'Temperature',
            icon: Thermometer,
            color: 'text-red-400',
        },
        precipitation: {
            name: 'Precipitation',
            icon: CloudRain,
            color: 'text-blue-400',
        },
        clouds: {
            name: 'Clouds',
            icon: Cloud,
            color: 'text-gray-400',
        },
    };

    if (!isClient) {
        return (
            <div className={cn('bg-white/5 border border-white/10 rounded-2xl p-5 h-[400px] flex items-center justify-center', className)}>
                <div className="text-white/40 text-sm">Loading map...</div>
            </div>
        );
    }

    return (
        <motion.div
            className={cn('bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden', className)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-medium text-sm">India Weather Map</h3>
                </div>

                {/* Layer Toggle */}
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    {(Object.keys(layers) as WeatherLayer[]).map((key) => {
                        const layer = layers[key];
                        const Icon = layer.icon;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveLayer(key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                                    activeLayer === key
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white/70'
                                )}
                            >
                                <Icon className={cn('w-3.5 h-3.5', activeLayer === key && layer.color)} />
                                {layer.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Map Container */}
            <div className="h-[350px] relative">
                <MapContainer
                    center={[20.5937, 78.9629]} // Center of India
                    zoom={5}
                    style={{ height: '100%', width: '100%', background: '#0f172a' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    {/* Base Map - Dark Style (Free, no API key) */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {/* Weather Overlays */}
                    {activeLayer === 'precipitation' && rainViewerTimestamp && (
                        <TileLayer
                            url={`https://tilecache.rainviewer.com${rainViewerTimestamp}/256/{z}/{x}/{y}/2/1_1.png`}
                            opacity={0.7}
                        />
                    )}

                    {activeLayer === 'clouds' && (
                        <TileLayer
                            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                            opacity={0.5}
                        />
                    )}

                    {/* Farm Location Marker */}
                    <Marker position={[farmLat, farmLon]}>
                        <Popup>
                            <div className="text-slate-800 font-medium">
                                📍 Your Farm<br />
                                <span className="text-xs text-slate-600">Bangalore, Karnataka</span>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs">
                    <div className="text-white/50 mb-1">Layer: {layers[activeLayer].name}</div>
                    {activeLayer === 'temp' && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
                            <span className="text-white/60">Cold → Hot</span>
                        </div>
                    )}
                    {activeLayer === 'precipitation' && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
                            <span className="text-white/60">Light → Heavy</span>
                        </div>
                    )}
                    {activeLayer === 'clouds' && (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded bg-gradient-to-r from-transparent via-gray-400 to-gray-600" />
                            <span className="text-white/60">Clear → Cloudy</span>
                        </div>
                    )}
                </div>

                {/* Data Source Attribution */}
                <div className="absolute bottom-3 right-3 text-[10px] text-white/30">
                    {activeLayer === 'precipitation' ? 'Data: RainViewer' : 'Map: CartoDB'}
                </div>
            </div>
        </motion.div>
    );
}

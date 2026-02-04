'use client';

/**
 * Dashboard Map Component
 * =======================
 * Leaflet map with dark theme for displaying farm location.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DashboardMapProps {
    lat?: number;
    lon?: number;
    className?: string;
}

export default function DashboardMap({
    lat = 12.9716,
    lon = 77.5946,
    className = ''
}: DashboardMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Create map with dark theme
        const map = L.map(mapRef.current, {
            center: [lat, lon],
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
        });

        // Dark map tiles (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Custom pulsing marker
        const pulseIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: `
                <div style="position: relative; width: 20px; height: 20px;">
                    <div style="position: absolute; width: 20px; height: 20px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: pulse 2s infinite;"></div>
                    <div style="position: absolute; top: 5px; left: 5px; width: 10px; height: 10px; background: #10b981; border-radius: 50%; border: 2px solid white;"></div>
                </div>
                <style>
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        100% { transform: scale(2.5); opacity: 0; }
                    }
                </style>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        L.marker([lat, lon], { icon: pulseIcon }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [lat, lon]);

    // Update map center when coordinates change
    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 12);
        }
    }, [lat, lon]);

    return (
        <div
            ref={mapRef}
            className={`w-full h-full ${className}`}
            style={{ background: '#1a1a2e' }}
        />
    );
}

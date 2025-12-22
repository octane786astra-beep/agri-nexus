'use client';

/**
 * Weather Forecast Component
 * ==========================
 * 7-day weather forecast display.
 */

import { useSensorStore } from '@/store/useSensorStore';

interface DayForecast {
    day: string;
    icon: string;
    high: number;
    low: number;
    condition: string;
    rain: number;
}

// Generate forecast based on current conditions
const generateForecast = (currentTemp: number): DayForecast[] => {
    const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const conditions: { icon: string; condition: string; rainChance: number }[] = [
        { icon: 'partly_cloudy_day', condition: 'Partly Cloudy', rainChance: 20 },
        { icon: 'cloud', condition: 'Cloudy', rainChance: 40 },
        { icon: 'rainy', condition: 'Light Rain', rainChance: 70 },
        { icon: 'thunderstorm', condition: 'Thunderstorm', rainChance: 90 },
        { icon: 'sunny', condition: 'Sunny', rainChance: 5 },
    ];

    return days.map((day, i) => {
        const cond = conditions[Math.floor(Math.random() * conditions.length)];
        const variance = (Math.random() - 0.5) * 6;
        return {
            day,
            icon: cond.icon,
            high: Math.round(currentTemp + variance + 2),
            low: Math.round(currentTemp + variance - 6),
            condition: cond.condition,
            rain: cond.rainChance,
        };
    });
};

export default function WeatherForecast() {
    const { currentReadings } = useSensorStore();
    const currentTemp = currentReadings?.temperature || 32;
    const currentHumidity = currentReadings?.humidity || 65;

    const forecast = generateForecast(currentTemp);

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">cloud</span>
                </div>
                <div>
                    <h3 className="text-white font-semibold">Weather</h3>
                    <p className="text-white/50 text-xs">7-day forecast</p>
                </div>
            </div>

            {/* Current Weather */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/20 mb-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-xs mb-1">Right Now</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-light text-white">{currentTemp.toFixed(0)}°</span>
                            <span className="text-white/50 text-sm mb-1">C</span>
                        </div>
                        <p className="text-sky-300 text-sm mt-1">Humidity: {currentHumidity.toFixed(0)}%</p>
                    </div>
                    <span className="material-icons-round text-sky-300 text-6xl opacity-60">
                        {currentHumidity > 70 ? 'rainy' : currentTemp > 35 ? 'sunny' : 'partly_cloudy_day'}
                    </span>
                </div>
            </div>

            {/* 7-Day Forecast */}
            <h4 className="text-white/50 text-xs font-medium mb-3">7-DAY FORECAST</h4>
            <div className="space-y-2">
                {forecast.map((day, i) => (
                    <div
                        key={day.day}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${i === 0 ? 'bg-white/10' : 'hover:bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <span className="text-white/60 text-xs w-12">{day.day}</span>
                            <span className="material-icons-round text-sky-300 text-xl">{day.icon}</span>
                            <span className="text-white/50 text-xs flex-1">{day.condition}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {day.rain > 50 && (
                                <div className="flex items-center gap-1 text-sky-400">
                                    <span className="material-icons-round text-sm">water_drop</span>
                                    <span className="text-xs">{day.rain}%</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-white font-medium">{day.high}°</span>
                                <span className="text-white/40">{day.low}°</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Farming Alert */}
            <div className="mt-5 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <div className="flex gap-2">
                    <span className="material-icons-round text-sky-400 text-sm">tips_and_updates</span>
                    <p className="text-sky-200/80 text-xs">
                        {forecast.some(d => d.rain > 60)
                            ? 'Rain expected this week. Plan field activities accordingly and avoid spraying pesticides before rain.'
                            : 'Dry weather expected. Ensure adequate irrigation for your crops.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

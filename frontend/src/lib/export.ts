'use client';

/**
 * Data Export Utilities
 * =====================
 * Export sensor data to CSV format.
 */

interface HistoricalDataPoint {
    time: string;
    temperature: number;
    humidity: number;
    soil_moisture: number;
    pressure: number;
}

/**
 * Convert historical data to CSV format
 */
export function convertToCSV(data: HistoricalDataPoint[]): string {
    if (data.length === 0) return '';

    const headers = ['Time', 'Temperature (°C)', 'Humidity (%)', 'Soil Moisture (%)', 'Pressure (hPa)'];
    const rows = data.map((point) => [
        point.time,
        point.temperature.toFixed(2),
        point.humidity.toFixed(2),
        point.soil_moisture.toFixed(2),
        point.pressure.toFixed(2),
    ]);

    return [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
    ].join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: HistoricalDataPoint[], filename: string = 'sensor_logs.csv'): void {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Download full research report as JSON
 */
export function downloadJSON(data: object, filename: string = 'research_report.json'): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

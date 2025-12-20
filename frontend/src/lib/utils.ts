/**
 * Utility function to merge Tailwind classes
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * API Configuration
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

/**
 * Format temperature with unit
 */
export function formatTemp(temp: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    return `${((temp * 9) / 5 + 32).toFixed(1)}°F`;
  }
  return `${temp.toFixed(1)}°C`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get status color based on value and thresholds
 */
export function getStatusColor(
  value: number,
  thresholds: { danger: number; warning: number; good: number },
  inverse: boolean = false
): 'red' | 'yellow' | 'green' | 'blue' {
  if (inverse) {
    if (value <= thresholds.danger) return 'red';
    if (value <= thresholds.warning) return 'yellow';
    return 'green';
  }
  if (value >= thresholds.danger) return 'red';
  if (value >= thresholds.warning) return 'yellow';
  return 'green';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

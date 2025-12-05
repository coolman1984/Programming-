// Utility functions for class name merging
import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, showSign: boolean = true): string {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get price change color class
 */
export function getPriceChangeColor(change: number): string {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-rose-400';
    return 'text-slate-400';
}

/**
 * Get price change background class
 */
export function getPriceChangeBg(change: number): string {
    if (change > 0) return 'bg-emerald-500/10 border-emerald-500/30';
    if (change < 0) return 'bg-rose-500/10 border-rose-500/30';
    return 'bg-slate-500/10 border-slate-500/30';
}

// Utility functions for class name merging
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @param  {...any} inputs - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format number as currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format number with commas
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted number
 */
export function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {boolean} showSign - Whether to show + sign for positive
 * @returns {string} - Formatted percentage
 */
export function formatPercent(value, showSign = true) {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get price change color class
 * @param {number} change - Price change value
 * @returns {string} - Tailwind color class
 */
export function getPriceChangeColor(change) {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-rose-400';
    return 'text-slate-400';
}

/**
 * Get price change background class
 * @param {number} change - Price change value
 * @returns {string} - Tailwind background class
 */
export function getPriceChangeBg(change) {
    if (change > 0) return 'bg-emerald-500/10 border-emerald-500/30';
    if (change < 0) return 'bg-rose-500/10 border-rose-500/30';
    return 'bg-slate-500/10 border-slate-500/30';
}

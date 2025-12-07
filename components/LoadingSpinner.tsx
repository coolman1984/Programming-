import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const containerClasses = {
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-8',
    };

    return (
        <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
            <Loader2 className={`${sizeClasses[size]} text-amber-500 animate-spin`} />
            {message && (
                <p className="mt-3 text-slate-400 text-sm animate-pulse">{message}</p>
            )}
        </div>
    );
};

// Full page loading state with premium animation
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
    <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-amber-500/20 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="mt-6 text-slate-400 text-lg">{message}</p>
        </div>
    </div>
);

// Premium skeleton for price/ticker cards
export const PriceCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`glass-gold rounded-3xl p-8 md:p-10 ${className}`}
    >
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl skeleton-gold"></div>
            <div className="space-y-2">
                <div className="h-5 w-24 skeleton-gold rounded"></div>
                <div className="h-3 w-32 skeleton rounded"></div>
            </div>
        </div>

        {/* Main price skeleton */}
        <div className="mb-8">
            <div className="h-16 md:h-20 w-64 skeleton-gold rounded-lg mb-4"></div>
            <div className="h-10 w-48 skeleton rounded-full"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl p-4 bg-slate-800/30 border border-slate-700/50">
                    <div className="h-3 w-16 skeleton rounded mb-2"></div>
                    <div className="h-6 w-20 skeleton-gold rounded"></div>
                </div>
            ))}
        </div>

        {/* Footer skeleton */}
        <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-between">
            <div className="h-4 w-32 skeleton rounded"></div>
            <div className="h-4 w-20 skeleton rounded"></div>
        </div>
    </motion.div>
);

// Premium skeleton for charts
export const ChartSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`glass-card rounded-3xl p-8 ${className}`}
    >
        <div className="flex justify-between items-center mb-8">
            <div className="h-8 w-48 skeleton-gold rounded"></div>
            <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-12 skeleton rounded-lg"></div>
                ))}
            </div>
        </div>
        <div className="h-64 bg-slate-800/30 rounded-xl flex items-end justify-around p-4 gap-1 overflow-hidden">
            {[...Array(24)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${30 + Math.sin(i * 0.5) * 25 + Math.random() * 20}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
                    className="skeleton-gold rounded-t flex-1 min-w-[8px]"
                ></motion.div>
            ))}
        </div>
        <div className="flex justify-between mt-4">
            {['1H', '24H', '7D', '1M'].map((_, i) => (
                <div key={i} className="h-3 w-8 skeleton rounded"></div>
            ))}
        </div>
    </motion.div>
);

// Premium skeleton for news feed items
export const NewsItemSkeleton: React.FC = () => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-xl p-5 border border-slate-800/50"
    >
        <div className="flex gap-4">
            <div className="w-16 h-16 rounded-lg skeleton-gold flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
                <div className="h-4 w-full skeleton rounded"></div>
                <div className="h-4 w-3/4 skeleton rounded"></div>
                <div className="flex gap-4">
                    <div className="h-3 w-20 skeleton rounded"></div>
                    <div className="h-3 w-16 skeleton rounded"></div>
                </div>
            </div>
        </div>
    </motion.div>
);

// News feed skeleton (multiple items)
export const NewsFeedSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
            >
                <NewsItemSkeleton />
            </motion.div>
        ))}
    </div>
);

// Premium skeleton for stats/metrics cards
export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-card rounded-2xl p-6 ${className}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="h-4 w-24 skeleton rounded"></div>
            <div className="h-6 w-12 skeleton-gold rounded-full"></div>
        </div>
        <div className="h-10 w-28 skeleton-gold rounded mb-4"></div>
        <div className="space-y-2">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full skeleton-gold"
                ></motion.div>
            </div>
            <div className="h-3 w-20 skeleton rounded"></div>
        </div>
    </motion.div>
);

// Technical outlook skeleton
export const TechnicalOutlookSkeleton: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-6"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl skeleton-gold"></div>
            <div className="h-6 w-40 skeleton-gold rounded"></div>
        </div>
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="h-8 w-24 skeleton-gold rounded"></div>
                <div className="h-6 w-16 skeleton rounded"></div>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full skeleton-gold"
                ></motion.div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center">
                        <div className="h-4 w-12 mx-auto skeleton rounded mb-2"></div>
                        <div className="h-6 w-16 mx-auto skeleton-gold rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

// AI Forecast card skeleton
export const AIForecastSkeleton: React.FC = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-gold rounded-2xl p-6"
    >
        <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg skeleton-gold"></div>
            <div className="h-5 w-32 skeleton-gold rounded"></div>
        </div>
        <div className="space-y-4">
            <div className="h-12 w-full skeleton-gold rounded-lg"></div>
            <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg p-3 bg-slate-800/30">
                        <div className="h-3 w-16 skeleton rounded mb-2"></div>
                        <div className="h-5 w-20 skeleton-gold rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

// Legacy CardSkeleton for backward compatibility
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`glass-card rounded-2xl p-6 ${className}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="h-4 w-24 skeleton rounded"></div>
            <div className="h-6 w-16 skeleton-gold rounded"></div>
        </div>
        <div className="h-10 w-3/4 skeleton-gold rounded mb-4"></div>
        <div className="space-y-2">
            <div className="h-3 w-full skeleton rounded"></div>
            <div className="h-3 w-5/6 skeleton rounded"></div>
        </div>
    </motion.div>
);

export default LoadingSpinner;
import React from 'react';
import { Loader2 } from 'lucide-react';

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

// Full page loading state
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

// Skeleton loader for cards
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`bg-[#0f172a] border border-slate-800 rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="h-4 bg-slate-700 rounded w-24"></div>
            <div className="h-6 bg-slate-700 rounded w-16"></div>
        </div>
        <div className="h-10 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        </div>
    </div>
);

// Skeleton loader for charts
export const ChartSkeleton: React.FC = () => (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 animate-pulse">
        <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-slate-700 rounded w-48"></div>
            <div className="flex gap-2">
                <div className="h-10 bg-slate-700 rounded w-16"></div>
                <div className="h-10 bg-slate-700 rounded w-16"></div>
            </div>
        </div>
        <div className="h-64 bg-slate-800/50 rounded-xl flex items-end justify-around p-4">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="bg-slate-700 rounded-t w-6"
                    style={{ height: `${30 + Math.random() * 70}%` }}
                ></div>
            ))}
        </div>
    </div>
);

export default LoadingSpinner;
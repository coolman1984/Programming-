import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Activity, Zap } from 'lucide-react';
import { cn, formatCurrency, formatPercent, getPriceChangeColor, getPriceChangeBg } from '../../src/lib/utils.js';

interface MarketStatsProps {
    high24h: number;
    low24h: number;
    open24h: number;
    volume24h: number;
    change24h: number;
    change24hPercent: number;
    weeklyChange: number;
    monthlyChange: number;
}

const MarketStats: React.FC<MarketStatsProps> = ({
    high24h,
    low24h,
    open24h,
    volume24h,
    change24h,
    change24hPercent,
    weeklyChange,
    monthlyChange,
}) => {
    const stats = [
        {
            label: '24h High',
            value: formatCurrency(high24h),
            icon: TrendingUp,
            color: 'emerald',
            description: 'Highest price in 24 hours'
        },
        {
            label: '24h Low',
            value: formatCurrency(low24h),
            icon: TrendingDown,
            color: 'rose',
            description: 'Lowest price in 24 hours'
        },
        {
            label: 'Open Price',
            value: formatCurrency(open24h),
            icon: Activity,
            color: 'blue',
            description: 'Opening price 24h ago'
        },
        {
            label: '24h Volume',
            value: `$${(volume24h / 1e9).toFixed(2)}B`,
            icon: BarChart3,
            color: 'amber',
            description: 'Trading volume in 24h'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="glass-card rounded-2xl p-5 card-hover cursor-default group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn(
                                "p-2 rounded-lg",
                                stat.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                                stat.color === 'rose' && 'bg-rose-500/20 text-rose-400',
                                stat.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                                stat.color === 'amber' && 'bg-amber-500/20 text-amber-400',
                            )}>
                                <stat.icon size={18} />
                            </div>
                            <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-white number-ticker">
                            {stat.value}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {stat.description}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Change Indicators */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={18} className="text-amber-400" />
                    <h3 className="font-semibold text-white">Price Performance</h3>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <PerformanceItem
                        label="24 Hours"
                        value={change24hPercent}
                    />
                    <PerformanceItem
                        label="7 Days"
                        value={weeklyChange}
                    />
                    <PerformanceItem
                        label="30 Days"
                        value={monthlyChange}
                    />
                </div>
            </motion.div>
        </div>
    );
};

interface PerformanceItemProps {
    label: string;
    value: number;
}

const PerformanceItem: React.FC<PerformanceItemProps> = ({ label, value }) => {
    const isUp = value > 0;
    const isDown = value < 0;

    return (
        <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">{label}</p>
            <div className={cn(
                "inline-flex items-center gap-1 px-4 py-2 rounded-full font-semibold",
                getPriceChangeBg(value)
            )}>
                {isUp && <TrendingUp size={16} className="text-emerald-400" />}
                {isDown && <TrendingDown size={16} className="text-rose-400" />}
                <span className={getPriceChangeColor(value)}>
                    {formatPercent(value)}
                </span>
            </div>
        </div>
    );
};

export default MarketStats;

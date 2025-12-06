import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn, formatCurrency, formatPercent, getPriceChangeColor, getPriceChangeBg } from '../src/lib/utils';

interface PriceCardProps {
    price: number;
    previousPrice: number;
    change24h: number;
    change24hPercent: number;
    high24h: number;
    low24h: number;
    lastUpdated: Date;
    isLive?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({
    price,
    previousPrice,
    change24h,
    change24hPercent,
    high24h,
    low24h,
    lastUpdated,
    isLive = true
}) => {
    const isUp = change24h > 0;
    const isDown = change24h < 0;
    const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden"
        >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/5 blur-3xl" />

            <div className="relative glass-gold rounded-3xl p-8 md:p-10">
                {/* Live Indicator */}
                {isLive && (
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                        <span className="text-emerald-400 text-sm font-medium">LIVE</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg glow-gold-sm">
                        <span className="text-2xl">🥇</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Gold Spot</h2>
                        <p className="text-slate-400 text-sm">XAU/USD · Troy Ounce</p>
                    </div>
                </div>

                {/* Main Price */}
                <div className="mb-8">
                    <motion.div
                        key={price}
                        initial={{ scale: 1.02, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-baseline gap-2"
                    >
                        <span className="text-5xl md:text-7xl font-bold text-gold-gradient number-ticker">
                            {formatCurrency(price)}
                        </span>
                        <span className="text-slate-400 text-xl">/oz</span>
                    </motion.div>

                    {/* Change Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                            "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border",
                            getPriceChangeBg(change24h)
                        )}
                    >
                        <TrendIcon className={cn("w-5 h-5", getPriceChangeColor(change24h))} />
                        <span className={cn("font-semibold", getPriceChangeColor(change24h))}>
                            {formatCurrency(Math.abs(change24h))}
                        </span>
                        <span className={cn("font-semibold", getPriceChangeColor(change24h))}>
                            ({formatPercent(change24hPercent)})
                        </span>
                        <span className="text-slate-500 text-sm">24h</span>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem label="24h High" value={formatCurrency(high24h)} color="emerald" />
                    <StatItem label="24h Low" value={formatCurrency(low24h)} color="rose" />
                    <StatItem
                        label="Bid"
                        value={formatCurrency(price - 0.5)}
                        color="amber"
                        subtext="Buy Price"
                    />
                    <StatItem
                        label="Ask"
                        value={formatCurrency(price + 0.5)}
                        color="amber"
                        subtext="Sell Price"
                    />
                </div>

                {/* Last Updated */}
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors">
                        <Info size={14} />
                        <span>Price Info</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

interface StatItemProps {
    label: string;
    value: string;
    color: 'emerald' | 'rose' | 'amber' | 'blue';
    subtext?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color, subtext }) => {
    const colorClasses = {
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
                "rounded-xl p-4 border transition-all duration-300",
                colorClasses[color]
            )}
        >
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className={cn("text-lg font-bold number-ticker", `text-${color}-400`)}>
                {value}
            </p>
            {subtext && (
                <p className="text-slate-500 text-xs mt-1">{subtext}</p>
            )}
        </motion.div>
    );
};

export default PriceCard;

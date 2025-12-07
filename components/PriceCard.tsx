import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn, formatCurrency, formatPercent, getPriceChangeColor, getPriceChangeBg } from '../src/lib/utils';
import NumberTicker from './NumberTicker';
import LastUpdatedTimer from './LastUpdatedTimer';

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
    // Determine immediate trend for flash effect
    const [flashState, setFlashState] = useState<'none' | 'green' | 'red'>('none');
    const prevPriceRef = useRef(price);

    // Effect to handle flash animation and confetti
    useEffect(() => {
        if (price !== prevPriceRef.current) {
            const direction = price > prevPriceRef.current ? 'green' : 'red';
            setFlashState(direction);

            // Reset flash
            const timer = setTimeout(() => setFlashState('none'), 1000);

            // Trigger confetti on significant milestones (simulated here as any $10 jump for demo)
            // In production, this would be crossing 2000, 2100, etc.
            if (price > prevPriceRef.current + 10) {
                triggerReaction();
            }

            prevPriceRef.current = price;
            return () => clearTimeout(timer);
        }
    }, [price]);

    const triggerReaction = () => {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio: number, opts: any) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    // Demo function to manually trigger celebration
    const handleConfettiDemo = (e: React.MouseEvent) => {
        e.stopPropagation();
        triggerReaction();
    };

    const isUp = change24h > 0;
    const isDown = change24h < 0;
    const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden w-full"
        >
            {/* Background Glow Effect */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-600/5 blur-3xl transition-opacity duration-500",
                flashState !== 'none' ? "opacity-50" : "opacity-20"
            )} />

            <div className={cn(
                "relative glass-gold pulse-live rounded-3xl p-8 md:p-10 transition-all duration-500",
                flashState === 'green' && "bg-emerald-500/10 border-emerald-500/30",
                flashState === 'red' && "bg-rose-500/10 border-rose-500/30"
            )}>
                {/* Live Indicator */}
                {isLive && (
                    <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3 pulse-dot text-emerald-500">
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                            </span>
                            <span className="text-emerald-400 text-sm font-medium tracking-wide">LIVE</span>
                        </div>
                        <LastUpdatedTimer timestamp={lastUpdated} />
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg glow-gold-sm float-slow cursor-pointer active:scale-95 transition-transform"
                        onClick={handleConfettiDemo}
                        title="Click for celebration demo!"
                    >
                        <span className="text-3xl">🥇</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-serif tracking-wide">Gold Spot</h2>
                        <p className="text-slate-400 text-sm font-medium tracking-wide opacity-80">XAU/USD · Troy Ounce</p>
                    </div>
                </div>

                {/* Main Price */}
                <div className="mb-8">
                    <div className="flex items-baseline gap-2 overflow-hidden">
                        <motion.span
                            key="price-display"
                            className={cn(
                                "text-5xl md:text-7xl font-bold font-serif tracking-tight tabular-nums transition-colors duration-300",
                                flashState === 'green' ? "text-emerald-400" :
                                    flashState === 'red' ? "text-rose-400" :
                                        "text-gold-gradient"
                            )}
                        >
                            <NumberTicker value={price} decimals={2} />
                        </motion.span>
                        <span className="text-slate-400 text-xl font-medium">/oz</span>
                    </div>

                    {/* Change Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border backdrop-blur-md",
                            getPriceChangeBg(change24h)
                        )}
                    >
                        <TrendIcon className={cn("w-5 h-5", getPriceChangeColor(change24h))} />
                        <span className={cn("font-bold tabular-nums", getPriceChangeColor(change24h))}>
                            <NumberTicker value={Math.abs(change24h)} currency="$" decimals={2} />
                        </span>
                        <span className={cn("font-bold tabular-nums", getPriceChangeColor(change24h))}>
                            ({formatPercent(change24hPercent)})
                        </span>
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider ml-1">24h Change</span>
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5 pt-6">
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
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className={cn("text-lg font-bold tabular-nums font-mono", `text-${color}-400`)}>
                {value}
            </p>
            {subtext && (
                <p className="text-slate-500 text-[10px] mt-1 font-medium">{subtext}</p>
            )}
        </motion.div>
    );
};

export default PriceCard;

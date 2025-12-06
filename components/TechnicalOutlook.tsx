import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Target, Shield, Zap, Loader2 } from 'lucide-react';
import { TechnicalOutlookData } from '../types';

interface TechnicalOutlookProps {
    data: TechnicalOutlookData | null;
    loading?: boolean;
}

const TechnicalOutlook: React.FC<TechnicalOutlookProps> = ({ data, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                        <BarChart3 size={24} className="text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white font-serif">Technical Outlook (XAU/USD)</h2>
                </div>
                <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 size={24} className="text-amber-500 animate-spin" />
                    <span className="text-slate-400 text-sm">Generating outlook...</span>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-[#111111] border border-slate-800/50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                        <BarChart3 size={24} className="text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white font-serif">Technical Outlook (XAU/USD)</h2>
                </div>
                <div className="text-center py-12">
                    <div className="text-slate-500 text-sm">Loading market outlook...</div>
                </div>
            </div>
        );
    }

    const confidence = data.confidence || 80;
    const sentiment = data.sentiment || 'neutral';
    const strengthening = data.strengthening_factors || 0;
    const weakening = data.weakening_factors || 0;

    const getSentimentColor = () => {
        if (sentiment === 'bullish') return 'emerald';
        if (sentiment === 'bearish') return 'rose';
        return 'amber';
    };

    const getSentimentIcon = () => {
        if (sentiment === 'bullish') return <TrendingUp size={20} />;
        if (sentiment === 'bearish') return <TrendingDown size={20} />;
        return <Minus size={20} />;
    };

    const color = getSentimentColor();

    return (
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/40 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                        <BarChart3 size={24} className="text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white font-serif">Technical Outlook (XAU/USD)</h2>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${sentiment === 'bullish' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                        sentiment === 'bearish' ? 'bg-rose-500/10 border border-rose-500/30' :
                            'bg-amber-500/10 border border-amber-500/30'
                    }`}>
                    <span className={`${sentiment === 'bullish' ? 'text-emerald-400' :
                            sentiment === 'bearish' ? 'text-rose-400' :
                                'text-amber-400'
                        }`}>{getSentimentIcon()}</span>
                    <span className={`font-bold text-sm uppercase tracking-wide ${sentiment === 'bullish' ? 'text-emerald-400' :
                            sentiment === 'bearish' ? 'text-rose-400' :
                                'text-amber-400'
                        }`}>
                        {sentiment}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left: Analysis Summary */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Market Analysis</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {data.summary || 'No technical analysis available.'}
                        </p>
                    </div>

                    {/* Factor Counts */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={16} className="text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400 uppercase">Strengthening</span>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">{strengthening}</div>
                            <div className="text-xs text-slate-500">factors identified</div>
                        </div>
                        <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown size={16} className="text-rose-400" />
                                <span className="text-xs font-bold text-rose-400 uppercase">Weakening</span>
                            </div>
                            <div className="text-2xl font-bold text-rose-400">{weakening}</div>
                            <div className="text-xs text-slate-500">factors identified</div>
                        </div>
                    </div>
                </div>

                {/* Right: AI Confidence */}
                <div className="flex flex-col items-center justify-center bg-[#0a0a0a] rounded-2xl p-8 border border-slate-800/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Confidence</span>
                    </div>

                    <div className="text-6xl font-bold text-white font-mono mb-4">
                        {confidence}<span className="text-3xl text-slate-400">%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 transition-all duration-500"
                            style={{ width: `${confidence}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Zap size={12} className="text-amber-500" />
                        <span>Based on 6+ verified sources</span>
                    </div>
                </div>
            </div>

            {/* Key Drivers */}
            {data.key_drivers && data.key_drivers.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800/50">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target size={14} className="text-amber-500" />
                        Key Price Drivers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.key_drivers.slice(0, 3).map((driver, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border ${driver.sentiment === 'bullish'
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : driver.sentiment === 'bearish'
                                            ? 'bg-rose-500/5 border-rose-500/20'
                                            : 'bg-slate-800/30 border-slate-700/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium text-sm">{driver.name}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${driver.sentiment === 'bullish'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : driver.sentiment === 'bearish'
                                                ? 'bg-rose-500/20 text-rose-400'
                                                : 'bg-slate-700 text-slate-400'
                                        }`}>
                                        {driver.impact}%
                                    </span>
                                </div>
                                <p className="text-slate-500 text-xs line-clamp-2">{driver.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicalOutlook;

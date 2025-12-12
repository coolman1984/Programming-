import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Target, Shield, Zap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
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

    const getSentimentIcon = () => {
        if (sentiment === 'bullish') return <TrendingUp size={20} />;
        if (sentiment === 'bearish') return <TrendingDown size={20} />;
        return <Minus size={20} />;
    };

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

            {/* Market Analysis - 4 Line Summary */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Market Analysis</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {data.summary || 'No technical analysis available.'}
                </p>
            </div>

            {/* Factor Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Strengthening Factors */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={18} className="text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400 uppercase">Strengthening ({strengthening})</span>
                    </div>
                    <div className="space-y-3">
                        {(data.strengthening_list || []).map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-white text-sm font-medium">{factor.name}: </span>
                                    <span className="text-slate-400 text-sm">{factor.brief}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weakening Factors */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown size={18} className="text-rose-400" />
                        <span className="text-sm font-bold text-rose-400 uppercase">Weakening ({weakening})</span>
                    </div>
                    <div className="space-y-3">
                        {(data.weakening_list || []).map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <AlertCircle size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="text-white text-sm font-medium">{factor.name}: </span>
                                    <span className="text-slate-400 text-sm">{factor.brief}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Confidence Card */}
            <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-slate-800/50 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Confidence</span>
                </div>

                <div className="flex items-center gap-6 mb-4">
                    <div className="text-5xl font-bold text-white font-mono">
                        {confidence}<span className="text-2xl text-slate-400">%</span>
                    </div>
                    <div className="flex-1">
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 transition-all duration-500"
                                style={{ width: `${confidence}%` }}
                            />
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            {data.confidence_explanation || 'Based on analysis of multiple verified financial sources.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Drivers */}
            {data.key_drivers && data.key_drivers.length > 0 && (
                <div className="pt-6 border-t border-slate-800/50">
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
                                <div className="flex items-center justify-between mb-3">
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
                                <p className="text-slate-400 text-xs leading-relaxed">{driver.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicalOutlook;


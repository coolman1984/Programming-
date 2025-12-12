/**
 * Bank Opinions Card Component
 * Displays institutional analyst opinions on gold
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BankOpinion {
    name: string;
    stance: 'bullish' | 'bearish' | 'neutral';
    price_target?: string;
    timeframe?: string;
    comment?: string;
}

interface BankOpinionsProps {
    summary: string;
    banks: BankOpinion[];
}

const BankOpinions: React.FC<BankOpinionsProps> = ({ summary, banks }) => {
    const getStanceIcon = (stance: string) => {
        switch (stance) {
            case 'bullish':
                return <TrendingUp size={16} className="text-emerald-400" />;
            case 'bearish':
                return <TrendingDown size={16} className="text-rose-400" />;
            default:
                return <Minus size={16} className="text-slate-400" />;
        }
    };

    const getStanceColor = (stance: string) => {
        switch (stance) {
            case 'bullish':
                return 'border-emerald-500/30 bg-emerald-500/5';
            case 'bearish':
                return 'border-rose-500/30 bg-rose-500/5';
            default:
                return 'border-slate-500/30 bg-slate-500/5';
        }
    };

    return (
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4 font-serif">
                <Building2 size={24} className="text-purple-400" />
                Top Bank Opinions
            </h3>

            {/* Summary */}
            <div className="prose prose-invert prose-base text-slate-400 leading-loose mb-8">
                <ReactMarkdown>{summary}</ReactMarkdown>
            </div>

            {/* Bank Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {banks.map((bank, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-xl border ${getStanceColor(bank.stance)} transition-all hover:scale-105`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {getStanceIcon(bank.stance)}
                            <span className="font-semibold text-white text-sm truncate">
                                {bank.name}
                            </span>
                        </div>
                        {bank.price_target && (
                            <div className="text-amber-500 font-bold text-lg">
                                {bank.price_target}
                            </div>
                        )}
                        {bank.timeframe && (
                            <div className="text-xs text-slate-500">{bank.timeframe}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BankOpinions;

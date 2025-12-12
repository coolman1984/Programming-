/**
 * Executive Summary Card Component
 * Extracted from DeepAnalysisView for better maintainability
 */

import React from 'react';
import { TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExecutiveSummaryProps {
    summary: string;
    isPositive: boolean;
    sentimentScore: number;
}

// Helper to render text with inline citations highlighted
const renderWithCitations = (text: string) => {
    const citationRegex = /\[Source:\s*([^\]]+)\]/g;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <span key={index} className="text-amber-500 font-medium text-xs">
                    [{part}]
                </span>
            );
        }
        return part;
    });
};

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
    summary,
    isPositive,
    sentimentScore,
}) => {
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const trendColor = isPositive ? 'text-emerald-400' : 'text-rose-400';

    return (
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6 border-b border-amber-500/20 pb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 font-serif">
                    <Newspaper size={24} className="text-amber-500" />
                    Executive Summary
                </h3>
                <div className={`flex items-center gap-2 ${trendColor}`}>
                    <TrendIcon size={20} />
                    <span className="font-bold">{sentimentScore}% Bullish</span>
                </div>
            </div>

            <div className="prose prose-invert prose-lg text-slate-300 leading-loose max-w-none">
                <ReactMarkdown
                    components={{
                        p: ({ children }) => (
                            <p className="mb-4 leading-relaxed">
                                {typeof children === 'string'
                                    ? renderWithCitations(children)
                                    : children}
                            </p>
                        ),
                        strong: ({ children }) => (
                            <strong className="text-amber-500 font-semibold">{children}</strong>
                        ),
                    }}
                >
                    {summary}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default ExecutiveSummary;

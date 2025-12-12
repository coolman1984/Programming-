/**
 * Sources List Component
 * Displays analysis sources grouped by impact level
 */

import React from 'react';
import { ExternalLink, CheckCircle2, Link2 } from 'lucide-react';
import { AnalysisSource } from '../../types';

interface SourcesListProps {
    sources: AnalysisSource[];
    title?: string;
}

const SourcesList: React.FC<SourcesListProps> = ({
    sources,
    title = 'Verified Sources'
}) => {
    // Group sources by impact
    const highImpact = sources.filter(s => s.impact_label === 'High Impact');
    const mediumImpact = sources.filter(s => s.impact_label === 'Medium Impact');
    const lowImpact = sources.filter(s => s.impact_label === 'Low Impact');

    const renderSourceGroup = (
        groupSources: AnalysisSource[],
        label: string,
        color: string
    ) => {
        if (groupSources.length === 0) return null;

        return (
            <div className="mb-6">
                <div className={`text-xs font-bold ${color} uppercase tracking-widest mb-3`}>
                    {label} ({groupSources.length})
                </div>
                <div className="space-y-2">
                    {groupSources.map((source, idx) => (
                        <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-800/50 transition-colors group"
                        >
                            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate group-hover:text-amber-400 transition-colors">
                                    {source.title}
                                </div>
                                <div className="text-slate-500 text-xs">{source.source}</div>
                            </div>
                            <ExternalLink size={14} className="text-slate-500 group-hover:text-amber-400 flex-shrink-0" />
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-amber-500/20 pb-4">
                <Link2 size={20} className="text-amber-500" />
                {title}
                <span className="text-slate-500 font-normal text-sm ml-2">
                    ({sources.length} sources)
                </span>
            </h3>

            {renderSourceGroup(highImpact, 'High Impact', 'text-emerald-400')}
            {renderSourceGroup(mediumImpact, 'Medium Impact', 'text-amber-400')}
            {renderSourceGroup(lowImpact, 'Reference', 'text-slate-400')}

            {sources.length === 0 && (
                <div className="text-slate-500 text-center py-8">
                    No sources available
                </div>
            )}
        </div>
    );
};

export default SourcesList;

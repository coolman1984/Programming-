import React from 'react';
import { NewsItem } from '../types';
import { TrendingUp, TrendingDown, Minus, Building2, Globe2, Landmark, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NewsFeedProps {
  news: NewsItem[];
}

// Map sources to categories and icons
const getCategoryInfo = (source: string, index: number) => {
  const categories = [
    { label: 'MONETARY POLICY', icon: Landmark, color: 'amber' },
    { label: 'GEOPOLITICS', icon: Globe2, color: 'amber' },
    { label: 'CENTRAL BANKS', icon: Building2, color: 'amber' },
    { label: 'MARKET ANALYSIS', icon: BarChart3, color: 'amber' },
    { label: 'INSTITUTIONAL', icon: Building2, color: 'amber' },
    { label: 'TECHNICAL', icon: BarChart3, color: 'amber' },
  ];
  return categories[index % categories.length];
};

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  const navigate = useNavigate();

  const handleReadAnalysis = (item: NewsItem) => {
    navigate(`/article/${item.id}`, { state: { seed: item } });
  };

  if (news.length === 0) {
    return <div className="text-slate-500 text-center py-8 text-lg">No insights available.</div>;
  }

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Market Drivers Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <BarChart3 size={24} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Market Drivers</h2>
        </div>
        <span className="text-slate-500 text-sm">Curated Intelligence • {dateLabel}</span>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {news.map((item, index) => {
          const category = getCategoryInfo(item.source, index);
          const Icon = category.icon;
          const publishDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          });

          return (
            <div
              key={item.id}
              onClick={() => handleReadAnalysis(item)}
              className="bg-[#111111] border border-amber-500/20 rounded-xl p-6 relative overflow-hidden h-full flex flex-col hover:border-amber-500/50 transition-all cursor-pointer group shadow-lg hover:shadow-amber-500/10"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-5">
                <div className="bg-transparent p-2.5 rounded-lg border border-amber-500/30 text-amber-500">
                  <Icon size={22} className="text-amber-500" />
                </div>

                {/* Sentiment Badge */}
                <span className={`text-[10px] font-bold px-3 py-1 rounded bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 tracking-wider`}>
                  BULLISH
                </span>
              </div>

              {/* Category Label */}
              <p className="text-amber-500 text-[11px] font-bold tracking-[0.1em] uppercase mb-3 opacity-90">
                {category.label}
              </p>

              {/* Title */}
              <h4 className="text-[#fefce8] font-bold text-xl mb-3 leading-snug font-serif tracking-tight">
                {item.title}
              </h4>

              {/* Summary */}
              <p className="text-[#94a3b8] text-[13px] leading-[1.6] flex-grow mb-6 line-clamp-3 font-normal">
                {item.summary}
              </p>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-800/40 flex justify-between items-center bg-transparent">
                <span className="text-slate-500 text-xs font-medium">
                  {publishDate}
                </span>
                <span className="text-amber-500 text-xs font-bold flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity tracking-wide">
                  READ ANALYSIS <ArrowRight size={14} className="stroke-[3]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;

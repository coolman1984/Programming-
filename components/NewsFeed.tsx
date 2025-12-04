
import React from 'react';
import { NewsItem } from '../types';
import { TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  if (news.length === 0) {
    return <div className="text-slate-500 text-center py-8 text-lg">No insights available.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {news.map((item) => (
        <div 
          key={item.id} 
          className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 relative overflow-hidden h-full flex flex-col shadow-lg"
        >
          {/* Static Decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>

          {/* Header */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 rounded-lg text-amber-500">
                    <FileText size={20} />
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                {item.source}
                </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                {item.sentiment === 'positive' && <TrendingUp size={18} className="text-emerald-500" />}
                {item.sentiment === 'negative' && <TrendingDown size={18} className="text-rose-500" />}
                {item.sentiment === 'neutral' && <Minus size={18} className="text-slate-500" />}
                <span className={`text-sm font-bold ${
                    item.sentiment === 'positive' ? 'text-emerald-500' :
                    item.sentiment === 'negative' ? 'text-rose-500' :
                    'text-slate-500'
                }`}>
                    {item.sentiment === 'positive' ? 'Bullish' : item.sentiment === 'negative' ? 'Bearish' : 'Neutral'}
                </span>
            </div>
          </div>
          
          {/* Title */}
          <h4 className="text-white font-bold text-2xl mb-4 leading-normal font-serif relative z-10 border-b border-slate-800/50 pb-4 text-left">
             {item.title}
          </h4>
          
          {/* Rich Content */}
          <p className="text-slate-300 text-lg leading-loose font-medium text-left relative z-10 flex-grow">
             {item.summary}
          </p>
          
          {/* Footer Time */}
          <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-end relative z-10">
             <span className="text-sm text-slate-500 font-mono font-semibold">
               {new Date(item.publishedAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsFeed;


import React from 'react';
import { DeepAnalysisData } from '../types';
import { TrendingUp, TrendingDown, ExternalLink, Zap, ShieldCheck, Newspaper, BarChart3, Globe2, Activity, Info, CheckCircle2, Link2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

interface DeepAnalysisViewProps {
   data: DeepAnalysisData;
}

// Helper to render text with inline citations highlighted
const renderWithCitations = (text: string) => {
   // Match [Source: Name] patterns and style them
   const parts = text.split(/(\[Source:\s*[^\]]+\])/g);
   return parts.map((part, idx) => {
      if (part.match(/\[Source:\s*[^\]]+\]/)) {
         return (
            <span key={idx} className="inline-flex items-center gap-1 text-amber-400 font-medium text-sm bg-amber-500/10 px-1.5 py-0.5 rounded mx-0.5">
               <Link2 size={10} />
               {part}
            </span>
         );
      }
      return <span key={idx}>{part}</span>;
   });
};

const DeepAnalysisView: React.FC<DeepAnalysisViewProps> = ({ data }) => {
   const isGood = data.overall_sentiment_score >= 60;
   const { t } = useLanguage();

   // Group sources by impact
   const highImpactSources = data.sources.filter(s => s.impact_label === 'High Impact');
   const mediumImpactSources = data.sources.filter(s => s.impact_label === 'Medium Impact');
   const lowImpactSources = data.sources.filter(s => s.impact_label === 'Low Impact');

   return (
      <div className="space-y-10 animate-in fade-in duration-700 pb-16">

         {/* SOURCE COUNT BADGE */}
         <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30">
               <CheckCircle2 size={18} />
               <span className="font-bold">{data.sources.length}+ Verified Sources</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full border border-amber-500/30">
               <BookOpen size={18} />
               <span className="font-bold">Multi-Domain Research</span>
            </div>
         </div>

         {/* FINANCIAL METRICS CARDS */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.metrics && data.metrics.map((metric, idx) => (
               <div key={idx} className="bg-[#111111] border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:border-amber-500/30 transition-colors group relative">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{metric.label}</span>
                     <div className="text-slate-600 group-hover:text-amber-400 transition-colors cursor-help" title={metric.description}>
                        <Info size={14} />
                     </div>
                  </div>

                  <span className={`text-4xl font-bold font-mono mb-3 ${metric.color === 'green' ? 'text-emerald-400' :
                     metric.color === 'red' ? 'text-rose-400' :
                        metric.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
                     }`}>
                     {metric.value}
                  </span>

                  <span className="text-slate-500 text-xs flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full">
                     {metric.trend === 'up' && <TrendingUp size={12} />}
                     {metric.trend === 'down' && <TrendingDown size={12} />}
                     {metric.trend.toUpperCase()}
                  </span>

                  <div className="mt-5 pt-4 border-t border-amber-500/20 w-full">
                     <p className="text-xs text-slate-400 italic leading-relaxed">
                        "{metric.description || "Key financial indicator."}"
                     </p>
                  </div>
               </div>
            ))}
         </div>

         {/* EXECUTIVE SUMMARY - With inline citation highlighting */}
         <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-10 relative overflow-hidden shadow-2xl">
            <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-10 pointer-events-none ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-500/20 p-2.5 rounded-lg text-amber-500"><Newspaper size={28} /></div>
                  <div className="flex flex-col">
                     <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">{t('analysis.market_story')}</span>
                     <span className="text-slate-500 text-xs">Strategic Analysis • {data.sources.length}+ Sources Verified</span>
                  </div>
               </div>

               <h1 className="text-3xl md:text-5xl font-bold text-white mb-10 leading-tight font-serif">
                  {data.headline || "Comprehensive Gold Market Analysis"}
               </h1>

               <div className="prose prose-invert prose-xl max-w-none text-slate-300 leading-loose font-serif prose-headings:font-sans">
                  <ReactMarkdown
                     components={{
                        p: ({ children }) => (
                           <p className="mb-6 leading-relaxed">
                              {typeof children === 'string' ? renderWithCitations(children) : children}
                           </p>
                        ),
                        strong: ({ children }) => (
                           <strong className="text-white font-bold">{children}</strong>
                        )
                     }}
                  >
                     {data.executive_summary}
                  </ReactMarkdown>
               </div>
            </div>
         </div>

         {/* DETAILED SECTIONS */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
               <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4 font-serif">
                  <Activity size={24} className="text-blue-400" /> {t('analysis.global_macro')}
               </h3>
               <div className="prose prose-invert prose-base text-slate-400 leading-loose">
                  <ReactMarkdown
                     components={{
                        p: ({ children }) => (
                           <p className="mb-4 leading-relaxed">
                              {typeof children === 'string' ? renderWithCitations(children) : children}
                           </p>
                        )
                     }}
                  >
                     {data.macro_analysis}
                  </ReactMarkdown>
               </div>
            </div>

            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
               <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4 font-serif">
                  <Globe2 size={24} className="text-amber-400" /> {t('analysis.geopolitical')}
               </h3>
               <div className="prose prose-invert prose-base text-slate-400 leading-loose">
                  <ReactMarkdown
                     components={{
                        p: ({ children }) => (
                           <p className="mb-4 leading-relaxed">
                              {typeof children === 'string' ? renderWithCitations(children) : children}
                           </p>
                        )
                     }}
                  >
                     {data.geopolitical_analysis}
                  </ReactMarkdown>
               </div>
            </div>

            <div className="lg:col-span-2 bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
               <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-amber-500/20 pb-4 font-serif">
                  <BarChart3 size={24} className="text-purple-400" /> {t('analysis.technical')}
               </h3>
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 prose prose-invert prose-base text-slate-400 leading-loose">
                     <ReactMarkdown
                        components={{
                           p: ({ children }) => (
                              <p className="mb-4 leading-relaxed">
                                 {typeof children === 'string' ? renderWithCitations(children) : children}
                              </p>
                           )
                        }}
                     >
                        {data.technical_analysis}
                     </ReactMarkdown>
                  </div>
                  <div className="w-full md:w-1/3 bg-slate-900/50 rounded-2xl border border-amber-500/20 p-6 flex flex-col items-center justify-center">
                     <div className="text-sm text-slate-500 uppercase tracking-widest mb-3">AI Confidence</div>
                     <div className="text-6xl font-bold text-white mb-2">{data.confidence_score}%</div>
                     <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mt-4">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full" style={{ width: `${data.confidence_score}%` }}></div>
                     </div>
                     <div className="mt-4 text-xs text-slate-500 text-center">
                        Based on {data.sources.length}+ verified sources
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* DRIVERS & BALANCE */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Zap size={20} className="text-amber-400" /> {t('analysis.drivers')}</h3>
               <div className="space-y-5">
                  {data.drivers.map((driver, idx) => (
                     <div key={idx} className="bg-slate-900/50 rounded-xl p-5 border border-amber-500/20">
                        <div className="flex justify-between items-center mb-3">
                           <span className="font-bold text-slate-200 text-base">{driver.name}</span>
                           <span className={`text-xs px-2.5 py-1 rounded font-bold ${driver.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
                              driver.sentiment === 'bearish' ? 'bg-rose-500/20 text-rose-400' :
                                 'bg-slate-800 text-slate-400'
                              }`}>
                              {driver.impact_score}/100
                           </span>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{driver.description}</p>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-400" /> {t('analysis.bull_bear')}</h3>
               <div className="space-y-6">
                  <div>
                     <h4 className="text-sm font-bold text-rose-400 uppercase mb-3 flex items-center gap-2"><TrendingDown size={14} /> {t('analysis.bearish')}</h4>
                     <ul className="space-y-3">{data.factors_bearish.map((f, i) => <li key={i} className="text-sm text-slate-400 flex gap-2 leading-relaxed"><span className="text-rose-500">•</span> {renderWithCitations(f)}</li>)}</ul>
                  </div>
                  <div className="h-px bg-slate-800 my-4"></div>
                  <div>
                     <h4 className="text-sm font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2"><TrendingUp size={14} /> {t('analysis.bullish')}</h4>
                     <ul className="space-y-3">{data.factors_bullish.map((f, i) => <li key={i} className="text-sm text-slate-400 flex gap-2 leading-relaxed"><span className="text-emerald-500">•</span> {renderWithCitations(f)}</li>)}</ul>
                  </div>
               </div>
            </div>
         </div>

         {/* SOURCES - Categorized by Impact */}
         <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-400" />
                  {t('analysis.sources_title')} ({data.sources.length})
               </h3>
               <div className="flex gap-2">
                  <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded">High: {highImpactSources.length}</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Medium: {mediumImpactSources.length}</span>
                  <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded">Low: {lowImpactSources.length}</span>
               </div>
            </div>

            {/* High Impact Sources */}
            {highImpactSources.length > 0 && (
               <div className="mb-6">
                  <h4 className="text-sm font-bold text-rose-400 uppercase mb-3 flex items-center gap-2">
                     <Zap size={14} /> High Impact Sources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {highImpactSources.map((source, idx) => (
                        <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="bg-slate-900/30 border border-rose-500/30 rounded-xl p-4 hover:border-rose-500/60 transition-all block group">
                           <div className="flex justify-between items-start mb-2">
                              <h5 className="text-slate-200 font-bold text-sm line-clamp-1 group-hover:text-rose-400 transition-colors">{source.title}</h5>
                              <ExternalLink size={14} className="text-slate-600 group-hover:text-rose-400 flex-shrink-0 ml-2" />
                           </div>
                           <p className="text-xs text-rose-400 mb-2 font-medium">{source.source}</p>
                           {source.summary && <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{source.summary}</p>}
                        </a>
                     ))}
                  </div>
               </div>
            )}

            {/* Medium Impact Sources */}
            {mediumImpactSources.length > 0 && (
               <div className="mb-6">
                  <h4 className="text-sm font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                     <Activity size={14} /> Medium Impact Sources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {mediumImpactSources.map((source, idx) => (
                        <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="bg-slate-900/30 border border-amber-500/20 rounded-xl p-4 hover:border-amber-500/50 transition-all block group">
                           <div className="flex justify-between items-start mb-2">
                              <h5 className="text-slate-200 font-bold text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">{source.title}</h5>
                              <ExternalLink size={14} className="text-slate-600 group-hover:text-amber-400 flex-shrink-0 ml-2" />
                           </div>
                           <p className="text-xs text-amber-400 mb-2">{source.source}</p>
                           {source.summary && <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{source.summary}</p>}
                        </a>
                     ))}
                  </div>
               </div>
            )}

            {/* Low Impact Sources */}
            {lowImpactSources.length > 0 && (
               <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                     <Info size={14} /> Additional Sources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                     {lowImpactSources.map((source, idx) => (
                        <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="bg-slate-900/30 border border-amber-500/20 rounded-lg p-3 hover:border-slate-600 transition-all block group">
                           <div className="flex justify-between items-start">
                              <h5 className="text-slate-300 font-medium text-xs line-clamp-1 group-hover:text-white transition-colors">{source.title}</h5>
                              <ExternalLink size={12} className="text-slate-700 group-hover:text-slate-400 flex-shrink-0 ml-1" />
                           </div>
                           <p className="text-xs text-slate-500 mt-1">{source.source}</p>
                        </a>
                     ))}
                  </div>
               </div>
            )}
         </div>

         {/* TRUST FOOTER */}
         <div className="text-center py-6 border-t border-amber-500/20">
            <p className="text-slate-500 text-sm">
               Analysis generated on <span className="text-slate-400">{data.generated_at}</span> using{' '}
               <span className="text-amber-400 font-medium">{data.sources.length}+ verified sources</span> from Bloomberg, Reuters, Kitco, World Gold Council, and other authoritative financial sources.
            </p>
         </div>
      </div>
   );
};

export default DeepAnalysisView;

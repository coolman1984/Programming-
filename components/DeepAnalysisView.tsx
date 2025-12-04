
import React from 'react';
import { DeepAnalysisData } from '../types';
import { TrendingUp, TrendingDown, ExternalLink, Zap, ShieldCheck, Newspaper, BarChart3, Globe2, Activity, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

interface DeepAnalysisViewProps {
  data: DeepAnalysisData;
}

const DeepAnalysisView: React.FC<DeepAnalysisViewProps> = ({ data }) => {
  const isGood = data.overall_sentiment_score >= 60;
  const { t } = useLanguage();
  
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      
      {/* FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.metrics && data.metrics.map((metric, idx) => (
          <div key={idx} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:border-amber-500/30 transition-colors group relative">
             <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{metric.label}</span>
                <div className="text-slate-600 group-hover:text-amber-400 transition-colors cursor-help" title={metric.description}>
                   <Info size={14} />
                </div>
             </div>
             
             <span className={`text-4xl font-bold font-mono mb-3 ${
               metric.color === 'green' ? 'text-emerald-400' : 
               metric.color === 'red' ? 'text-rose-400' : 
               metric.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
             }`}>
               {metric.value}
             </span>
             
             <span className="text-slate-500 text-xs flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full">
               {metric.trend === 'up' && <TrendingUp size={12}/>}
               {metric.trend === 'down' && <TrendingDown size={12}/>}
               {metric.trend.toUpperCase()}
             </span>

             <div className="mt-5 pt-4 border-t border-slate-800 w-full">
                <p className="text-xs text-slate-400 italic leading-relaxed">
                   "{metric.description || "Key financial indicator."}"
                </p>
             </div>
          </div>
        ))}
      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-10 relative overflow-hidden shadow-2xl">
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-10 pointer-events-none ${isGood ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-amber-500/20 p-2.5 rounded-lg text-amber-500"><Newspaper size={28} /></div>
             <div className="flex flex-col">
                <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">{t('analysis.market_story')}</span>
                <span className="text-slate-500 text-xs">Strategic Analysis</span>
             </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-10 leading-tight font-serif">
            {data.headline || "Comprehensive Gold Market Analysis"}
          </h1>

          <div className="prose prose-invert prose-xl max-w-none text-slate-300 leading-loose font-serif prose-headings:font-sans">
             <ReactMarkdown>{data.executive_summary}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* DETAILED SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4 font-serif">
               <Activity size={24} className="text-blue-400"/> {t('analysis.global_macro')}
            </h3>
            <div className="prose prose-invert prose-base text-slate-400 leading-loose">
               <ReactMarkdown>{data.macro_analysis}</ReactMarkdown>
            </div>
         </div>

         <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4 font-serif">
               <Globe2 size={24} className="text-amber-400"/> {t('analysis.geopolitical')}
            </h3>
            <div className="prose prose-invert prose-base text-slate-400 leading-loose">
               <ReactMarkdown>{data.geopolitical_analysis}</ReactMarkdown>
            </div>
         </div>
         
         <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-4 font-serif">
               <BarChart3 size={24} className="text-purple-400"/> {t('analysis.technical')}
            </h3>
            <div className="flex flex-col md:flex-row gap-8">
               <div className="flex-1 prose prose-invert prose-base text-slate-400 leading-loose">
                  <ReactMarkdown>{data.technical_analysis}</ReactMarkdown>
               </div>
               <div className="w-full md:w-1/3 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center">
                  <div className="text-sm text-slate-500 uppercase tracking-widest mb-3">AI Confidence</div>
                  <div className="text-6xl font-bold text-white mb-2">{data.confidence_score}%</div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mt-4">
                     <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full" style={{width: `${data.confidence_score}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* DRIVERS & BALANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Zap size={20} className="text-amber-400" /> {t('analysis.drivers')}</h3>
            <div className="space-y-5">
              {data.drivers.map((driver, idx) => (
                 <div key={idx} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                       <span className="font-bold text-slate-200 text-base">{driver.name}</span>
                       <span className={`text-xs px-2.5 py-1 rounded font-bold bg-slate-800 text-slate-400`}>
                          {driver.impact_score}/100
                       </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{driver.description}</p>
                 </div>
              ))}
            </div>
         </div>

         <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-400" /> {t('analysis.bull_bear')}</h3>
            <div className="space-y-6">
               <div>
                  <h4 className="text-sm font-bold text-rose-400 uppercase mb-3 flex items-center gap-2"><TrendingDown size={14}/> {t('analysis.bearish')}</h4>
                  <ul className="space-y-3">{data.factors_bearish.map((f, i) => <li key={i} className="text-sm text-slate-400 flex gap-2 leading-relaxed"><span className="text-rose-500">•</span> {f}</li>)}</ul>
               </div>
               <div className="h-px bg-slate-800 my-4"></div>
               <div>
                  <h4 className="text-sm font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2"><TrendingUp size={14}/> {t('analysis.bullish')}</h4>
                  <ul className="space-y-3">{data.factors_bullish.map((f, i) => <li key={i} className="text-sm text-slate-400 flex gap-2 leading-relaxed"><span className="text-emerald-500">•</span> {f}</li>)}</ul>
               </div>
            </div>
         </div>
      </div>

      {/* SOURCES */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
         <h3 className="text-white font-bold text-lg mb-4">{t('analysis.sources_title')} ({data.sources.length})</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.sources.map((source, idx) => (
               <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 hover:border-amber-500/50 transition-all block group">
                  <div className="flex justify-between items-start mb-2">
                     <h5 className="text-slate-200 font-bold text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">{source.title}</h5>
                     <ExternalLink size={14} className="text-slate-600 group-hover:text-amber-400" />
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{source.source}</p>
                  {source.summary && <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">{source.summary}</p>}
               </a>
            ))}
         </div>
      </div>
    </div>
  );
};

export default DeepAnalysisView;

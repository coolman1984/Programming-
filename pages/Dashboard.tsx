import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsFeed from '../components/NewsFeed';
import PriceChart from '../components/PriceChart';
import TechnicalOutlook from '../components/TechnicalOutlook';
import { getAllMarketData, getNews } from '../services/marketDataService';
import { MarketData, NewsItem } from '../types';
import { RefreshCw, Sparkles, BrainCircuit, ScanSearch, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAnalysis } from '../context/AnalysisContext';
import { ASSETS } from '../constants';

const Dashboard: React.FC = () => {
   const navigate = useNavigate();
   const { t } = useLanguage();
   const [marketData, setMarketData] = useState<MarketData[]>([]);
   const [news, setNews] = useState<NewsItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [time, setTime] = useState(new Date());

   const { isAnalyzing, progress, triggerAnalysis, analysisResult, technicalOutlook, technicalOutlookLoading, generateTechnicalOutlook } = useAnalysis();

   useEffect(() => {
      if (analysisResult && !isAnalyzing) {
         navigate('/report');
      }
   }, [analysisResult, isAnalyzing, navigate]);

   useEffect(() => {
      if (isAnalyzing) return;
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
   }, [isAnalyzing]);

   const fetchData = async () => {
      try {
         setError(null);
         setLoading(true);
         const [data, newsData] = await Promise.all([getAllMarketData(), getNews(undefined, 'en')]);
         setMarketData(data);
         setNews(newsData);
      } catch (err) {
         console.error("Failed to fetch data:", err);
         setError("Failed to load market data. Please check your connection.");
      } finally { setLoading(false); }
   };

   useEffect(() => { fetchData(); }, []);

   const activeMarketData = marketData.find(d => d.assetId === 'gold-global') || marketData[0];
   const goldAsset = ASSETS['gold-global'];

   // Generate Technical Outlook on first load
   useEffect(() => {
      if (activeMarketData && !technicalOutlook && !technicalOutlookLoading) {
         generateTechnicalOutlook(activeMarketData.currentPrice);
      }
   }, [activeMarketData, technicalOutlook, technicalOutlookLoading, generateTechnicalOutlook]);

   useEffect(() => {
      const refreshInterval = setInterval(() => {
         fetchData();
      }, 3600000);
      return () => clearInterval(refreshInterval);
   }, []);

   const formattedDate = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
   const formattedTime = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

   const handleStartAnalysis = () => {
      if (activeMarketData && goldAsset) {
         triggerAnalysis(goldAsset, activeMarketData, 'en');
      }
   };

   return (
      <div className="space-y-10 animate-in fade-in duration-500 relative min-h-screen">

         {/* HEADER */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/30 pb-8">
            <div>
               <h1 className="text-4xl font-bold text-amber-500 font-serif mb-2">{t('dashboard.title')}</h1>
               <p className="text-slate-500 text-sm">{t('dashboard.subtitle')}</p>
               {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                     <span className="text-sm">{error}</span>
                     <button onClick={fetchData} className="text-xs underline hover:text-red-300">Retry</button>
                  </div>
               )}
            </div>
            <div className="text-right">
               <div className="text-4xl font-light text-white font-mono">{formattedTime}</div>
               <div className="text-sm text-amber-500 font-bold tracking-widest uppercase mt-1">{formattedDate}</div>
            </div>
         </div>

         {/* SECTION 1: LIVE SPOT PRICE (Full Width at Top) */}
         <div className="w-full">
            {loading && !activeMarketData ? (
               <div className="h-[400px] bg-[#111111] border border-slate-800/50 rounded-2xl animate-pulse"></div>
            ) : activeMarketData && (
               <PriceChart data={activeMarketData} />
            )}
         </div>

         {/* SECTION 2: DEEP ANALYSIS BUTTON */}
         <div className="w-full">
            {isAnalyzing ? (
               <div className="bg-[#111111] border border-slate-800/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[320px]">
                  <div className="absolute inset-0 bg-[#0a0a0a] opacity-90"></div>

                  {/* Multiple pulsing rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-96 h-96 border-2 border-amber-500/20 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-72 h-72 border border-amber-500/10 rounded-full animate-pulse opacity-40"></div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
                     {/* Large circular progress indicator */}
                     <div className="w-36 h-36 mb-8 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 border-4 border-amber-500/30 rounded-full"></div>
                        <div
                           className="absolute inset-0 border-4 border-transparent border-t-amber-500 border-r-amber-400 rounded-full animate-spin"
                           style={{ animationDuration: '1.5s' }}
                        ></div>
                        <div className="absolute inset-2 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                           <span className="text-4xl font-bold text-white font-mono">{Math.round(progress)}%</span>
                        </div>
                     </div>

                     <h2 className="text-2xl font-bold text-white mb-4 font-serif">{t('analysis.waiting.title')}</h2>

                     {/* Source names instead of (16+) */}
                     <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                        <ScanSearch size={18} className="text-amber-500 animate-pulse" />
                        <span className="animate-pulse">Scanning Global Sources...</span>
                     </div>

                     {/* Scrolling source names */}
                     <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
                        {['Bloomberg', 'Reuters', 'Kitco', 'World Gold Council', 'LBMA', 'Fed Reserve'].map((source, i) => (
                           <span
                              key={source}
                              className="text-xs px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-slate-400"
                              style={{ animationDelay: `${i * 0.1}s` }}
                           >
                              {source}
                           </span>
                        ))}
                     </div>

                     <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                           className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                           style={{ width: `${progress}%` }}
                        ></div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="bg-[#111111] border border-slate-800/50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="flex items-center gap-5">
                     <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                        <BrainCircuit size={40} className="text-amber-500" />
                     </div>
                     <div>
                        <h2 className="text-xl font-bold text-white font-serif mb-1">{t('dashboard.hero.title')}</h2>
                        <p className="text-slate-400 text-sm">16+ Real-Time Sources • Global Macro & Geopolitics</p>
                     </div>
                  </div>

                  <button
                     onClick={handleStartAnalysis}
                     className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 whitespace-nowrap"
                  >
                     <span>{t('dashboard.hero.cta')}</span>
                     <Sparkles size={24} className="text-black fill-black/20" />
                  </button>
               </div>
            )}
         </div>

         {/* SECTION 3: TECHNICAL OUTLOOK */}
         <TechnicalOutlook data={technicalOutlook} loading={technicalOutlookLoading} />

         {/* SECTION 4: MARKET DRIVERS / NEWS */}
         <div>
            {loading && news.length === 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-[#111111] rounded-2xl animate-pulse border border-slate-800/50" />)}
               </div>
            ) : (
               <NewsFeed news={news} />
            )}
         </div>
      </div>
   );
};

export default Dashboard;

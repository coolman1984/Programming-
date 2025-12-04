
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TickerCard from '../components/TickerCard';
import NewsFeed from '../components/NewsFeed';
import QuickConverter from '../components/QuickConverter';
import PriceChart from '../components/PriceChart';
import { getAllMarketData, getNews } from '../services/marketDataService';
import { MarketData, NewsItem } from '../types';
import { RefreshCw, Sparkles, Circle, BrainCircuit, ScanSearch, Loader2 } from 'lucide-react';
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

   const { isAnalyzing, progress, triggerAnalysis, analysisResult } = useAnalysis();

   useEffect(() => {
      if (analysisResult && !isAnalyzing) {
         navigate('/report');
      }
   }, [analysisResult, isAnalyzing, navigate]);

   useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
   }, []);

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

   useEffect(() => {
      const refreshInterval = setInterval(() => {
         fetchData();
      }, 3600000);
      return () => clearInterval(refreshInterval);
   }, []);

   const activeMarketData = marketData.find(d => d.assetId === 'gold-global') || marketData[0];
   const goldAsset = ASSETS['gold-global'];

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
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/50 pb-8">
            <div>
               <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-4xl font-bold text-gold font-serif">{t('dashboard.title')}</h1>
                  <button onClick={fetchData} disabled={loading} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-gold hover:text-white border border-slate-700 transition-colors">
                     <RefreshCw size={22} className={loading ? "animate-spin" : ""} />
                  </button>
               </div>
               <p className="text-slate-400 text-lg">{t('dashboard.subtitle')}</p>
               {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                     <span className="text-sm">{error}</span>
                     <button onClick={fetchData} className="text-xs underline hover:text-red-300">Retry</button>
                  </div>
               )}
            </div>
            <div className="text-right">
               <div className="text-4xl font-light text-slate-200 font-mono">{formattedTime}</div>
               <div className="text-sm text-gold font-bold tracking-widest uppercase mt-1">{formattedDate}</div>
            </div>
         </div>

         {/* SECTION 1: TICKER + ANALYSIS CTA SIDE-BY-SIDE */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="h-full min-h-[300px]">
               {loading && !activeMarketData ? (
                  <div className="h-full bg-[#0f172a] border border-slate-800 rounded-2xl animate-pulse"></div>
               ) : (
                  <div className="h-full">
                     <TickerCard data={activeMarketData} isActive={true} />
                  </div>
               )}
            </div>

            <div className="h-full min-h-[300px]">
               {isAnalyzing ? (
                  <div className="h-full bg-[#0f172a] border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-80 h-80 border border-amber-500/10 rounded-full animate-ping opacity-20"></div>
                        <div className="w-60 h-60 border border-amber-500/20 rounded-full animate-ping opacity-30 animation-delay-200"></div>
                     </div>

                     <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
                        <div className="w-20 h-20 mb-8 relative flex items-center justify-center">
                           <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
                           <Loader2 size={56} className="text-amber-500 animate-spin" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-white font-mono">{Math.round(progress)}%</span>
                           </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-3 font-serif">{t('analysis.waiting.title')}</h2>
                        <div className="flex items-center gap-2 text-slate-400 text-base mb-8 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
                           <ScanSearch size={16} className="text-amber-500 animate-pulse" />
                           <span className="animate-pulse">Scanning Global Sources (16+)...</span>
                        </div>

                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                           <div
                              className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                              style={{ width: `${progress}%` }}
                           ></div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="h-full bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-lg hover:border-amber-500/30 transition-all relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                     <div className="flex items-center gap-4 mb-8">
                        <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                           <BrainCircuit size={48} className="text-amber-500" />
                        </div>
                        <h2 className="text-4xl font-bold text-white font-serif relative z-10">{t('dashboard.hero.title')}</h2>
                     </div>

                     <p className="text-slate-400 text-xl mb-10 relative z-10 max-w-lg leading-relaxed font-medium">
                        {t('dashboard.hero.subtitle')}
                     </p>

                     <button
                        onClick={handleStartAnalysis}
                        className="relative z-10 w-full max-w-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-8 py-5 rounded-2xl font-bold text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                     >
                        <span>{t('dashboard.hero.cta')}</span>
                        <Sparkles size={28} className="text-black fill-black/20" />
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* SECTION 2: CALCULATOR + CHART SPLIT */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 h-full">
               <QuickConverter egpRate={activeMarketData?.currentPrice || 0} />
            </div>

            <div className="lg:col-span-2 h-full">
               {activeMarketData && (
                  <PriceChart
                     historyData={activeMarketData.history}
                     currentAssetId={activeMarketData.assetId}
                     onAssetChange={() => { }}
                  />
               )}
            </div>
         </div>

         {/* SECTION 3: INSIGHTS */}
         <div>
            <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-3">
               <Circle className="fill-amber-500 text-amber-500 animate-pulse" size={14} />
               <h2 className="text-3xl font-bold text-white font-serif">{t('dashboard.insights.title')}</h2>
            </div>
            {loading && news.length === 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-[#0f172a] rounded-2xl animate-pulse border border-slate-800" />)}
               </div>
            ) : (
               <NewsFeed news={news} />
            )}
         </div>
      </div>
   );
};

export default Dashboard;

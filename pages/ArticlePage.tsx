import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { updateMarketArticle, generateMarketArticle } from '../services/geminiService';
import { NewsItem, MarketArticle } from '../types';
import { useLanguage } from '../context/LanguageContext';

const ArticlePage: React.FC = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const seedNews = location.state?.seed as NewsItem;
   const { t, language } = useLanguage();

   const [article, setArticle] = useState<MarketArticle | null>(seedNews?.fullContent || null);
   const [isUpdating, setIsUpdating] = useState(false);
   const [showUpdateBanner, setShowUpdateBanner] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      if (!seedNews) {
         navigate('/');
         return;
      }

      if (!article && seedNews) {
         const loadArticle = async () => {
            setIsLoading(true);
            try {
               const generated = await generateMarketArticle(seedNews, language);
               setArticle(generated);
            } catch (e) {
               console.error(e);
            } finally {
               setIsLoading(false);
            }
         };
         loadArticle();
      }

      const timer = setTimeout(() => {
         if (article) setShowUpdateBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
   }, [seedNews, navigate, article, language]);

   const handleUpdate = async () => {
      if (!article) return;
      setIsUpdating(true);
      const updated = await updateMarketArticle(article, language);
      if (updated) {
         setArticle(updated);
         setShowUpdateBanner(false);
      }
      setIsUpdating(false);
   };

   if (!seedNews) return null;

   return (
      <div className="max-w-4xl mx-auto pb-20">
         {/* Back Button */}
         <div className="flex justify-between items-center mb-10">
            <button
               onClick={() => navigate('/')}
               className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors text-sm group"
            >
               <div className="p-2 rounded-lg bg-[#111111] border border-slate-800/50 group-hover:border-amber-500/30 transition-colors">
                  <ArrowLeft size={18} />
               </div>
               <span className="font-medium">{t('article.back')}</span>
            </button>
         </div>

         {/* Full Page Loading State */}
         {isLoading && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
               <div className="relative mb-8">
                  <div className="absolute inset-0 bg-amber-500/20 blur-[50px] rounded-full"></div>
                  <div className="relative z-10 w-20 h-20 border-4 border-slate-800/50 border-t-amber-500 rounded-full animate-spin"></div>
               </div>
               <h2 className="text-xl font-bold text-white mb-2 font-serif">{t('analysis.waiting.title')}</h2>
               <p className="text-slate-500 text-sm max-w-md">{t('analysis.waiting.desc')}</p>
            </div>
         )}

         {/* Updating Overlay */}
         {isUpdating && (
            <div className="fixed inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="bg-[#111111] border border-slate-800/50 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center">
                  <div className="relative mb-6">
                     <div className="absolute inset-0 bg-amber-500/30 blur-[20px] rounded-full"></div>
                     <div className="relative z-10 w-16 h-16 border-4 border-slate-800/50 border-t-amber-500 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-white font-bold text-lg font-serif">{t('article.updating')}</h3>
               </div>
            </div>
         )}

         {article && !isLoading ? (
            <article className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Header */}
               <header className="mb-12">
                  {/* Premium Badge */}
                  <div className="flex justify-center mb-6">
                     <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 uppercase tracking-[0.2em]">
                        {t('article.premium')}
                     </div>
                  </div>

                  {/* Headline */}
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight font-serif text-center">
                     {article.headline}
                  </h1>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                     <div className="flex items-center gap-2">
                        <User size={16} className="text-amber-500" />
                        <span>{article.author}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-500" />
                        <span>{article.readTime}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#111111] border border-slate-800/50 text-slate-400">
                           {isUpdating ? '...' : article.generatedAt}
                        </span>
                     </div>
                  </div>
               </header>

               {/* Strategic Takeaways Box */}
               {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                  <div className="bg-[#111111] border border-slate-800/50 rounded-xl p-6 mb-12 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-amber-600"></div>
                     <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3 font-serif">
                        <Bookmark size={20} className="text-amber-500" />
                        {t('article.takeaways')}
                     </h3>
                     <ul className="space-y-4">
                        {article.keyTakeaways.map((point, i) => (
                           <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span>{point}</span>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {/* Article Content */}
               <div className="article-content">
                  <ReactMarkdown>{article.content}</ReactMarkdown>
               </div>

               {/* Footer */}
               <div className="mt-16 pt-8 border-t border-slate-800/50 flex justify-between items-center">
                  <p className="text-slate-500 text-xs">
                     {t('article.generated')}
                  </p>
                  <div className="flex gap-2">
                     <button className="p-2.5 rounded-lg bg-[#111111] border border-slate-800/50 text-slate-400 hover:text-amber-500 hover:border-amber-500/30 transition-colors">
                        <Share2 size={18} />
                     </button>
                  </div>
               </div>

               {/* Back to Dashboard */}
               <div className="mt-12 mb-8">
                  <button
                     onClick={() => navigate('/')}
                     className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                  >
                     <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                     <span className="text-sm">Back to Dashboard</span>
                  </button>
               </div>
            </article>
         ) : null}
      </div>
   );
};

export default ArticlePage;

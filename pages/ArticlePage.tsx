import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateMarketArticle } from '../services/geminiService';
import { getNews } from '../services/marketDataService';
import { NewsItem, MarketArticle } from '../types';
import { useLanguage } from '../context/LanguageContext';

const buildFallbackArticle = (seed: NewsItem, languageLabel: string): MarketArticle => {
   const generatedAt = new Date().toLocaleString();
   const content = [
      `${seed.summary}`,
      '',
      '## Context & Background',
      '',
      `This is a fallback summary view because the AI article generator is currently unavailable.`,
      '',
      '## Key Points',
      '',
      `- **Source:** ${seed.source}`,
      `- **Language:** ${languageLabel}`,
      `- **Topic:** ${seed.title}`,
      '',
      '## Next Steps',
      '',
      'Try again later to generate the full analysis article.',
   ].join('\n');

   return {
      headline: seed.title,
      author: seed.source,
      readTime: '2 min read',
      keyTakeaways: [seed.summary].slice(0, 3),
      content,
      generatedAt,
   };
};

const ArticlePage: React.FC = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { id } = useParams();
   const { t, language } = useLanguage();

   const seedFromNavigation = useMemo<NewsItem | null>(() => {
      return (location.state?.seed as NewsItem | undefined) ?? null;
   }, [location.state]);

   // NOTE: Bookmarkable routes must load from URL alone.
   // We accept navigation state as an optimization, but we never REQUIRE it.
   const [seedNews, setSeedNews] = useState<NewsItem | null>(seedFromNavigation);

   const [seedLoading, setSeedLoading] = useState(false);
   const [articleLoading, setArticleLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [usingFallback, setUsingFallback] = useState(false);

   const [article, setArticle] = useState<MarketArticle | null>(seedFromNavigation?.fullContent || null);

   // Phase 1: Ensure we have a seed news item.
   // - Prefer navigation state.
   // - Fallback to fetching the news list and selecting by URL param.
   useEffect(() => {
      let cancelled = false;

      // If navigation provided a seed, always trust it.
      if (seedFromNavigation) {
         setSeedNews(seedFromNavigation);
         return;
      }

      if (seedNews || seedLoading) return;

      const loadSeed = async () => {
         if (!id) {
            setError('Missing article id.');
            return;
         }

         setSeedLoading(true);
         setError(null);

         try {
            const items = await getNews(undefined, language);
            const found = items.find(n => String(n.id) === String(id)) ?? null;
            if (cancelled) return;

            if (!found) {
               setError('Article not found.');
               setSeedNews(null);
               return;
            }

            setSeedNews(found);
         } catch (e) {
            console.error(e);
            if (!cancelled) setError('Failed to load article seed.');
         } finally {
            if (!cancelled) setSeedLoading(false);
         }
      };

      loadSeed();
      return () => {
         cancelled = true;
      };
   }, [id, language, seedFromNavigation, seedLoading, seedNews]);

   // Phase 2: Generate the article from the seed (if needed).
   useEffect(() => {
      let cancelled = false;
      if (!seedNews) return;
      if (article || articleLoading) return;

      const loadArticle = async () => {
         setArticleLoading(true);
         setError(null);
         setUsingFallback(false);
         try {
            const generated = await generateMarketArticle(seedNews, language);
            if (cancelled) return;

            // If AI generation returns null (no API key, timeout, network issues),
            // show a safe fallback instead of leaving the page blank or "loading".
            if (!generated) {
               setUsingFallback(true);
               setArticle(buildFallbackArticle(seedNews, language));
               return;
            }

            setArticle(generated);
         } catch (e) {
            console.error(e);
            if (cancelled) return;
            setUsingFallback(true);
            setArticle(buildFallbackArticle(seedNews, language));
         } finally {
            if (!cancelled) setArticleLoading(false);
         }
      };

      loadArticle();
      return () => {
         cancelled = true;
      };
   }, [article, articleLoading, language, seedNews]);

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

         {usingFallback && !(seedLoading || articleLoading) && (
            <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 text-amber-200">
               <div className="text-sm font-semibold">Showing fallback summary</div>
               <div className="text-xs text-amber-200/70 mt-1">
                  The full AI-generated article couldnt be produced (timeout/network/API key). The page will no longer stay stuck loading.
               </div>
            </div>
         )}

         {/* Full Page Loading State */}
         {(seedLoading || articleLoading) && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
               <div className="relative mb-8">
                  <div className="absolute inset-0 bg-amber-500/20 blur-[50px] rounded-full"></div>
                  <div className="relative z-10 w-20 h-20 border-4 border-slate-800/50 border-t-amber-500 rounded-full animate-spin"></div>
               </div>
               <h2 className="text-xl font-bold text-white mb-2 font-serif">{t('analysis.waiting.title')}</h2>
               <p className="text-slate-500 text-sm max-w-md">{t('analysis.waiting.desc')}</p>
            </div>
         )}

         {/* Error State */}
         {error && !(seedLoading || articleLoading) && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center bg-[#111111] border border-slate-800/50 rounded-2xl p-10">
               <h2 className="text-white font-bold text-xl font-serif mb-3">{error}</h2>
               <p className="text-slate-500 text-sm max-w-md mb-6">
                  This page must be loadable from the URL. If you opened a stale link, the seed item may no longer exist.
               </p>
               <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-6 py-3 rounded-xl font-bold transition-all"
               >
                  Back to Dashboard
               </button>
            </div>
         )}

         {article && !(seedLoading || articleLoading) ? (
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
                           {article.generatedAt}
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

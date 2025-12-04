
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Share2, Bookmark, Zap } from 'lucide-react';
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

    // Auto-generate if content is missing (for Live headlines)
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
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm group"
        >
            <div className="p-1.5 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                {language === 'ar' ? <ArrowLeft size={16} className="rotate-180"/> : <ArrowLeft size={16} />}
            </div>
            {t('article.back')}
        </button>

        {showUpdateBanner && !isUpdating && !isLoading && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <button 
                    onClick={handleUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/10"
                >
                    <Zap size={14} className="animate-pulse" />
                    {t('article.update')}
                </button>
            </div>
        )}
      </div>

      {/* Full Page Loading State for Initial Generation */}
      {isLoading && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
          <div className="relative mb-8">
             <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full"></div>
             <div className="relative z-10 w-20 h-20 border-4 border-slate-800 border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(212,175,55,0.3)]"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('analysis.waiting.title')}</h2>
          <p className="text-slate-400 text-sm max-w-md">{t('analysis.waiting.desc')}</p>
        </div>
      )}

      {/* Updating Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#0f172a] border border-slate-700 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center shadow-2xl">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-indigo-500/30 blur-[20px] rounded-full"></div>
                    <div className="relative z-10 w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{t('article.updating')}</h3>
            </div>
        </div>
      )}

      {article && !isLoading ? (
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <header className="mb-10 text-center">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-widest">
                 {t('article.premium')}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight font-serif">
                 {article.headline}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 border-y border-slate-800 py-4">
                 <div className="flex items-center gap-2">
                    <User size={16} className="text-primary"/>
                    <span>{article.author}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500"/>
                    <span>{article.readTime}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isUpdating ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>
                        {isUpdating ? '...' : article.generatedAt}
                    </span>
                 </div>
              </div>
           </header>

           {article.keyTakeaways && article.keyTakeaways.length > 0 && (
             <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 mb-10 shadow-lg relative overflow-hidden">
                <div className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-1 h-full bg-gradient-to-b from-primary to-purple-500`}></div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                   <Bookmark size={20} className="text-primary"/> {t('article.takeaways')}
                </h3>
                <ul className="space-y-3">
                   {article.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed">
                         <span className="text-primary font-bold">•</span>
                         {point}
                      </li>
                   ))}
                </ul>
             </div>
           )}

           <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-serif tracking-wide prose-headings:font-sans prose-headings:font-bold prose-headings:text-white prose-a:text-blue-400 prose-blockquote:border-l-primary prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
              <ReactMarkdown>{article.content}</ReactMarkdown>
           </div>

           <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
              <p className="text-slate-500 text-xs italic">
                 {t('article.generated')}
              </p>
              <div className="flex gap-2">
                 <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <Share2 size={18} />
                 </button>
              </div>
           </div>
        </article>
      ) : null}
    </div>
  );
};

export default ArticlePage;


import React, { useState } from 'react';
import { Search, Globe, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { searchMarketQuery } from '../services/geminiService';
import { SearchResult } from '../types';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

const Analysis: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await searchMarketQuery(query, language);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = language === 'ar' ? [
      "هل سيصل الذهب لـ 7000 جنيه في 2025؟",
      "هل الوقت مناسب لشراء السبائك الآن؟",
      "تأثير قرارات الجمارك على سعر الذهب",
      "توقعات السعر العالمي الشهر القادم"
  ] : [
    "Will Gold prices hit 7000 EGP in 2025?",
    "Is now a good time to buy Gold bars in Egypt?",
    "Forecast for Global Gold Spot Price next month",
    "Effect of new import customs on Gold prices"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight font-serif">
          {t('analysis.title')}
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          {t('analysis.subtitle')}
        </p>
      </div>

      {/* Search Box */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('analysis.search.placeholder')}
            className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-2xl py-6 pl-14 pr-32 text-lg shadow-xl focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-600"
          />
          <Search className={`absolute ${language === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-500`} size={24} />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? '...' : t('analysis.search.button')}
          </button>
        </form>
      </div>

      {/* Suggestions */}
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setQuery(s)}
              className="text-left p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm font-medium">{s}</span>
                <ArrowRight size={16} className={`text-slate-600 group-hover:text-amber-500 transition-colors ${language === 'ar' ? 'rotate-180' : ''}`} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center space-y-4">
          <div className="inline-block relative">
             <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles size={120} />
             </div>
             
             <div className="relative z-10">
                <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                   <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>
             </div>
          </div>

          {result.sources.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('analysis.sources')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.sources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#0f172a] border border-slate-800 rounded-lg hover:border-slate-600 transition-all group"
                  >
                    <div className="bg-slate-800 p-2 rounded text-slate-400 group-hover:text-white transition-colors">
                      <Globe size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-slate-200 truncate group-hover:text-amber-400 transition-colors">{source.title}</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;

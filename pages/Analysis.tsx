
import React, { useState } from 'react';
import { Search, Globe, ArrowRight, ExternalLink, Sparkles, TrendingUp, AlertTriangle, DollarSign, BarChart2, Briefcase, Zap, TrendingDown, Cpu, Anchor, Layers, Activity, PieChart, Scale, Target, ShieldAlert } from 'lucide-react';
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

  const suggestions = [
    { icon: <TrendingUp size={20} className="text-emerald-500" />, text: "Price Prediction: Gold Forecast for Year-End 2025" },
    { icon: <Globe size={20} className="text-blue-500" />, text: "Global Central Bank Gold Buying Trends in Q4" },
    { icon: <AlertTriangle size={20} className="text-amber-500" />, text: "Impact of Geopolitical Tension on Safe-Haven Assets" },
    { icon: <DollarSign size={20} className="text-green-500" />, text: "Correlation Analysis: Gold Prices vs US Dollar Index (DXY)" },
    { icon: <BarChart2 size={20} className="text-purple-500" />, text: "Technical Analysis: Key Support & Resistance Levels for XAU/USD" },
    { icon: <Briefcase size={20} className="text-orange-500" />, text: "Best Gold ETFs vs Physical Gold for Portfolio Diversification" },
    { icon: <Zap size={20} className="text-yellow-500" />, text: "Weekly Recap: What Drove Gold Markets This Week?" },
    { icon: <TrendingDown size={20} className="text-red-500" />, text: "Bearish Scenario: What Could Trigger a Gold Sell-Off?" },
    { icon: <Cpu size={20} className="text-cyan-500" />, text: "AI Prediction: Machine Learning Model Forecast for Next Month" },
    { icon: <Anchor size={20} className="text-indigo-500" />, text: "Influence of Fed Rate Decisions on Non-Yielding Bullion" },
    { icon: <Layers size={20} className="text-rose-500" />, text: "Supply & Demand: Mining Production vs Consumer Jewelry Demand" },
    { icon: <Activity size={20} className="text-teal-500" />, text: "Silver vs Gold: Which Precious Metal Has More Upside?" },
    { icon: <PieChart size={20} className="text-pink-500" />, text: "Portfolio Allocations: Ideal Gold Percentage for Risk Parity?" },
    { icon: <Scale size={20} className="text-lime-500" />, text: "Regulatory Watch: New Import Tax Impact on Local Prices" },
    { icon: <Target size={20} className="text-red-400" />, text: "Analyst Consensus: Wall Street Targets for Q1 2026" },
    { icon: <ShieldAlert size={20} className="text-orange-400" />, text: "Risk Management: Hedging Inflation Surges with XAU Strategy" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl font-bold text-white tracking-tight font-serif bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
          {t('analysis.title')}
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          {t('analysis.subtitle')}
        </p>
      </div>

      {/* Search Box */}
      <div className="relative group max-w-4xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            readOnly
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('analysis.search.placeholder')}
            className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-3xl py-6 pl-16 pr-40 text-lg shadow-2xl focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-600 cursor-default"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={28} />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/20"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>{t('analysis.search.button')}</span>}
          </button>
        </form>
      </div>

      {/* Suggestions */}
      {!result && !loading && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Sparkles size={20} className="text-amber-500" />
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Most Asked Insights</h3>
            <Sparkles size={20} className="text-amber-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setQuery(s.text)}
                className="text-left p-6 bg-[#0f172a] border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-amber-500/30 transition-all group flex items-start gap-4 shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 duration-300"
              >
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-slate-700 transition-colors">
                  {s.icon}
                </div>
                <div className="flex-1">
                  <span className="text-slate-300 text-sm font-semibold group-hover:text-white transition-colors leading-relaxed block">
                    {s.text}
                  </span>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-amber-500 transition-colors transform group-hover:translate-x-1 mt-1" />
              </button>
            ))}
          </div>
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

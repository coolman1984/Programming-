
import React from 'react';
import { MarketData, Asset } from '../types';
import { ASSETS } from '../constants';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TickerCardProps {
  data: MarketData;
  isActive?: boolean;
  onClick?: () => void;
}

const TickerCard: React.FC<TickerCardProps> = ({ data, isActive, onClick }) => {
  const asset = ASSETS[data.assetId];
  const { t } = useLanguage();
  const isPositive = data.change24h > 0;
  const isNegative = data.change24h < 0;

  const fractionDigits = 2;

  return (
    <div
      onClick={onClick}
      className={`
        relative p-8 rounded-2xl cursor-pointer transition-all duration-300 border h-full flex flex-col justify-between
        ${isActive
          ? 'bg-[#111111] border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
          : 'bg-[#111111] border-slate-800/50 hover:border-amber-500/30'
        }
      `}
    >
      {/* Decorative top gradient line - GOLD */}
      <div className={`absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent ${isActive ? 'via-amber-500' : 'via-slate-700'} to-transparent opacity-70`} />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-amber-500/90 text-sm font-bold uppercase tracking-widest mb-2">{asset.name}</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight font-serif">
              ${data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}
            </span>
            <span className="text-base text-slate-500 font-medium mb-2">{asset.unit}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm
            ${isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isNegative
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }
          `}>
            {isPositive ? <ArrowUpRight size={18} /> : isNegative ? <ArrowDownRight size={18} /> : <Minus size={18} />}
            {Math.abs(data.change24hPercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div>
        {/* Perspective Label */}
        <div className="mb-5">
          {isPositive && (
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20">
              <TrendingUp size={14} /> {t('ticker.rallying')}
            </div>
          )}
          {isNegative && (
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded border border-rose-500/20">
              <TrendingDown size={14} /> {t('ticker.correcting')}
            </div>
          )}
          {!isPositive && !isNegative && (
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-500/10 px-3 py-1.5 rounded border border-slate-500/20">
              <Minus size={14} /> {t('ticker.stable')}
            </div>
          )}
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-slate-500'}`}
            style={{ width: `${Math.max(Math.min(Math.abs(data.change24hPercent) * 20, 100), 5)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 font-medium uppercase tracking-wide">
          <span>{t('ticker.source')}</span>
          <span className="flex items-center gap-1 text-slate-400">
            {t('ticker.updated')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TickerCard;

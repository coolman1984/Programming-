import React from 'react';
import { Zap, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { MarketData } from '../types';
import { ASSETS } from '../constants';

interface MarketPulseProps {
  text: string;
  loading: boolean;
  data: MarketData[];
}

const MarketPulse: React.FC<MarketPulseProps> = ({ text, loading, data }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border-y border-slate-800 py-3 px-4 flex flex-col md:flex-row items-center gap-4 overflow-hidden">
      
      {/* Label and AI Text Section */}
      <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden">
        <div className="flex items-center gap-1.5 text-amber-400 whitespace-nowrap bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
          <Zap size={14} className={loading ? "animate-pulse" : ""} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Flash Pulse</span>
        </div>
        
        <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block"></div>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-4 w-48 bg-slate-800 rounded animate-pulse"></div>
          ) : (
            <p className="text-xs text-slate-300 font-medium truncate animate-in fade-in slide-in-from-left-4 duration-500 max-w-[400px]">
              {text}
            </p>
          )}
        </div>
      </div>

      {/* Spacer on Desktop */}
      <div className="hidden md:block flex-1"></div>

      {/* Live Data Ticker */}
      <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar mask-gradient-sides">
        {data.map((item) => {
          const asset = ASSETS[item.assetId];
          const isUp = item.change24h >= 0;
          return (
            <div key={item.assetId} className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 whitespace-nowrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{asset.symbol}</span>
              <span className="text-xs font-mono font-bold text-white">
                {item.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{Math.abs(item.change24hPercent).toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
        <div className="md:hidden text-[10px] text-slate-600 font-mono whitespace-nowrap ml-auto">
           • Live
        </div>
      </div>

    </div>
  );
};

export default MarketPulse;
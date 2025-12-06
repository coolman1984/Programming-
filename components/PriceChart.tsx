import React from 'react';
import { MarketData } from '../types';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Trophy, Coins } from 'lucide-react';

interface PriceChartProps {
  data: MarketData;
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const isPositive = data.change24h >= 0;
  const lastUpdated = new Date(data.lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Calculate bid/ask from price
  const spread = 1.00;
  const bid = data.currentPrice - (spread / 2);
  const ask = data.currentPrice + (spread / 2);

  // Estimate 52W high (for demo, use price + 4%)
  const yearlyHigh = data.currentPrice * 1.04;

  return (
    <div className="w-full bg-[#0a0a0a] border border-slate-800/50 rounded-2xl p-8 relative overflow-hidden">
      {/* Gold particle background effect */}
      {/* Premium Gold Particle + Cloud Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Stars/Dust */}
        <div className="absolute inset-0 bg-gold-dust opacity-50 z-0"></div>

        {/* Nebulous Clouds - positioned to match reference */}
        <div className="absolute top-[-30%] left-[20%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <p className="text-amber-500 text-sm font-bold tracking-[0.3em] uppercase mb-6">
          LIVE SPOT PRICE (XAU/USD)
        </p>

        {/* Big Price Display */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-6xl md:text-7xl font-bold text-white font-mono tracking-tight">
            ${data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Change Badge */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${isPositive
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-bold font-mono">
              {isPositive ? '+' : ''}{data.change24h.toFixed(2)} ({isPositive ? '+' : ''}{data.change24hPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-slate-500 text-sm">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 mt-8">
        {/* Day High */}
        <div className="bg-[#111111] border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <ArrowUp size={18} className="text-amber-500" />
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={10} /> High
            </span>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">DAY HIGH</p>
          <p className="text-white text-2xl font-bold font-mono">${data.high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-slate-500 text-xs mt-1">Today's Peak</p>
        </div>

        {/* Day Low */}
        <div className="bg-[#111111] border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <ArrowDown size={18} className="text-amber-500" />
            </div>
            <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingDown size={10} /> Low
            </span>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">DAY LOW</p>
          <p className="text-white text-2xl font-bold font-mono">${data.low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-slate-500 text-xs mt-1">Today's Floor</p>
        </div>

        {/* 52W High */}
        <div className="bg-[#111111] border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <Trophy size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">52W HIGH</p>
          <p className="text-white text-2xl font-bold font-mono">${yearlyHigh.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-slate-500 text-xs mt-1">Yearly Record</p>
        </div>

        {/* Bid/Ask */}
        <div className="bg-[#111111] border border-slate-800 rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <Coins size={18} className="text-amber-500" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">BID / ASK</p>
          <p className="text-white text-xl font-bold font-mono">${bid.toFixed(1)} / ${ask.toFixed(1)}</p>
          <p className="text-slate-500 text-xs mt-1">Spread: ${spread.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;

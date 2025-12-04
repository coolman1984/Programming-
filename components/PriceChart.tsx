
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PricePoint, AssetId } from '../types';
import { ASSETS } from '../constants';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface PriceChartProps {
  historyData: PricePoint[];
  currentAssetId: AssetId;
  onAssetChange: (id: AssetId) => void;
}

type TimeRange = '1W' | '1M';

const PriceChart: React.FC<PriceChartProps> = ({ historyData, currentAssetId }) => {
  const asset = ASSETS[currentAssetId];
  const [range, setRange] = useState<TimeRange>('1W');

  const filteredData = useMemo(() => {
     if (!historyData || historyData.length === 0) return [];
     const count = range === '1W' ? 7 : 30;
     return historyData.slice(-count); 
  }, [historyData, range]);

  const prices = filteredData.map(d => d.price);
  const highPrice = prices.length ? Math.max(...prices) : 0;
  const lowPrice = prices.length ? Math.min(...prices) : 0;
  
  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a]/95 border border-amber-500/30 p-4 rounded-xl shadow-2xl backdrop-blur-md text-left min-w-[160px]">
          <p className="text-slate-400 text-sm mb-2 font-medium">{new Date(label).toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'short'})}</p>
          <div className="flex items-center gap-2 justify-start">
            <span className="text-sm text-amber-500 font-bold">{asset.unit}</span>
            <p className="text-white font-bold text-3xl font-serif">
              ${payload[0].value.toLocaleString()} 
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[480px] bg-[#0f172a] border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50"></div>
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-700"></div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 z-10">
        <div>
           <h3 className="text-white font-bold text-3xl font-serif mb-3 flex items-center gap-3">
             <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-500">
                <Calendar size={24} />
             </div>
             Price History
           </h3>
           <div className="flex items-center gap-4 text-sm font-mono bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800/50">
              <span className="text-slate-400 flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-400" /> 
                 High: <span className="text-white font-bold text-lg">${highPrice.toLocaleString()}</span>
              </span>
              <span className="text-slate-700 mx-2">|</span>
              <span className="text-slate-400 flex items-center gap-2">
                 <TrendingDown size={16} className="text-rose-400" /> 
                 Low: <span className="text-white font-bold text-lg">${lowPrice.toLocaleString()}</span>
              </span>
           </div>
        </div>
        
        {/* Toggle */}
        <div className="flex bg-slate-900 p-2 rounded-2xl border border-slate-800 self-end sm:self-auto backdrop-blur-sm shadow-inner">
           <button
             onClick={() => setRange('1W')}
             className={`px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 ${range === '1W' ? 'bg-amber-500 text-slate-900 shadow-lg transform scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             1W
           </button>
           <button
             onClick={() => setRange('1M')}
             className={`px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 ${range === '1M' ? 'bg-amber-500 text-slate-900 shadow-lg transform scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
           >
             1M
           </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow w-full relative z-10 -ml-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={asset.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={asset.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis} 
              stroke="#334155" 
              tick={{fontSize: 14, fill: '#64748b', fontWeight: 500}}
              tickMargin={15}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#334155" 
              tick={{fontSize: 14, fill: '#64748b', fontFamily: 'monospace'}}
              axisLine={false}
              tickLine={false}
              orientation="right" 
              tickFormatter={(val) => `$${val.toLocaleString()}`}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={asset.color} 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#chartGradient)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;

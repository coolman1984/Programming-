
import React, { useState } from 'react';
import { ArrowDown, Calculator, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface QuickConverterProps {
  egpRate: number; // This is actually USD rate now
}

const QuickConverter: React.FC<QuickConverterProps> = ({ egpRate }) => {
  const [amount, setAmount] = useState<string>('1');
  const [isReverse, setIsReverse] = useState(false); // false: Oz -> USD, true: USD -> Oz
  const { t } = useLanguage();

  const calculatedValue = isReverse
    ? (parseFloat(amount || '0') / egpRate)
    : (parseFloat(amount || '0') * egpRate);

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 h-full min-h-[480px] flex flex-col relative shadow-lg">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-white font-bold text-lg flex items-center gap-3 font-serif">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <Calculator className="w-6 h-6 text-amber-500" />
          </div>
          {t('converter.title')}
        </h3>
        <button
          onClick={() => setIsReverse(!isReverse)}
          className="text-slate-500 hover:text-amber-500 transition-colors p-3 hover:bg-slate-800 rounded-full"
          title="Switch Direction"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      <div className="space-y-8 flex-grow flex flex-col justify-center">

        {/* FROM */}
        <div className="space-y-4">
          <label className="text-base text-slate-400 font-semibold uppercase flex justify-between">
            <span>{isReverse ? t('converter.usd') : t('converter.label')}</span>
            <span className="text-slate-600">{isReverse ? "USD" : "XAU"}</span>
          </label>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl flex items-center px-6 py-6 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-inner">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-mono text-5xl w-full placeholder:text-slate-700 font-bold"
              placeholder="0"
            />
            <span className="text-slate-500 text-lg font-bold ml-3 bg-slate-800 px-4 py-2 rounded-lg">
              {isReverse ? "$" : "oz"}
            </span>
          </div>
        </div>

        {/* DIVIDER ICON */}
        <div className="flex justify-center -my-6 relative z-10">
          <div className="bg-slate-800 rounded-full p-3 border-4 border-[#0f172a] text-amber-500 shadow-xl">
            <ArrowDown size={24} />
          </div>
        </div>

        {/* TO */}
        <div className="space-y-4">
          <label className="text-base text-slate-400 font-semibold uppercase flex justify-between">
            <span>{isReverse ? t('converter.weight') : t('converter.usd')}</span>
            <span className="text-slate-600">{isReverse ? "XAU" : "USD"}</span>
          </label>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center px-6 py-6">
            <span className="text-amber-400 font-bold font-mono text-5xl flex-grow">
              {calculatedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-slate-600 text-lg font-bold ml-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
              {isReverse ? "oz" : "$"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuickConverter;

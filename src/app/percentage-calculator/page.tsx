'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchButton } from '@/components/StitchComponents';

export default function PercentageCalculatorPage() {
  const [val1A, setVal1A] = useState('');
  const [val1B, setVal1B] = useState('');
  const [res1, setRes1] = useState<number | null>(null);

  const [val2A, setVal2A] = useState('');
  const [val2B, setVal2B] = useState('');
  const [res2, setRes2] = useState<number | null>(null);

  const [val3A, setVal3A] = useState('');
  const [val3B, setVal3B] = useState('');
  const [res3, setRes3] = useState<number | null>(null);

  return (
    <ToolLayout 
      title="Percentage Calculator" 
      description="Quickly calculate percentages, discounts, and percentage changes"
      icon={Icons.percent}
      gradient="from-rose-500 to-pink-500"
    >
      <div className="space-y-6">
        {/* Calc 1 */}
        <StitchContainer>
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> What is X % of Y?
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-gray-400">What is</span>
            <input 
              type="number" value={val1A} onChange={e => setVal1A(e.target.value)} 
              className="w-full sm:w-24 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 text-center" 
            />
            <span className="text-gray-400">% of</span>
            <input 
              type="number" value={val1B} onChange={e => setVal1B(e.target.value)} 
              className="w-full sm:w-32 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 text-center" 
            />
            <button 
              onClick={() => setRes1((Number(val1A) / 100) * Number(val1B))}
              className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Calculate
            </button>
          </div>
          {res1 !== null && !isNaN(res1) && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
               <span className="text-gray-400">Result: </span>
               <span className="text-2xl font-bold text-white">{res1}</span>
            </div>
          )}
        </StitchContainer>

        {/* Calc 2 */}
        <StitchContainer>
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> X is what % of Y?
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="number" value={val2A} onChange={e => setVal2A(e.target.value)} 
              className="w-full sm:w-32 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 text-center" 
            />
            <span className="text-gray-400">is what % of</span>
            <input 
              type="number" value={val2B} onChange={e => setVal2B(e.target.value)} 
              className="w-full sm:w-32 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 text-center" 
            />
            <button 
              onClick={() => setRes2((Number(val2A) / Number(val2B)) * 100)}
              className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Calculate
            </button>
          </div>
          {res2 !== null && !isNaN(res2) && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
               <span className="text-gray-400">Result: </span>
               <span className="text-2xl font-bold text-white">{parseFloat(res2.toFixed(4))}%</span>
            </div>
          )}
        </StitchContainer>

        {/* Calc 3 */}
        <StitchContainer>
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Percentage Change (from X to Y)
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-gray-400">From</span>
            <input 
              type="number" value={val3A} onChange={e => setVal3A(e.target.value)} 
              className="w-full sm:w-32 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 text-center" 
            />
            <span className="text-gray-400">to</span>
            <input 
              type="number" value={val3B} onChange={e => setVal3B(e.target.value)} 
              className="w-full sm:w-32 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-rose-500/50 text-center" 
            />
             <button 
              onClick={() => setRes3(((Number(val3B) - Number(val3A)) / Math.abs(Number(val3A))) * 100)}
              className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Calculate
            </button>
          </div>
          {res3 !== null && !isNaN(res3) && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
               <span className="text-gray-400">Result: </span>
               <span className={`text-2xl font-bold ${res3 > 0 ? 'text-emerald-400' : res3 < 0 ? 'text-rose-400' : 'text-white'}`}>
                 {res3 > 0 ? '+' : ''}{parseFloat(res3.toFixed(4))}% {res3 > 0 ? '(Increase)' : res3 < 0 ? '(Decrease)' : ''}
               </span>
            </div>
          )}
        </StitchContainer>
      </div>
    </ToolLayout>
  );
}

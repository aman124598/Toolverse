'use client';

import { useState } from 'react';

export default function PercentageCalculatorPage() {
  const [mode, setMode] = useState<'basic' | 'increase' | 'difference'>('basic');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    
    if (isNaN(v1) || isNaN(v2)) {
      setResult('Please enter valid numbers');
      return;
    }

    let res: number;
    switch (mode) {
      case 'basic':
        // What is X% of Y?
        res = (v1 / 100) * v2;
        setResult(`${v1}% of ${v2} = ${res.toFixed(2)}`);
        break;
      case 'increase':
        // X is what % of Y?
        res = (v1 / v2) * 100;
        setResult(`${v1} is ${res.toFixed(2)}% of ${v2}`);
        break;
      case 'difference':
        // % change from X to Y
        res = ((v2 - v1) / v1) * 100;
        const direction = res >= 0 ? 'increase' : 'decrease';
        setResult(`${Math.abs(res).toFixed(2)}% ${direction} from ${v1} to ${v2}`);
        break;
    }
  };

  const quickCalculations = [
    { label: 'Tip 15%', calc: () => { setValue1('15'); setMode('basic'); } },
    { label: 'Tip 20%', calc: () => { setValue1('20'); setMode('basic'); } },
    { label: 'Tax 18%', calc: () => { setValue1('18'); setMode('basic'); } },
    { label: 'Discount 25%', calc: () => { setValue1('25'); setMode('basic'); } },
    { label: 'Half 50%', calc: () => { setValue1('50'); setMode('basic'); } },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-7xl mb-6 inline-block">📊</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Percentage Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Calculate percentages, increases, and differences instantly
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {[
            { id: 'basic', label: 'X% of Y', desc: 'Basic percentage' },
            { id: 'increase', label: 'X is ?% of Y', desc: 'Find percentage' },
            { id: 'difference', label: '% change', desc: 'Increase/decrease' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id as any); setResult(null); }}
              className={`px-6 py-4 rounded-2xl font-medium transition-all ${
                mode === m.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-500'
              }`}
            >
              <div className="font-bold">{m.label}</div>
              <div className="text-xs opacity-75">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Calculator Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {mode === 'basic' ? 'Percentage (%)' : mode === 'increase' ? 'Value (X)' : 'Original Value'}
              </label>
              <input
                type="number"
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
                placeholder={mode === 'basic' ? 'e.g., 15' : 'e.g., 25'}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500
                         dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {mode === 'basic' ? 'Of Value' : mode === 'increase' ? 'Total (Y)' : 'New Value'}
              </label>
              <input
                type="number"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                         focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500
                         dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Buttons */}
          {mode === 'basic' && (
            <div className="flex flex-wrap gap-2 mb-6">
              {quickCalculations.map((q) => (
                <button
                  key={q.label}
                  onClick={q.calc}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg
                           hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-sm font-medium"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={calculate}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xl font-bold rounded-2xl
                     hover:from-indigo-700 hover:to-violet-700 transform transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            Calculate
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl text-center">
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{result}</div>
            </div>
          )}
        </div>

        {/* Formulas */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">📐 Useful Formulas</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">X% of Y</div>
              <code className="text-gray-600 dark:text-gray-300">(X ÷ 100) × Y</code>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">X is what % of Y</div>
              <code className="text-gray-600 dark:text-gray-300">(X ÷ Y) × 100</code>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">% Change</div>
              <code className="text-gray-600 dark:text-gray-300">((New - Old) ÷ Old) × 100</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

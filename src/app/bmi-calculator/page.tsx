'use client';

import { useState } from 'react';

export default function BmiCalculatorPage() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    color: string;
    advice: string;
  } | null>(null);

  const calculateBMI = () => {
    let bmi: number;

    if (unit === 'metric') {
      const w = parseFloat(weight);
      const h = parseFloat(height) / 100; // cm to m
      if (!w || !h) return;
      bmi = w / (h * h);
    } else {
      const w = parseFloat(weight);
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      const totalInches = (ft * 12) + inches;
      if (!w || !totalInches) return;
      bmi = (w / (totalInches * totalInches)) * 703;
    }

    let category: string;
    let color: string;
    let advice: string;

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-600';
      advice = 'You may need to gain some weight. Consult a healthcare provider for personalized advice.';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = 'text-green-600';
      advice = 'Great job! You\'re in a healthy weight range. Maintain your healthy lifestyle.';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-yellow-600';
      advice = 'Consider making lifestyle changes like regular exercise and balanced diet.';
    } else {
      category = 'Obese';
      color = 'text-red-600';
      advice = 'It\'s recommended to consult a healthcare provider for a personalized plan.';
    }

    setResult({ bmi, category, color, advice });
  };

  const bmiRanges = [
    { range: '< 18.5', category: 'Underweight', color: 'bg-blue-500', width: '18.5%' },
    { range: '18.5 - 24.9', category: 'Normal', color: 'bg-green-500', width: '25%' },
    { range: '25 - 29.9', category: 'Overweight', color: 'bg-yellow-500', width: '20%' },
    { range: '≥ 30', category: 'Obese', color: 'bg-red-500', width: '36.5%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-7xl mb-6 inline-block">⚖️</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            BMI Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Calculate your Body Mass Index and understand your weight status
          </p>
        </div>

        {/* Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          {/* Unit Toggle */}
          <div className="flex gap-3 justify-center mb-8">
            {[
              { id: 'metric', label: 'Metric (kg/cm)' },
              { id: 'imperial', label: 'Imperial (lb/ft)' },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => { setUnit(u.id as any); setResult(null); }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  unit === u.id
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Weight */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Weight ({unit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                         focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500
                         dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Height ({unit === 'metric' ? 'cm' : 'ft & in'})
              </label>
              {unit === 'metric' ? (
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 175"
                  className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                           focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500
                           dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="ft"
                    className="w-1/2 px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                             focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500
                             dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="in"
                    className="w-1/2 px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                             focus:outline-none focus:ring-4 focus:ring-green-500/30 focus:border-green-500
                             dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-2xl
                     hover:from-green-700 hover:to-emerald-700 transform transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            Calculate BMI
          </button>

          {/* Result */}
          {result && (
            <div className="mt-8 text-center">
              <div className="text-7xl font-bold mb-2">
                <span className={result.color}>{result.bmi.toFixed(1)}</span>
              </div>
              <div className={`text-2xl font-bold mb-4 ${result.color}`}>{result.category}</div>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{result.advice}</p>
            </div>
          )}
        </div>

        {/* BMI Scale */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">📊 BMI Categories</h3>
          <div className="flex rounded-xl overflow-hidden mb-4">
            {bmiRanges.map((r) => (
              <div
                key={r.category}
                className={`${r.color} h-6`}
                style={{ width: r.width }}
                title={`${r.category}: ${r.range}`}
              ></div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {bmiRanges.map((r) => (
              <div key={r.category}>
                <div className={`w-3 h-3 ${r.color} rounded-full mx-auto mb-1`}></div>
                <div className="font-medium text-gray-700 dark:text-gray-300">{r.category}</div>
                <div className="text-gray-500 dark:text-gray-400">{r.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

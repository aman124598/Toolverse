'use client';

import { useState } from 'react';

export default function SipCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [timePeriod, setTimePeriod] = useState('');

  const P = parseFloat(monthlyInvestment) || 0;
  const r = (parseFloat(expectedReturn) || 0) / 12 / 100;
  const n = (parseFloat(timePeriod) || 0) * 12;

  let futureValue = 0;
  let totalInvested = P * n;
  let totalReturns = 0;

  if (P > 0 && r > 0 && n > 0) {
    futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    totalReturns = futureValue - totalInvested;
  }

  const investedPercent = futureValue > 0 ? (totalInvested / futureValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-6xl mb-6 inline-block">📈</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SIP Calculator</h1>
          <p className="text-gray-400">Calculate your Systematic Investment Plan returns</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Monthly Investment (₹)</label>
                <input
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Expected Return Rate (% per annum)</label>
                <input
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  placeholder="e.g., 12"
                  step="0.1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Time Period (Years)</label>
                <input
                  type="number"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-6 text-center">
                <div className="text-sm text-gray-400 mb-1">Future Value</div>
                <div className="text-4xl font-bold text-white">₹{futureValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">Invested Amount</div>
                  <div className="text-lg font-semibold text-blue-400">₹{totalInvested.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">Est. Returns</div>
                  <div className="text-lg font-semibold text-emerald-400">₹{totalReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                </div>
              </div>

              {/* Progress Bar */}
              {futureValue > 0 && (
                <div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="bg-blue-500 h-full" style={{ width: `${investedPercent}%` }}></div>
                    <div className="bg-emerald-500 h-full flex-1"></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2 text-gray-400">
                    <span>Invested ({investedPercent.toFixed(1)}%)</span>
                    <span>Returns ({(100 - investedPercent).toFixed(1)}%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

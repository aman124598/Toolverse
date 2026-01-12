'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');
  const [tenureType, setTenureType] = useState<'months' | 'years'>('years');
  const [showSchedule, setShowSchedule] = useState(false);

  const P = parseFloat(principal) || 0;
  const annualRate = parseFloat(rate) || 0;
  const R = annualRate / 12 / 100;
  const N = tenureType === 'years' ? (parseFloat(tenure) || 0) * 12 : (parseFloat(tenure) || 0);

  let emi = 0;
  let totalAmount = 0;
  let totalInterest = 0;

  if (P > 0 && R > 0 && N > 0) {
    emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    totalAmount = emi * N;
    totalInterest = totalAmount - P;
  }

  const principalPercent = totalAmount > 0 ? (P / totalAmount) * 100 : 0;

  // Generate amortization schedule
  const getSchedule = () => {
    const schedule = [];
    let balance = P;
    for (let month = 1; month <= Math.min(N, 24); month++) {
      const interest = balance * R;
      const principalPayment = emi - interest;
      balance -= principalPayment;
      schedule.push({
        month,
        payment: emi,
        principal: principalPayment,
        interest,
        balance: Math.max(0, balance)
      });
    }
    return schedule;
  };

  const formatCurrency = (amt: number) => '₹' + amt.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const quickAmounts = [500000, 1000000, 2500000, 5000000];
  const quickRates = [7.5, 8.5, 9.5, 10.5];
  const quickTenures = [5, 10, 15, 20, 25, 30];

  return (
    <ToolLayout
      title="EMI Calculator"
      description="Calculate loan EMI with detailed amortization schedule"
      icon={Icons.bank}
      gradient="from-emerald-500 to-teal-500"
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left - Inputs */}
        <div className="space-y-8">
          {/* Loan Amount */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">Loan Amount</label>
              <span className="text-lg font-semibold text-white">{formatCurrency(P)}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full accent-emerald-500 mb-3"
            />
            <div className="flex gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPrincipal(String(amt))}
                  className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                    P === amt ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {amt >= 1000000 ? `${amt/1000000}M` : `${amt/100000}L`}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">Interest Rate (p.a.)</label>
              <span className="text-lg font-semibold text-white">{annualRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full accent-emerald-500 mb-3"
            />
            <div className="flex gap-2">
              {quickRates.map((r) => (
                <button
                  key={r}
                  onClick={() => setRate(String(r))}
                  className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                    annualRate === r ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">Loan Tenure</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{tenure}</span>
                <div className="flex bg-white/5 rounded-lg p-0.5">
                  {(['years', 'months'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTenureType(type)}
                      className={`px-3 py-1 rounded-md text-xs transition-all ${
                        tenureType === type ? 'bg-emerald-500 text-black' : 'text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max={tenureType === 'years' ? '30' : '360'}
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="w-full accent-emerald-500 mb-3"
            />
            {tenureType === 'years' && (
              <div className="flex gap-2">
                {quickTenures.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenure(String(t))}
                    className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                      parseFloat(tenure) === t ? 'bg-emerald-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {t}Y
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Results */}
        <div className="space-y-6">
          {/* EMI Display */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-8 text-center border border-emerald-500/20">
            <div className="text-sm text-gray-400 mb-2">Monthly EMI</div>
            <div className="text-5xl font-bold text-white mb-2">{formatCurrency(emi)}</div>
            <div className="text-sm text-gray-400">for {N} months</div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
              <div className="text-sm text-gray-400 mb-1">Principal Amount</div>
              <div className="text-xl font-semibold text-emerald-400">{formatCurrency(P)}</div>
            </div>
            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
              <div className="text-sm text-gray-400 mb-1">Total Interest</div>
              <div className="text-xl font-semibold text-rose-400">{formatCurrency(totalInterest)}</div>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="text-sm text-gray-400 mb-1">Total Amount Payable</div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</div>
          </div>

          {/* Visual Breakdown */}
          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-400">Payment Breakdown</span>
            </div>
            <div className="flex h-6 bg-white/5 rounded-full overflow-hidden mb-3">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${principalPercent}%` }} />
              <div className="bg-rose-500 h-full flex-1" />
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded" />
                <span className="text-gray-400">Principal ({principalPercent.toFixed(1)}%)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-rose-500 rounded" />
                <span className="text-gray-400">Interest ({(100 - principalPercent).toFixed(1)}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      <div className="mt-8">
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${showSchedule ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          View Amortization Schedule
        </button>

        {showSchedule && (
          <div className="mt-4 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-gray-400">
                  <th className="py-3 px-4 text-left">Month</th>
                  <th className="py-3 px-4 text-right">EMI</th>
                  <th className="py-3 px-4 text-right">Principal</th>
                  <th className="py-3 px-4 text-right">Interest</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {getSchedule().map((row) => (
                  <tr key={row.month} className="border-t border-white/5">
                    <td className="py-3 px-4 text-gray-400">{row.month}</td>
                    <td className="py-3 px-4 text-right text-white">{formatCurrency(row.payment)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400">{formatCurrency(row.principal)}</td>
                    <td className="py-3 px-4 text-right text-rose-400">{formatCurrency(row.interest)}</td>
                    <td className="py-3 px-4 text-right text-gray-400">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {N > 24 && (
              <div className="py-3 px-4 text-center text-sm text-gray-500 border-t border-white/5">
                Showing first 24 months of {N} total months
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

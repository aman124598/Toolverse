'use client';

import { useState } from 'react';

export default function GstCalculatorPage() {
  const [amount, setAmount] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [calcType, setCalcType] = useState<'exclusive' | 'inclusive'>('exclusive');

  const amt = parseFloat(amount) || 0;
  const rate = parseFloat(gstRate) || 0;

  let originalAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;
  let cgst = 0;
  let sgst = 0;

  if (calcType === 'exclusive') {
    originalAmount = amt;
    gstAmount = (amt * rate) / 100;
    totalAmount = amt + gstAmount;
  } else {
    totalAmount = amt;
    originalAmount = (amt * 100) / (100 + rate);
    gstAmount = totalAmount - originalAmount;
  }

  cgst = gstAmount / 2;
  sgst = gstAmount / 2;

  const gstRates = ['0', '5', '12', '18', '28'];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-6xl mb-6 inline-block">💰</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GST Calculator</h1>
          <p className="text-gray-400">Calculate GST, CGST, and SGST instantly</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
          {/* Calc Type Toggle */}
          <div className="flex gap-3 mb-8 justify-center">
            {[
              { id: 'exclusive', label: 'Add GST', desc: 'GST Exclusive' },
              { id: 'inclusive', label: 'Remove GST', desc: 'GST Inclusive' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setCalcType(type.id as 'exclusive' | 'inclusive')}
                className={`px-6 py-3 rounded-xl transition-all ${
                  calcType === type.id
                    ? 'bg-amber-500 text-black font-medium'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {calcType === 'exclusive' ? 'Original Amount (₹)' : 'Total Amount with GST (₹)'}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">GST Rate (%)</label>
                <div className="flex gap-2 flex-wrap">
                  {gstRates.map((r) => (
                    <button
                      key={r}
                      onClick={() => setGstRate(r)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        gstRate === r
                          ? 'bg-amber-500 text-black font-medium'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-400">Original Amount</span>
                <span className="text-xl font-semibold">₹{originalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-400">GST Amount ({rate}%)</span>
                <span className="text-xl font-semibold text-amber-400">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">CGST ({rate/2}%)</div>
                  <div className="font-semibold">₹{cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">SGST ({rate/2}%)</div>
                  <div className="font-semibold">₹{sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Total Amount</span>
                <span className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

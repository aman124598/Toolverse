'use client';

import { useState } from 'react';

export default function DiscountCalculatorPage() {
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [currency, setCurrency] = useState('$');

  const original = parseFloat(originalPrice) || 0;
  const discount = parseFloat(discountPercent) || 0;
  const savings = (original * discount) / 100;
  const finalPrice = original - savings;

  const presets = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-7xl mb-6 inline-block">🏷️</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Discount Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Calculate sale prices and savings instantly
          </p>
        </div>

        {/* Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original Price */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Original Price
              </label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent text-gray-500 dark:text-gray-400"
                >
                  <option value="$">$</option>
                  <option value="€">€</option>
                  <option value="£">£</option>
                  <option value="₹">₹</option>
                  <option value="¥">¥</option>
                </select>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="100.00"
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                           focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500
                           dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="25"
                max="100"
                min="0"
                className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-xl
                         focus:outline-none focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500
                         dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mb-8">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Quick select:</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setDiscountPercent(p.toString())}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    discountPercent === p.toString()
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {original > 0 && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">You Save</div>
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {currency}{savings.toFixed(2)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 text-center md:col-span-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Final Price</div>
                <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                  {currency}{finalPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-through">
                  Was {currency}{original.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discount Table */}
        {original > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">📊 Quick Reference</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => (
                <div key={p} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{p}% off</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {currency}{(original - (original * p) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

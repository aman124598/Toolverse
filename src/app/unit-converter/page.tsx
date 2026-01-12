'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

const unitCategories = {
  length: {
    name: 'Length',
    icon: '📏',
    color: 'from-blue-500 to-cyan-500',
    units: [
      { id: 'mm', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { id: 'm', name: 'Meter', symbol: 'm', factor: 1 },
      { id: 'km', name: 'Kilometer', symbol: 'km', factor: 1000 },
      { id: 'in', name: 'Inch', symbol: 'in', factor: 0.0254 },
      { id: 'ft', name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', name: 'Mile', symbol: 'mi', factor: 1609.344 },
    ]
  },
  weight: {
    name: 'Weight',
    icon: '⚖️',
    color: 'from-purple-500 to-pink-500',
    units: [
      { id: 'mg', name: 'Milligram', symbol: 'mg', factor: 0.000001 },
      { id: 'g', name: 'Gram', symbol: 'g', factor: 0.001 },
      { id: 'kg', name: 'Kilogram', symbol: 'kg', factor: 1 },
      { id: 'ton', name: 'Metric Ton', symbol: 't', factor: 1000 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
      { id: 'lb', name: 'Pound', symbol: 'lb', factor: 0.453592 },
    ]
  },
  temperature: {
    name: 'Temperature',
    icon: '🌡️',
    color: 'from-red-500 to-orange-500',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', factor: 1 },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', factor: 1 },
      { id: 'k', name: 'Kelvin', symbol: 'K', factor: 1 },
    ]
  },
  area: {
    name: 'Area',
    icon: '⬛',
    color: 'from-emerald-500 to-teal-500',
    units: [
      { id: 'sqcm', name: 'Sq Centimeter', symbol: 'cm²', factor: 0.0001 },
      { id: 'sqm', name: 'Sq Meter', symbol: 'm²', factor: 1 },
      { id: 'sqkm', name: 'Sq Kilometer', symbol: 'km²', factor: 1000000 },
      { id: 'sqft', name: 'Sq Foot', symbol: 'ft²', factor: 0.092903 },
      { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.86 },
      { id: 'hectare', name: 'Hectare', symbol: 'ha', factor: 10000 },
    ]
  },
  volume: {
    name: 'Volume',
    icon: '🧪',
    color: 'from-amber-500 to-yellow-500',
    units: [
      { id: 'ml', name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { id: 'l', name: 'Liter', symbol: 'L', factor: 1 },
      { id: 'gal', name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
      { id: 'qt', name: 'Quart', symbol: 'qt', factor: 0.946353 },
      { id: 'pt', name: 'Pint', symbol: 'pt', factor: 0.473176 },
      { id: 'cup', name: 'Cup', symbol: 'cup', factor: 0.236588 },
    ]
  },
  time: {
    name: 'Time',
    icon: '⏱️',
    color: 'from-indigo-500 to-violet-500',
    units: [
      { id: 'ms', name: 'Millisecond', symbol: 'ms', factor: 0.001 },
      { id: 'sec', name: 'Second', symbol: 's', factor: 1 },
      { id: 'min', name: 'Minute', symbol: 'min', factor: 60 },
      { id: 'hr', name: 'Hour', symbol: 'h', factor: 3600 },
      { id: 'day', name: 'Day', symbol: 'd', factor: 86400 },
      { id: 'week', name: 'Week', symbol: 'wk', factor: 604800 },
      { id: 'month', name: 'Month', symbol: 'mo', factor: 2629746 },
      { id: 'year', name: 'Year', symbol: 'yr', factor: 31556952 },
    ]
  },
  data: {
    name: 'Data',
    icon: '💾',
    color: 'from-cyan-500 to-blue-500',
    units: [
      { id: 'b', name: 'Bit', symbol: 'b', factor: 0.125 },
      { id: 'byte', name: 'Byte', symbol: 'B', factor: 1 },
      { id: 'kb', name: 'Kilobyte', symbol: 'KB', factor: 1024 },
      { id: 'mb', name: 'Megabyte', symbol: 'MB', factor: 1048576 },
      { id: 'gb', name: 'Gigabyte', symbol: 'GB', factor: 1073741824 },
      { id: 'tb', name: 'Terabyte', symbol: 'TB', factor: 1099511627776 },
    ]
  },
  speed: {
    name: 'Speed',
    icon: '🚀',
    color: 'from-rose-500 to-pink-500',
    units: [
      { id: 'mps', name: 'Meters/sec', symbol: 'm/s', factor: 1 },
      { id: 'kmph', name: 'Km/hour', symbol: 'km/h', factor: 0.277778 },
      { id: 'mph', name: 'Miles/hour', symbol: 'mph', factor: 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', factor: 0.514444 },
      { id: 'fps', name: 'Feet/sec', symbol: 'ft/s', factor: 0.3048 },
    ]
  },
};

export default function UnitConverterPage() {
  const [category, setCategory] = useState<keyof typeof unitCategories>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [value, setValue] = useState('1');
  const [history, setHistory] = useState<string[]>([]);

  const convert = () => {
    const val = parseFloat(value) || 0;
    const categoryData = unitCategories[category];
    
    if (category === 'temperature') {
      if (fromUnit === 'c' && toUnit === 'f') return (val * 9/5) + 32;
      if (fromUnit === 'c' && toUnit === 'k') return val + 273.15;
      if (fromUnit === 'f' && toUnit === 'c') return (val - 32) * 5/9;
      if (fromUnit === 'f' && toUnit === 'k') return ((val - 32) * 5/9) + 273.15;
      if (fromUnit === 'k' && toUnit === 'c') return val - 273.15;
      if (fromUnit === 'k' && toUnit === 'f') return ((val - 273.15) * 9/5) + 32;
      return val;
    }

    const fromFactor = categoryData.units.find(u => u.id === fromUnit)?.factor || 1;
    const toFactor = categoryData.units.find(u => u.id === toUnit)?.factor || 1;
    return (val * fromFactor) / toFactor;
  };

  const result = convert();
  const currentCategory = unitCategories[category];
  const currentUnits = currentCategory.units;

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const addToHistory = () => {
    const fromSymbol = currentUnits.find(u => u.id === fromUnit)?.symbol;
    const toSymbol = currentUnits.find(u => u.id === toUnit)?.symbol;
    const entry = `${value} ${fromSymbol} = ${result.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${toSymbol}`;
    setHistory(prev => [entry, ...prev.slice(0, 9)]);
  };

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between 100+ units across 8 categories"
      icon={Icons.scale}
      gradient={currentCategory.color}
    >
      {/* Category Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Object.entries(unitCategories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => {
              setCategory(key as keyof typeof unitCategories);
              setFromUnit(cat.units[0].id);
              setToUnit(cat.units[1]?.id || cat.units[0].id);
            }}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              category === key
                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="hidden sm:inline">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-end">
        {/* From */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-white/20"
          >
            {currentUnits.map((u) => (
              <option key={u.id} value={u.id} className="bg-gray-900">{u.name} ({u.symbol})</option>
            ))}
          </select>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value"
            className="w-full px-4 py-4 bg-black/20 border border-white/5 rounded-xl text-2xl text-white placeholder-gray-600 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Swap Button */}
        <div className="flex md:flex-col items-center justify-center gap-3 py-4">
          <button
            onClick={swapUnits}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-white/20"
          >
            {currentUnits.map((u) => (
              <option key={u.id} value={u.id} className="bg-gray-900">{u.name} ({u.symbol})</option>
            ))}
          </select>
          <div className={`w-full px-4 py-4 bg-gradient-to-r ${currentCategory.color}/20 border border-white/10 rounded-xl text-2xl font-semibold text-white`}>
            {result.toLocaleString('en-US', { maximumFractionDigits: 10 })}
          </div>
        </div>
      </div>

      {/* Result Summary */}
      <div className="mt-8 flex items-center justify-center">
        <button
          onClick={addToHistory}
          className="px-6 py-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
        >
          <span className="text-gray-300">
            {value} {currentUnits.find(u => u.id === fromUnit)?.symbol} = {' '}
            <span className="font-semibold text-white">{result.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
            {' '}{currentUnits.find(u => u.id === toUnit)?.symbol}
          </span>
          <span className="ml-3 text-xs text-gray-500 group-hover:text-gray-400">Click to save</span>
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Conversion History</span>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((entry, i) => (
              <div key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-400 font-mono">
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

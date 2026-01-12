'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function ColorPickerPage() {
  const [h, setH] = useState(270);
  const [s, setS] = useState(70);
  const [l, setL] = useState(60);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedColors, setSavedColors] = useState<string[]>([]);

  // HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255)
    };
  };

  const rgb = hslToRgb(h, s, l);
  const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const saveColor = () => {
    if (!savedColors.includes(hex)) {
      setSavedColors(prev => [hex, ...prev.slice(0, 11)]);
    }
  };

  const loadColor = (hexColor: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    if (result) {
      const r = parseInt(result[1], 16) / 255;
      const g = parseInt(result[2], 16) / 255;
      const b = parseInt(result[3], 16) / 255;
      
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let newH = 0, newS = 0;
      const newL = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        newS = newL > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: newH = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: newH = ((b - r) / d + 2) / 6; break;
          case b: newH = ((r - g) / d + 4) / 6; break;
        }
      }

      setH(Math.round(newH * 360));
      setS(Math.round(newS * 100));
      setL(Math.round(newL * 100));
    }
  };

  const presetColors = [
    '#FF6B6B', '#FF8E53', '#FFC93C', '#6BCB77', '#4D96FF', '#9B59B6',
    '#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#607D8B', '#795548',
  ];

  return (
    <ToolLayout
      title="Color Picker"
      description="Pick, convert, and explore colors with precision"
      icon={Icons.palette}
      gradient="from-pink-500 to-rose-500"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left - Color Preview & Controls */}
        <div className="space-y-6">
          {/* Color Preview */}
          <div 
            className="h-48 rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden"
            style={{ backgroundColor: hex }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <button
              onClick={saveColor}
              className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors"
              title="Save color"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* HSL Sliders */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Hue</span>
                <span className="text-white font-mono">{h}°</span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{
                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
              }}>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={h}
                  onChange={(e) => setH(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-white pointer-events-none"
                  style={{ left: `calc(${(h / 360) * 100}% - 10px)` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Saturation</span>
                <span className="text-white font-mono">{s}%</span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{
                background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`
              }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={s}
                  onChange={(e) => setS(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-white pointer-events-none"
                  style={{ left: `calc(${s}% - 10px)` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Lightness</span>
                <span className="text-white font-mono">{l}%</span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{
                background: `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`
              }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={l}
                  onChange={(e) => setL(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-white pointer-events-none"
                  style={{ left: `calc(${l}% - 10px)` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right - Color Values & More */}
        <div className="space-y-6">
          {/* Color Values */}
          <div className="space-y-3">
            {[
              { label: 'HEX', value: hex },
              { label: 'RGB', value: rgbStr },
              { label: 'HSL', value: hslStr },
            ].map((format) => (
              <button
                key={format.label}
                onClick={() => copy(format.value, format.label)}
                className="w-full flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 uppercase w-10">{format.label}</span>
                  <span className="font-mono text-white">{format.value}</span>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-white transition-colors">
                  {copied === format.label ? '✓ Copied!' : 'Click to copy'}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div>
            <h3 className="text-sm text-gray-400 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => loadColor(color)}
                  className="aspect-square rounded-xl border-2 border-transparent hover:border-white/50 transition-all hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Saved Colors */}
          {savedColors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-gray-400">Saved Colors</h3>
                <button
                  onClick={() => setSavedColors([])}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {savedColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => loadColor(color)}
                    className="aspect-square rounded-xl border-2 border-white/10 hover:border-white/50 transition-all hover:scale-110"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Color Harmony */}
          <div>
            <h3 className="text-sm text-gray-400 mb-3">Complementary</h3>
            <div className="flex gap-2">
              {[0, 180].map((offset) => {
                const harmonyH = (h + offset) % 360;
                const harmonyRgb = hslToRgb(harmonyH, s, l);
                const harmonyHex = `#${harmonyRgb.r.toString(16).padStart(2, '0')}${harmonyRgb.g.toString(16).padStart(2, '0')}${harmonyRgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
                return (
                  <button
                    key={offset}
                    onClick={() => setH(harmonyH)}
                    className="flex-1 h-12 rounded-xl border border-white/10 hover:border-white/30 transition-colors"
                    style={{ backgroundColor: harmonyHex }}
                    title={harmonyHex}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

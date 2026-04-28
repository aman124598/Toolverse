'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer } from '@/components/StitchComponents';
import Mobile from '@/lib/mobileAdapters';

export default function ColorPickerPage() {
  const [color, setColor] = useState('#8B5CF6'); // Default purple
  const [copied, setCopied] = useState<string | null>(null);

  const hex2rgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hex2hsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const rgb = hex2rgb(color);
  const hsl = hex2hsl(color);

  const handleCopy = async (val: string, label: string) => {
    await Mobile.copyText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="Color Picker"
      description="Pick colors and convert between HEX, RGB, and HSL formats"
      icon={Icons.palette}
      gradient="from-fuchsia-500 to-purple-500"
    >
      <div className="space-y-6">
        <StitchContainer className="text-center">
          <div className="mb-8">
            <div
              className="w-32 h-32 sm:w-48 sm:h-48 rounded-full mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white/20 transition-colors duration-200 cursor-pointer overflow-hidden relative"
              style={{ backgroundColor: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-[200%] h-[200%] -top-[50%] -left-[50%] cursor-pointer opacity-0"
              />
            </div>
            <p className="mt-4 text-gray-400 text-sm flex items-center justify-center gap-1">Tap the circle to change color</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'HEX', val: color.toUpperCase() },
              { label: 'RGB', val: rgb },
              { label: 'HSL', val: hsl }
            ].map((fmt) => (
              <div key={fmt.label} className="bg-black/40 border border-white/10 rounded-xl p-4 text-left relative group">
                <span className="text-xs text-gray-500 font-medium">{fmt.label}</span>
                <div className="text-white font-mono mt-1 text-sm">{fmt.val}</div>
                <button
                  onClick={() => handleCopy(fmt.val, fmt.label)}
                  className="absolute top-4 right-4 text-xs text-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied === fmt.label ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </StitchContainer>
      </div>
    </ToolLayout>
  );
}

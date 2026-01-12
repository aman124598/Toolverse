'use client';

import { useState, useEffect } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(20);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ password: string; strength: string; date: Date }[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const generatePassword = () => {
    let chars = '';
    if (includeUppercase) chars += excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) chars += excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += excludeAmbiguous ? '23456789' : '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
    
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    setPassword(result);
    const strengthInfo = getStrength(result);
    setHistory(prev => [{ password: result, strength: strengthInfo.label, date: new Date() }, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    generatePassword();
  }, []);

  const copyToClipboard = async (text: string = password) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = (pwd: string = password) => {
    if (!pwd) return { label: 'None', color: 'text-gray-500', bg: 'bg-gray-500', width: 0, score: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2;
    
    if (score <= 3) return { label: 'Weak', color: 'text-red-400', bg: 'bg-red-500', width: 25, score };
    if (score <= 5) return { label: 'Fair', color: 'text-orange-400', bg: 'bg-orange-500', width: 50, score };
    if (score <= 7) return { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500', width: 75, score };
    return { label: 'Very Strong', color: 'text-emerald-300', bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', width: 100, score };
  };

  const strength = getStrength();
  const entropy = Math.round(password.length * Math.log2(
    (includeUppercase ? 26 : 0) + (includeLowercase ? 26 : 0) + 
    (includeNumbers ? 10 : 0) + (includeSymbols ? 32 : 0) || 26
  ));

  const presets = [
    { name: 'PIN', length: 4, upper: false, lower: false, numbers: true, symbols: false },
    { name: 'Simple', length: 8, upper: true, lower: true, numbers: true, symbols: false },
    { name: 'Strong', length: 16, upper: true, lower: true, numbers: true, symbols: true },
    { name: 'Maximum', length: 32, upper: true, lower: true, numbers: true, symbols: true },
  ];

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate cryptographically secure passwords with custom options"
      icon={Icons.lock}
      gradient="from-violet-500 to-purple-600"
    >
      {/* Generated Password Display */}
      <div className="relative mb-8">
        <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={password}
                readOnly
                className="w-full bg-transparent text-2xl md:text-3xl font-mono text-white tracking-wider outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard()}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                title="Copy"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={generatePassword}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
                title="Regenerate"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Strength Indicator */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Strength:</span>
                <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{password.length} characters</span>
                <span>{entropy} bits entropy</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${strength.bg} transition-all duration-500`} 
                style={{ width: `${strength.width}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2 mb-8">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setLength(preset.length);
              setIncludeUppercase(preset.upper);
              setIncludeLowercase(preset.lower);
              setIncludeNumbers(preset.numbers);
              setIncludeSymbols(preset.symbols);
              setTimeout(generatePassword, 0);
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Configuration */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Length */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Password Length</h3>
          <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl font-bold text-white">{length}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLength(Math.max(4, length - 1))}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-lg"
                >−</button>
                <button
                  onClick={() => setLength(Math.min(64, length + 1))}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-lg"
                >+</button>
              </div>
            </div>
            <input
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>4</span>
              <span>64</span>
            </div>
          </div>
        </div>

        {/* Right Column - Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Character Types</h3>
          <div className="space-y-3">
            {[
              { label: 'Uppercase Letters', sublabel: 'A-Z', checked: includeUppercase, onChange: setIncludeUppercase },
              { label: 'Lowercase Letters', sublabel: 'a-z', checked: includeLowercase, onChange: setIncludeLowercase },
              { label: 'Numbers', sublabel: '0-9', checked: includeNumbers, onChange: setIncludeNumbers },
              { label: 'Special Characters', sublabel: '!@#$%', checked: includeSymbols, onChange: setIncludeSymbols },
              { label: 'Exclude Ambiguous', sublabel: 'l, 1, I, O, 0', checked: excludeAmbiguous, onChange: setExcludeAmbiguous },
            ].map((opt) => (
              <label 
                key={opt.label} 
                className="flex items-center justify-between p-4 bg-black/20 rounded-xl cursor-pointer hover:bg-black/30 transition-colors border border-white/5"
              >
                <div>
                  <div className="text-sm text-white">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.sublabel}</div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={opt.checked}
                    onChange={(e) => opt.onChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${opt.checked ? 'bg-purple-500' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${opt.checked ? 'translate-x-5.5' : 'translate-x-0.5'} mt-0.5`} 
                      style={{ transform: opt.checked ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePassword}
        className="mt-8 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-semibold text-lg
                 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Generate New Password
      </button>

      {/* History Toggle */}
      {history.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Password History ({history.length})
          </button>
          
          {showHistory && (
            <div className="mt-4 space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-black/20 rounded-xl border border-white/5">
                  <span className="flex-1 font-mono text-sm text-gray-300 truncate">{item.password}</span>
                  <span className="text-xs text-gray-500">{item.strength}</span>
                  <button
                    onClick={() => copyToClipboard(item.password)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}

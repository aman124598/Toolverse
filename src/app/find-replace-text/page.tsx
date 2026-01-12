'use client';

import { useState } from 'react';

export default function FindReplaceTextPage() {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [copied, setCopied] = useState(false);

  const getReplacedText = () => {
    if (!find) return text;
    
    let pattern = find;
    if (wholeWord) {
      pattern = `\\b${find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
    } else {
      pattern = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    const regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    return text.replace(regex, replace);
  };

  const result = getReplacedText();
  const matchCount = find ? (text.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi')) || []).length : 0;

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-6xl mb-6 inline-block">🔍</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find & Replace</h1>
          <p className="text-gray-400">Find and replace text instantly</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
          {/* Find/Replace Fields */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Find</label>
              <input
                type="text"
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder="Text to find..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Replace with</label>
              <input
                type="text"
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                placeholder="Replacement text..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-400">Case sensitive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-400">Whole word only</span>
            </label>
            {find && (
              <span className="text-sm text-blue-400">{matchCount} matches found</span>
            )}
          </div>

          {/* Text Areas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-400">Input Text</label>
                <button onClick={() => setText('')} className="text-xs text-red-400 hover:text-red-300">Clear</button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter or paste your text here..."
                className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-400">Result</label>
                <button 
                  onClick={copy} 
                  disabled={!result}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white overflow-auto whitespace-pre-wrap">
                {result || <span className="text-gray-500">Result will appear here...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

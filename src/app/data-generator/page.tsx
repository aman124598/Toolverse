'use client';

import { useState } from 'react';

interface FakeData {
  name: string;
  email: string;
  phone: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export default function DataGeneratorPage() {
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FakeData[]>([]);

  const generateData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/data/generate?count=${count}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        alert(result.error || 'Failed to generate data');
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const copyAllData = () => {
    let text = '';

    data.forEach((item, index) => {
      text += `Entry ${index + 1}:\n`;
      text += `Name: ${item.name}\n`;
      text += `Email: ${item.email}\n`;
      text += `Phone: ${item.phone}\n`;
      text += `Address: ${item.address}\n\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      alert('Copied all data to clipboard!');
    }).catch(err => {
      alert('Failed to copy: ' + err);
    });
  };

  const clearData = () => {
    setData([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block">
            <span className="text-6xl mb-4 inline-block animate-bounce">👤</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Fake Data Generator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Generate realistic test data for development and testing
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-blue-900 dark:text-blue-100 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <span>Generate realistic fake data including names, emails, phone numbers, and addresses. Perfect for testing applications!</span>
          </p>
        </div>

        {/* Controls Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-3xl">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="count" className="block font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
                Number of entries
              </label>
              <input
                type="number"
                id="count"
                value={count}
                onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 50))}
                min="1"
                max="50"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-base 
                         focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 
                         dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={generateData}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl 
                         hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transform transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                {loading ? 'Generating...' : 'Generate Data'}
              </button>

              {data.length > 0 && (
                <>
                  <button
                    onClick={copyAllData}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl 
                             hover:bg-gray-300 dark:hover:bg-gray-600 transform transition-all hover:scale-105"
                  >
                    📋 Copy All
                  </button>
                  <button
                    onClick={clearData}
                    className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl 
                             hover:bg-gray-300 dark:hover:bg-gray-600 transform transition-all hover:scale-105"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-16 text-center border border-gray-200 dark:border-gray-700">
            <div className="inline-block w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Generating data...</p>
          </div>
        )}

        {/* Data Output */}
        {!loading && data.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 
                           border border-gray-200 dark:border-gray-600 rounded-xl p-6 
                           hover:shadow-lg transition-all hover:scale-[1.02] cursor-default"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">Name:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{item.name}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">Email:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{item.email}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">Phone:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{item.phone}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-semibold text-gray-600 dark:text-gray-400 min-w-[80px]">Address:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{item.address}</span>
                    </div>
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

'use client';

import { useState } from 'react';

export default function DwgToPdfPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block">
            <span className="text-6xl mb-4 inline-block animate-bounce">📄</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Dwg To Pdf
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Free online dwg to pdf tool - fast, secure, and easy to use
          </p>
        </div>

        {/* Tool Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg mb-4">🚀 Tool functionality coming soon!</p>
            <p className="text-sm">This tool is being migrated from PHP to Next.js.</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">How to use Dwg To Pdf:</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Upload or input your data</li>
            <li>Configure options if available</li>
            <li>Click process/convert</li>
            <li>Download or copy the result</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

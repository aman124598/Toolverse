/**
 * Tool Template Generator
 * Auto-generates Next.js pages for tools based on their category
 */

import fs from 'fs';
import path from 'path';

// Tool page template
const toolPageTemplate = (toolSlug: string, toolTitle: string, category: string) => `'use client';

import { useState } from 'react';

export default function ${toPascalCase(toolSlug)}Page() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block">
            <span className="text-6xl mb-4 inline-block animate-bounce">${getToolIcon(category)}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            ${toolTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Free online ${toolTitle.toLowerCase()} tool - fast, secure, and easy to use
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
          <h2 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">How to use ${toolTitle}:</h2>
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
`;

// Layout/metadata template
const layoutTemplate = (toolSlug: string, toolTitle: string, description: string) => `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${toolTitle} - Toolverse',
  description: '${description}',
  keywords: ['${toolSlug}', '${toolTitle.toLowerCase()}', 'online tool', 'free tool'],
};

export { default } from './page';
`;

// Helper functions
function toPascalCase(str: string): string {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function getToolIcon(category: string): string {
  const icons: Record<string, string> = {
    'PDF Conversion': '📄',
    'PDF to X': '📄',
    'X to PDF': '📄',
    'Finance - Investment': '💰',
    'Finance - Tax': '💵',
    'Finance - Loans': '🏦',
    'Finance - Savings': '🏦',
    'Finance - Interest': '📊',
    'Finance - Other': '💳',
    'Generators': '⚡',
    'Text Tools': '📝',
    'Code Tools': '💻',
    'Calculators': '🔢',
    'Design Tools': '🎨',
  };
  return icons[category] || '🔧';
}

function getToolDescription(toolSlug: string, toolTitle: string): string {
  if (toolSlug.includes('pdf')) {
    return `Free online ${toolTitle.toLowerCase()} tool. Convert, edit, or process PDF files instantly without signup.`;
  }
  if (toolSlug.includes('calculator')) {
    return `Calculate ${toolTitle.toLowerCase().replace(' calculator', '')} easily with our free online calculator. Get instant accurate results.`;
  }
  return `Free ${toolTitle.toLowerCase()} online tool. Fast, secure, and no signup required.`;
}

// Main generator function
export function generateToolFiles(toolSlug: string, toolTitle: string, category: string, outputDir: string) {
  const toolDir = path.join(outputDir, toolSlug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
  }

  // Generate page.tsx
  const pagePath = path.join(toolDir, 'page.tsx');
  fs.writeFileSync(pagePath, toolPageTemplate(toolSlug, toolTitle, category));

  // Generate layout.tsx
  const layoutPath = path.join(toolDir, 'layout.tsx');
  const description = getToolDescription(toolSlug, toolTitle);
  fs.writeFileSync(layoutPath, layoutTemplate(toolSlug, toolTitle, description));

  console.log(`✓ Generated ${toolSlug}`);
}

// Export for use in scripts
export { toolPageTemplate, layoutTemplate, getToolDescription };

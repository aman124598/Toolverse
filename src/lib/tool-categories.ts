/**
 * Toolverse - Complete Tool Categories
 * Total: 121 tools organized by category
 */

export const toolCategories = {
  // PDF Tools (70+ tools)
  'PDF Conversion': [
    'compress-pdf',
    'merge-pdf',
    'split-pdf',
    'rotate-pdf',
    'delete-pdf-pages',
    'reorder-pdf-pages',
    'add-page-number-to-pdf',
    'add-watermark-to-pdf',
    'lock-pdf',
    'unlock-pdf',
    'repair-pdf',
    'flatten-pdf',
    'pdf-metadata-editor',
    'pdf-editor',
  ],
  
  'PDF to X': [
    'pdf-to-word',
    'pdf-to-excel',
    'pdf-to-ppt',
    'pdf-to-jpg',
    'pdf-to-png',
    'pdf-to-text',
    'pdf-to-html',
    'pdf-to-csv',
    'pdf-to-json',
    'pdf-to-xml',
    'pdf-to-markdown',
    'pdf-to-epub',
    'pdf-to-mobi',
    'pdf-to-svg',
    'pdf-to-webp',
    'pdf-to-tiff',
    'pdf-to-jfif',
    'pdf-to-psd',
    'pdf-to-ipynb',
    'pdf-to-audio',
    'pdf-to-ocr',
  ],
  
  'X to PDF': [
    'word-to-pdf',
    'excel-to-pdf',
    'ppt-to-pdf',
    'jpg-to-pdf',
    'png-to-pdf',
    'text-to-pdf',
    'html-to-pdf',
    'csv-to-pdf',
    'json-to-pdf',
    'xml-to-pdf',
    'markdown-to-pdf',
    'epub-to-pdf',
    'mobi-to-pdf',
    'svg-to-pdf',
    'webp-to-pdf',
    'tiff-to-pdf',
    'jfif-to-pdf',
    'dwg-to-pdf',
    'rtf-to-pdf',
    'ipynb-to-pdf',
    'speech-to-pdf',
    'shreelipi-to-pdf',
    'pnr-to-pdf',
  ],

  // Finance Calculators (27 tools)
  'Finance - Investment': [
    'sip-calculator',
    'step-up-sip-calculator',
    'lumpsum-calculator',
    'swp-calculator',
    'mutual-fund-returns-calculator',
    'investment-returns-calculator',
    'cagr-calculator',
    'apy-calculator',
  ],
  
  'Finance - Tax': [
    'income-tax-calculator',
    'gst-calculator',
    'tds-calculator',
    'hra-calculator',
  ],
  
  'Finance - Loans': [
    'emi-calculator',
    'home-loan-emi-calculator',
    'car-loan-emi-calculator',
    'personal-loan-calculator',
    'loan-eligibility-calculator',
    'refinance-calculator',
    'home-equity-loan-calculator',
    'reverse-mortgage-calculator',
    'flat-vs-reducing-rate-calculator',
  ],
  
  'Finance - Savings': [
    'ppf-calculator',
    'fd-calculator',
    'rd-calculator',
    'nps-calculator',
    'nsc-calculator',
    'sukanya-samriddhi-yojana-calculator',
    'epf-calculator',
  ],
  
  'Finance - Interest': [
    'simple-interest-calculator',
    'compound-interest-calculator',
  ],
  
  'Finance - Other': [
    'retirement-calculator',
    'gratuity-calculator',
    'salary-calculator',
    'inflation-calculator',
    'discount-calculator',
    'margin-calculator',
    'brokerage-calculator',
    'percentage-calculator',
    'tax-calculator',
  ],

  // Generators & Utilities (13 tools)
  'Generators': [
    'qr-code-generator',
    'password-generator',
    'calendar-generator',
    'offer-letter-generator',
    'payroll-sheet-generator',
    'data-generator', // Already migrated!
    'name-generator', // To migrate
    'url-shortener', // To migrate
  ],

  // Text Tools (9 tools)
  'Text Tools': [
    'case-converter',
    'find-replace-text',
    'remove-extra-spaces',
    'reverse-text',
    'text-to-slug',
    'word-counter',
  ],

  // Code Tools (4 tools)
  'Code Tools': [
    'json-formatter',
    'xml-formatter',
    'js-minifier',
    'css-minifier',
  ],

  // Calculators (6 tools)
  'Calculators': [
    'scientific-calculator',
    'simple-calculator',
    'age-calculator',
    'bmi-calculator',
    'timesheet-calculator',
    'pto-calculator',
    'unit-converter',
  ],

  // Design Tools (1 tool)
  'Design Tools': [
    'color-picker',
  ],
};

/**
 * Get all tools as a flat array
 */
export function getAllTools(): string[] {
  return Object.values(toolCategories).flat();
}

/**
 * Get total tool count
 */
export function getTotalToolCount(): number {
  return getAllTools().length;
}

/**
 * Get category for a tool
 */
export function getCategoryForTool(toolSlug: string): string | null {
  for (const [category, tools] of Object.entries(toolCategories)) {
    if (tools.includes(toolSlug)) {
      return category;
    }
  }
  return null;
}

/**
 * Tool metadata interface
 */
export interface ToolMetadata {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  isPremium?: boolean;
}

/**
 * Get tool display title from slug
 */
export function getToolTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

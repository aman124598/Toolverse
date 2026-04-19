export const allTools = {
  'PDF Tools': {
    icon: '📄',
    gradient: 'from-red-500 to-orange-500',
    desc: 'Complete PDF toolkit',
    tools: [
      { slug: 'compress-pdf', name: 'Compress PDF', desc: 'Reduce file size' },
      { slug: 'merge-pdf', name: 'Merge PDF', desc: 'Combine files' },
      { slug: 'split-pdf', name: 'Split PDF', desc: 'Extract pages' },
      { slug: 'rotate-pdf', name: 'Rotate PDF', desc: 'Rotate pages' },
      { slug: 'delete-pdf-pages', name: 'Delete Pages', desc: 'Remove pages' },
      { slug: 'reorder-pdf-pages', name: 'Reorder Pages', desc: 'Rearrange pages' },
      { slug: 'add-page-number-to-pdf', name: 'Add Page Numbers', desc: 'Number pages' },
      { slug: 'add-watermark-to-pdf', name: 'Add Watermark', desc: 'Watermark PDF' },
      { slug: 'lock-pdf', name: 'Lock PDF', desc: 'Password protect' },
      { slug: 'unlock-pdf', name: 'Unlock PDF', desc: 'Remove password' },
      { slug: 'pdf-metadata-editor', name: 'Metadata Editor', desc: 'Edit PDF info' },
      { slug: 'flatten-pdf', name: 'Flatten PDF', desc: 'Flatten layers' },
      { slug: 'repair-pdf', name: 'Repair PDF', desc: 'Fix corrupted PDF' },
    ]
  },
  'PDF Converters': {
    icon: '🔄',
    gradient: 'from-orange-500 to-amber-500',
    desc: 'Convert to and from PDF',
    tools: [
      { slug: 'pdf-to-word', name: 'PDF to Word', desc: 'Export to DOCX' },
      { slug: 'pdf-to-text', name: 'PDF to Text', desc: 'Extract text' },
      { slug: 'jpg-to-pdf', name: 'JPG to PDF', desc: 'Images to PDF' },
      { slug: 'png-to-pdf', name: 'PNG to PDF', desc: 'PNG to PDF' },
      { slug: 'text-to-pdf', name: 'Text to PDF', desc: 'Text to PDF' },
      { slug: 'html-to-pdf', name: 'HTML to PDF', desc: 'HTML to PDF' },
      { slug: 'markdown-to-pdf', name: 'Markdown to PDF', desc: 'MD to PDF' },
    ]
  },
  'Financial Calculators': {
    icon: '💰',
    gradient: 'from-emerald-500 to-teal-500',
    desc: 'Calculate loans and investments',
    tools: [
      { slug: 'emi-calculator', name: 'EMI Calculator', desc: 'Loan EMI' },
      { slug: 'sip-calculator', name: 'SIP Calculator', desc: 'SIP returns' },
      { slug: 'gst-calculator', name: 'GST Calculator', desc: 'GST amounts' },
    ]
  },
  'Text Tools': {
    icon: '📝',
    gradient: 'from-blue-500 to-cyan-500',
    desc: 'Format and transform text',
    tools: [
      { slug: 'word-counter', name: 'Word Counter', desc: 'Count words' },
      { slug: 'case-converter', name: 'Case Converter', desc: 'Change case' },
      { slug: 'text-to-slug', name: 'Text to Slug', desc: 'URL slugs' },
      { slug: 'reverse-text', name: 'Reverse Text', desc: 'Flip text' },
      { slug: 'remove-extra-spaces', name: 'Remove Spaces', desc: 'Clean text' },
      { slug: 'find-replace-text', name: 'Find & Replace', desc: 'Search replace' },
    ]
  },
  'Generators': {
    icon: '⚡',
    gradient: 'from-purple-500 to-pink-500',
    desc: 'Generate passwords and data',
    tools: [
      { slug: 'password-generator', name: 'Password Generator', desc: 'Secure passwords' },
      { slug: 'data-generator', name: 'Data Generator', desc: 'Test data' },
    ]
  },
  'Code Tools': {
    icon: '💻',
    gradient: 'from-indigo-500 to-violet-500',
    desc: 'Format code',
    tools: [
      { slug: 'json-formatter', name: 'JSON Formatter', desc: 'Format JSON' },
    ]
  },
  'Calculators': {
    icon: '🔢',
    gradient: 'from-rose-500 to-pink-500',
    desc: 'Math and utility calculators',
    tools: [
      { slug: 'simple-calculator', name: 'Calculator', desc: 'Basic math' },
      { slug: 'age-calculator', name: 'Age Calculator', desc: 'Calculate age' },
      { slug: 'bmi-calculator', name: 'BMI Calculator', desc: 'Body mass index' },
      { slug: 'percentage-calculator', name: 'Percentage', desc: 'Percentages' },
      { slug: 'discount-calculator', name: 'Discount', desc: 'Discounts' },
    ]
  },
  'Design Tools': {
    icon: '🎨',
    gradient: 'from-fuchsia-500 to-purple-500',
    desc: 'Colors and design utilities',
    tools: [
      { slug: 'color-picker', name: 'Color Picker', desc: 'Pick colors' },
      { slug: 'unit-converter', name: 'Unit Converter', desc: 'Convert units' },
    ]
  },
};

export const getToolDetails = (slug: string) => {
  for (const [categoryName, category] of Object.entries(allTools)) {
    const tool = category.tools.find(t => t.slug === slug);
    if (tool) {
      return {
        ...tool,
        categoryName,
        icon: category.icon,
        gradient: category.gradient
      };
    }
  }
  return null;
};

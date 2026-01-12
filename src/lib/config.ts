export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Toolverse',
  description: '240+ free online tools for PDFs, text, calculations & productivity—no limits, no signup required.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
} as const

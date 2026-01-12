# Toolverse - Your Universe of Free Online Tools

![Toolverse](https://img.shields.io/badge/Tools-123-purple)
![License](https://img.shields.io/badge/License-Free-green)
![No Signup](https://img.shields.io/badge/Signup-Not%20Required-blue)

## 🚀 Overview

**Toolverse** is a complete suite of 123+ free online tools covering:

- 📄 **PDF Tools** (70+ tools) - Convert, edit, merge, split, compress PDFs
- 💰 **Finance Calculators** (36 tools) - EMI, SIP, tax, loan calculators
- ⚡ **Generators** (8 tools) - QR codes, passwords, data, names, and more
- 📝 **Text Tools** (6 tools) - Convert, format, count, replace text
- 💻 **Code Tools** (4 tools) - Minify, format JSON/XML/CSS/JS
- 🔢 **Calculators** (7 tools) - Scientific, BMI, age, percentage
- 🎨 **Design Tools** (1 tool) - Color picker

## ✨ Features

- ✅ **100% Free** - No hidden fees, no premium plans
- ✅ **No Signup Required** - Use instantly
- ✅ **Privacy First** - No data collection or tracking
- ✅ **Modern Stack** - Built with Next.js 14, TypeScript, Tailwind CSS
- ✅ **Fast & Responsive** - Works on all devices
- ✅ **SEO Optimized** - Individual pages for each tool
- ✅ **Dark Mode** - Beautiful UI in light and dark themes

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL + Prisma ORM (for URL shortener)
- **AI**: Google Gemini API (for name generator)
- **Font**: Inter (Google Fonts)

## 📦 Installation

```bash
# Clone the repository
cd nextjs

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# DATABASE_URL="your_mysql_url"
# GEMINI_API_KEY="your_gemini_key"
# NEXT_PUBLIC_SITE_NAME="Toolverse"
# NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site!

## 🎯 Quick Start

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run generate-tools  # Generate new tool pages
```

### Adding New Tools

1. Add tool to `src/lib/tool-categories.ts`
2. Run `npm run generate-tools` to auto-generate pages
3. Customize the generated page in `src/app/[tool-slug]/page.tsx`

## 📁 Project Structure

```
nextjs/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── [tool-slug]/      # 123 tool pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   └── lib/
│       ├── config.ts         # Site configuration
│       ├── prisma.ts         # Database client
│       ├── tool-categories.ts # Tool organization
│       └── tool-generator.ts  # Auto-generator
├── prisma/
│   └── schema.prisma         # Database schema
└── scripts/
    └── generate-all-tools.ts # Mass tool generator
```

## 🔧 Available Tools (123 Total)

### PDF Tools (70)

**PDF Conversion** (14 tools)

- Compress, Merge, Split, Rotate, Delete Pages, Reorder Pages, Add Page Numbers, Add Watermark, Lock, Unlock, Repair, Flatten, Metadata Editor, PDF Editor

**PDF to X** (21 tools)

- Convert PDF to: Word, Excel, PPT, JPG, PNG, Text, HTML, CSV, JSON, XML, Markdown, EPUB, MOBI, SVG, WebP, TIFF, JFIF, PSD, IPYNB, Audio, OCR

**X to PDF** (23 tools)

- Convert to PDF from: Word, Excel, PPT, JPG, PNG, Text, HTML, CSV, JSON, XML, Markdown, EPUB, MOBI, SVG, WebP, TIFF, JFIF, DWG, RTF, IPYNB, Speech, Shreelipi, PNR

**PDF to X** (12 tools)

### Finance Calculators (36)

**Investment** (8 tools)

- SIP, Step-up SIP, Lumpsum, SWP, Mutual Fund Returns, Investment Returns, CAGR, APY

**Tax** (4 tools)

- Income Tax, GST, TDS, HRA

**Loans** (9 tools)

- EMI, Home Loan EMI, Car Loan EMI, Personal Loan, Loan Eligibility, Refinance, Home Equity, Reverse Mortgage, Flat vs Reducing Rate

**Savings** (7 tools)

- PPF, FD, RD, NPS, NSC, Sukanya Samriddhi Yojana, EPF

**Interest** (2 tools)

- Simple Interest, Compound Interest

**Other** (9 tools)

- Retirement, Gratuity, Salary, Inflation, Discount, Margin, Brokerage, Percentage, Tax

### Generators (8)

- QR Code Generator, Password Generator, Calendar Generator, Offer Letter Generator, Payroll Sheet Generator, Data Generator ✅, Name Generator, URL Shortener

### Text Tools (6)

- Case Converter, Find & Replace, Remove Extra Spaces, Reverse Text, Text to Slug, Word Counter

### Code Tools (4)

- JSON Formatter, XML Formatter, JS Minifier, CSS Minifier

### Calculators (7)

- Scientific Calculator, Simple Calculator, Age Calculator, BMI Calculator, Timesheet Calculator, PTO Calculator, Unit Converter

### Design Tools (1)

- Color Picker

## 🎨 Design System

### Colors

- **Primary**: Purple (#7c3aed)
- **Secondary**: Pink (#ec4899)
- **Accent**: Blue (#3b82f6)

### Components

- Gradient backgrounds
- Card-based layouts
- Smooth animations
- Hover effects
- Dark mode support

## 🚫 What's Been Removed

- ❌ Admin panel (admin_requests.php)
- ❌ SMTP/Email functionality
- ❌ Tool request system
- ❌ Subscriber management
- ❌ All "mozomint" references
- ❌ "KoraTools" branding

## 📊 Migration Status

### ✅ Completed

- [x] Project setup (Next.js 14, TypeScript, Tailwind CSS)
- [x] Database setup (Prisma + MySQL)
- [x] Rebranding to Toolverse
- [x] Homepage with all tools
- [x] 123 tool pages auto-generated
- [x] Data Generator (fully functional)
- [x] SEO metadata for all pages
- [x] Responsive design
- [x] Dark mode support

### 🚧 In Progress

Each tool page currently shows a placeholder. To complete migration:

1. Implement actual tool functionality
2. Add API routes where needed
3. Connect to third-party services (PDF processing, etc.)

### Priority Tools to Implement

1. Data Generator ✅ (Already done!)
2. Name Generator (AI-powered)
3. URL Shortener (Database-backed)
4. Password Generator
5. QR Code Generator

## 🌐 Deployment

Deploy to Vercel with one click:

```bash
# Build for production
npm run build

# The app is ready to deploy to Vercel, Netlify, or any Node.js hosting
```

### Environment Variables for Production

```env
DATABASE_URL=your_production_mysql_url
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_NAME=Toolverse
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 📝 License

This project is completely **free and open source**. Use it however you like!

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling
- Prisma for easy database management
- Google Gemini for AI capabilities

---

**Built with ❤️ using Next.js 14 + TypeScript + Tailwind CSS**

🌟 Star this repo if you find it useful!

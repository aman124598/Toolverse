# Toolverse - Your Universe of Free Online Tools

![Toolverse](https://img.shields.io/badge/Tools-70%2B-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Tech](https://img.shields.io/badge/Built%20With-Next.js%2014-black?style=for-the-badge)

## 🚀 Overview

**Toolverse** is a comprehensive suite of 70+ free online tools designed to simplify your daily digital tasks. From PDF manipulation and financial calculations to developer utilities and AI-powered generators, Toolverse offers a modern, fast, and privacy-focused experience without the need for signups or subscriptions.

## ✨ Key Features

- **100% Free & Open**: No hidden fees, premium plans, or paywalls.
- **Privacy First**: Tools run client-side where possible; no unnecessary data collection.
- **Modern Architecture**: Built with Next.js 14, TypeScript, and Tailwind CSS for peak performance.
- **Responsive Design**: optimized for seamless usage across desktop, tablet, and mobile devices.
- **Dark Mode**: Native support for light and dark themes for visual comfort.
- **SEO Optimized**: Fast loading times and optimized metadata for better discoverability.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: MySQL + [Prisma ORM](https://www.prisma.io/)
- **AI Integration**: Google Gemini API
- **Fonts**: Inter (via Google Fonts)

## 📦 Installation & Setup

Follow these steps to run Toolverse locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/toolverse.git
   cd toolverse
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following:

   ```env
   DATABASE_URL="your_mysql_connection_string"
   GEMINI_API_KEY="your_google_gemini_api_key"
   NEXT_PUBLIC_SITE_NAME="Toolverse"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. **Initialize Database**

   ```bash
   npx prisma generate
   # If you have migrations to apply:
   # npx prisma migrate dev
   ```

5. **Run Development Server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🧰 Available Tools Suite

Toolverse hosts a vast collection of tools organized into intuitive categories:

### 📄 PDF Tools (70+)

Everything you need for PDF management:

- **Core Operations**: Compress, Merge, Split, Rotate, Lock/Unlock.
- **Converters**: PDF to Word, Excel, Images, Text, HTML, and vice versa.
- **Utilities**: OCR, Metadata Editor, Watermark, and Page Numbering.

### 💰 Finance & Business (36+)

Calculators for personal and professional finance:

- **Investment**: SIP, Mutual Funds, CAGR, APY.
- **Loans**: EMI, Home Loan, Personal Loan, Eligibility.
- **Tax & Salary**: Income Tax, GST, HRA, Salary/Payroll.

### ⚡ Developer & Generators

Utilities for creators and developers:

- **Code**: JSON/XML Formatter, CSS/JS Minifier.
- **Generators**: QR Code, Secure Passwords, Dummy Data, Lorem Ipsum.
- **Text**: Case Converter, Slug Generator, Word Counter.

### 🔢 General Utilities

Everyday tools for everyone:

- **Calculators**: Scientific, BMI, Age, Date Difference.
- **Design**: Color Picker, Unit Converters.

## 📁 Project Structure

```
toolverse/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── [tool-slug]/  # Dynamic tool pages
│   │   └── api/          # Server-side API routes
│   ├── lib/              # Utilities, configs, and helpers
│   └── components/       # Reusable UI components
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Automation scripts
```

## 🤝 Contributing

Contributions are welcome! Whether it's adding a new tool, fixing a bug, or improving documentation, feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ using Next.js, TypeScript & Tailwind CSS</b>
</div>

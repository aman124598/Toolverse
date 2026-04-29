import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ToolStackProvider } from "@/context/ToolStackContext";
import { MyStackDrawer } from "@/components/MyStackDrawer";
import { AppDownloadPopup } from "@/components/AppDownloadPopup";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Toolverse - Free Online Tools",
    template: "%s | Toolverse",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  description:
    "70+ free online tools for PDFs, calculations, text formatting, and more. No signup required. No limits.",
  keywords: [
    "free online tools",
    "pdf tools",
    "calculators",
    "converters",
    "text tools",
    "code formatter",
    "no signup",
  ],
  authors: [{ name: "Toolverse" }],
  creator: "Toolverse",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Toolverse - Free Online Tools",
    description:
      "70+ free online tools for PDFs, calculations, text formatting, and more.",
    siteName: "Toolverse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse - Free Online Tools",
    description:
      "70+ free online tools for PDFs, calculations, text formatting, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-white bg-black">
        <ToolStackProvider>
          {children}
          <MyStackDrawer />
          <AppDownloadPopup />
        </ToolStackProvider>
        <Analytics />
      </body>
    </html>
  );
}

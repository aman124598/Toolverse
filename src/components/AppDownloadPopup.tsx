"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export function AppDownloadPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we are running in a native Capacitor app
    const isApp = Capacitor.isNativePlatform();

    // Check if user previously dismissed the popup
    const hasDismissed = localStorage.getItem("dismissedAppPopup");

    if (!isApp && !hasDismissed) {
      // Delay popup slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("dismissedAppPopup", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 overflow-hidden transition-all duration-300">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">Get the Toolverse App</h3>
          <p className="text-zinc-400 text-sm mt-1 mb-3">
            Experience all 70+ tools in a native app experience.
          </p>

          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-xs text-zinc-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="2" y1="2" x2="22" y2="22"></line>
                <path d="M8.5 8.5a5 5 0 0 1 7 0"></path>
                <path d="M5 5.5a10 10 0 0 1 14 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
              </svg>
              <span>Works offline</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-zinc-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Faster performance</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-zinc-300">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
              <span>No tracking, 100% private</span>
            </li>
          </ul>

          <div className="flex gap-2">
            <a
              href="https://github.com/aman124598/Toolverse/releases/latest/download/app-release.apk"
              className="flex-1 bg-white text-black text-center font-medium py-2 px-4 rounded-lg text-sm hover:bg-zinc-200 transition-colors"
              onClick={handleDismiss}
            >
              Download App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

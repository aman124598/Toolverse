'use client';

import { useToolStack } from '@/context/ToolStackContext';
import { getToolDetails } from '@/config/tools';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Mobile from '@/lib/mobileAdapters';

export function MyStackDrawer() {
  const { stack, isStackOpen, setStackOpen, removeFromStack } = useToolStack();
  const pathname = usePathname();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (pathname === '/') {
      const timeout = setTimeout(() => {
        void (async () => {
          if (!(await Mobile.storageGet('toolverse_drawer_reminder_v2'))) {
            console.log('Showing drawer reminder popup');
            setShowReminder(true);
          }
        })();
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowReminder(false);
    }
  }, [pathname]);

  const dismissReminder = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowReminder(false);
    void Mobile.storageSet('toolverse_drawer_reminder_v2', 'true');
  };

  return (
    <>
      {/* Floating Reminder Popup */}
      {showReminder && !isStackOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-72 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl text-white transform animate-bounce border border-white/20">
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-purple-500 rotate-45 border-b border-r border-white/20"></div>
          <button
            onClick={dismissReminder}
            className="absolute top-2 right-2 p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex gap-3 relative z-10">
            <div className="text-2xl mt-1 leading-none">✨</div>
            <div>
              <h4 className="font-semibold text-sm mb-1 text-white">Hey! Look here</h4>
              <p className="text-xs text-white/90 leading-relaxed mb-3">You can build your own customized tool bucket. Click here to view your personal stack!</p>
              <button
                onClick={() => { setStackOpen(true); dismissReminder(); }}
                className="text-xs font-semibold bg-white text-purple-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
              >
                Open Stack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { setStackOpen(true); dismissReminder(); }}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 hover:scale-105 transition-all group"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        {stack.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-pink-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            {stack.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {isStackOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setStackOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-black/90 backdrop-blur-xl border-l border-white/10 z-[70] transform transition-transform duration-300 ease-out flex flex-col shadow-2xl shadow-purple-500/10 ${isStackOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              My Tool Stack
            </h2>
            <p className="text-xs text-gray-400 mt-1">Quick access to your favorite tools</p>
          </div>
          <button
            onClick={() => setStackOpen(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {stack.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Your stack is empty</p>
                <p className="text-sm text-gray-400 max-w-[200px] mx-auto">Click the star icon on any tool page to add it here.</p>
              </div>
            </div>
          ) : (
            stack.map(slug => {
              const details = getToolDetails(slug);
              if (!details) return null;

              return (
                <div key={slug} className="group relative bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-xl p-3 flex items-center gap-4 transition-all hover:bg-white/10">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg shadow-inner ${details.gradient}`}>
                    {details.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{details.name}</h4>
                    <p className="text-xs text-gray-400 truncate">{details.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/${slug}`}
                      onClick={() => setStackOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-lg text-purple-400 hover:text-purple-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                    <button
                      onClick={() => removeFromStack(slug)}
                      className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {stack.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-black/40">
            <Link
              href="/tools"
              onClick={() => setStackOpen(false)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium flex justify-center items-center gap-2 transition-colors border border-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Find More Tools
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

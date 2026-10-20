'use client';

import React from 'react';
import { ArrowLeft, LogOut, ChevronLeft } from 'lucide-react';
import MantraLogo from '@/components/common/MantraLogo';
import { handleExit } from '@/mantra/navigation';

interface ActivityContainerProps {
  title: string;
  domain?: string;
  duration?: string;
  targetSkill?: string;
  points?: number;
  onBack: () => void;
  /** Optional handler when user clicks Back on subsequent steps */
  onBackStep?: () => void;
  /** Whether the current step is beyond step 1 */
  canGoBackStep?: boolean;
  /** Custom exit handler (defaults to handleExit with onBack fallback) */
  onExit?: () => void;
  children: React.ReactNode;
}

export default function ActivityContainer({
  title,
  domain,
  duration,
  targetSkill,
  points = 25,
  onBack,
  onBackStep,
  canGoBackStep = false,
  onExit,
  children
}: ActivityContainerProps) {
  const handleExitClick = () => {
    if (onExit) {
      onExit();
    } else {
      handleExit(onBack);
    }
  };

  const handleBackClick = () => {
    if (canGoBackStep && onBackStep) {
      onBackStep();
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Universal 3-Section Header: Left: Back | Center: KidMantra Logo | Right: Exit */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-3 items-center min-h-[40px] sm:min-h-[44px]">
          {/* LEFT: Back Navigation */}
          <div className="flex items-center justify-start min-w-0">
            <button
              type="button"
              onClick={handleBackClick}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-black text-slate-700 transition shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title={canGoBackStep ? 'Previous Step' : 'Back to Dashboard'}
            >
              {canGoBackStep ? (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Back</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs">Back</span>
                </>
              )}
            </button>
          </div>

          {/* CENTER: KidMantra Logo (Always strictly centered in grid column 2) */}
          <div className="flex items-center justify-center min-w-0">
            <button
              type="button"
              onClick={handleExitClick}
              title="KidMantra"
              className="cursor-pointer bg-transparent border-none p-0 inline-flex items-center justify-center"
            >
              <MantraLogo height={28} className="sm:h-[32px]" />
            </button>
          </div>

          {/* RIGHT: Exit Action */}
          <div className="flex items-center justify-end min-w-0">
            <button
              type="button"
              onClick={handleExitClick}
              className="inline-flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 hover:text-rose-800 text-xs font-black transition shadow-2xs active:scale-95 cursor-pointer shrink-0"
              title="Exit Activity"
            >
              <span className="text-[11px] sm:text-xs">Exit</span>
              <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Activity Canvas Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2.5 sm:p-5 md:p-6 min-w-0">
        {children}
      </main>
    </div>
  );
}

'use client';

import React from 'react';
import { useTherapeutic } from '@/context/TherapeuticContext';
import { Eye, Volume2, HelpCircle } from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const { accessibility, toggleAccessibility } = useTherapeutic();

  if (!accessibility.highContrast) return null;

  return (
    <div className="bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <Eye className="w-4 h-4" />
        <span>High-Contrast Accessibility Mode Enabled</span>
      </div>
      <button
        onClick={() => toggleAccessibility('highContrast')}
        className="underline text-xs cursor-pointer"
      >
        Disable High-Contrast
      </button>
    </div>
  );
};

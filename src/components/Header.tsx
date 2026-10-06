'use client';

import React from 'react';
import { useTherapeutic } from '@/context/TherapeuticContext';
import {
  Activity,
  Layers,
  Sliders,
  BarChart3,
  GitMerge,
  Sparkles,
  Eye,
  Mic,
  PenTool,
  HeartHandshake,
  Star,
  Zap
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, accessibility, toggleAccessibility } = useTherapeutic();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/90 border-b border-slate-200/80 px-4 md:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Header with Light Pastel Accent */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-300 via-purple-300 to-sky-300 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-3 bg-white border border-pink-100 rounded-2xl shadow-sm text-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-purple-600 to-sky-500 bg-clip-text text-transparent drop-shadow-sm">
                  MantraCare Kids
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full border border-pink-200 flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current text-pink-500" />
                  <span>Therapeutic Activities</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Reusable Care Pathways & Activity Engine</p>
            </div>
          </div>

          {/* Mobile High Contrast Toggle */}
          <div className="flex md:hidden items-center space-x-1.5">
            <button
              onClick={() => toggleAccessibility('highContrast')}
              className={`p-2 rounded-xl border text-xs transition ${
                accessibility.highContrast ? 'bg-amber-300 text-slate-900 border-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation with Light Pastel Buttons */}
        <nav className="flex items-center space-x-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full shadow-inner">
          {[
            { id: 'runner', label: 'Live Runner', icon: Zap, color: 'bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 text-white' },
            { id: 'catalog', label: 'Pathways Catalog', icon: Layers, color: 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-900 font-bold' },
            { id: 'registry', label: 'Activity Registry', icon: Sliders, color: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' },
            { id: 'analytics', label: 'Clinical Analytics', icon: BarChart3, color: 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 font-bold' },
            { id: 'architecture', label: 'Lifecycle Diagram', icon: GitMerge, color: 'bg-gradient-to-r from-sky-400 to-indigo-400 text-white' }
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${tab.color} shadow-md ring-2 ring-white`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Pastel Service Badges */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs font-semibold">
            <span className="text-slate-500 text-[11px]">Domains:</span>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold" title="Speech Therapy">
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>Speech</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 font-bold" title="Occupational Therapy">
              <PenTool className="w-3.5 h-3.5 text-sky-600" />
              <span>OT</span>
            </span>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 font-bold" title="ABA Special Needs">
              <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
              <span>ABA</span>
            </span>
          </div>

          <button
            onClick={() => toggleAccessibility('highContrast')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition transform hover:scale-105 cursor-pointer ${
              accessibility.highContrast
                ? 'bg-amber-300 text-slate-900 border-amber-400 shadow-md'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Contrast</span>
          </button>
        </div>
      </div>
    </header>
  );
};

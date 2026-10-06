'use client';

import React from 'react';
import { GitMerge, ArrowRight, Layers, Activity, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const steps = [
    { step: 1, name: 'PATHWAY', desc: 'Clinical Goal & Service Configuration' },
    { step: 2, name: 'DAY / STAGE', desc: 'Sequential Daily Therapeutic Progression' },
    { step: 3, name: 'ACTIVITY', desc: 'Pluggable Stable ID Definition & Config' },
    { step: 4, name: 'ATTEMPT', desc: 'Session Launch & State Machine Init' },
    { step: 5, name: 'USER INTERACTION', desc: 'Real-time Touch / Audio / Choice Event Log' },
    { step: 6, name: 'SUBMISSION', desc: 'Payload Packaging & Telemetry Dispatch' },
    { step: 7, name: 'VALIDATION', desc: 'Registry Evaluator & Artifact Generation' },
    { step: 8, name: 'COMPLETION', desc: 'Engagement Score & Feedback Output' },
    { step: 9, name: 'COMPLETION EVENT', desc: 'Telemetry Stream & Store Dispatch' },
    { step: 10, name: 'PATHWAY PROGRESS', desc: 'Recalculate % & Advance to NEXT ACTIVITY' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-xs font-black text-sky-600 uppercase tracking-wider">
          <GitMerge className="w-4 h-4" />
          <span>Platform Architectural Model</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">10-Step Therapeutic Activity Architecture</h2>
        <p className="text-xs text-slate-500 font-medium">
          The reusable execution lifecycle supporting Speech Therapy, Occupational Therapy, and ABA / Special Needs activities.
        </p>
      </div>

      {/* Flow Diagram Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((item, idx) => (
          <div
            key={item.step}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-pink-300 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 border border-pink-200 text-xs font-mono font-black flex items-center justify-center">
                  {item.step}
                </span>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-500 transition" />
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
              <p className="text-[11px] text-slate-600 leading-snug font-medium">{item.desc}</p>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400" style={{ width: `${item.step * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

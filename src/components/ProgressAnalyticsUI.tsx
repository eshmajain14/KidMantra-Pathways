'use client';

import React from 'react';
import { useTherapeutic } from '@/context/TherapeuticContext';
import {
  BarChart3,
  Award,
  Clock,
  FileAudio,
  FileCode,
  Activity,
  CheckCircle2,
  ListFilter,
  Sparkles,
  Layers,
  History
} from 'lucide-react';

export const ProgressAnalyticsUI: React.FC = () => {
  const { pathwayProgress, recentCompletions, allAttempts, activePathway } = useTherapeutic();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black text-amber-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Clinical Analytics & Telemetry Vault</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Patient Progress & Clinical Artifacts</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time telemetry event stream, attempt timeline, audio/motor artifacts, and skill mastery logs.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-amber-50 p-3.5 rounded-2xl border border-amber-200 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-bold">Total Practice Time</div>
            <div className="text-lg font-mono font-black text-amber-800">
              {pathwayProgress ? `${Math.round(pathwayProgress.total_time_spent_sec / 60)} mins` : '0 mins'}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Recent Completions */}
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Completed Sessions ({recentCompletions.length})</span>
          </span>

          <div className="space-y-3">
            {recentCompletions.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                No completions recorded yet. Run an activity session in the Live Runner!
              </div>
            ) : (
              recentCompletions.map((cmp) => (
                <div key={cmp.completion_id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-pink-700 uppercase bg-pink-50 px-2 py-0.5 rounded border border-pink-200 font-bold">
                      Activity: {cmp.activity_id}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-600">{cmp.score}% Score</span>
                  </div>
                  <div className="text-xs text-slate-700 font-bold">{cmp.validation_result.feedback_message}</div>
                  <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-2 font-medium">
                    <span>Duration: {cmp.duration_seconds}s</span>
                    <span>{new Date(cmp.completed_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Col: Clinical Artifacts Vault */}
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
            <FileAudio className="w-4 h-4 text-teal-600" />
            <span>Generated Clinical Artifacts</span>
          </span>

          <div className="space-y-3">
            {recentCompletions.flatMap((c) => c.validation_result.artifacts_generated).length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-medium">
                No clinical artifacts generated yet. Submit an activity attempt to generate audio/motor artifacts.
              </div>
            ) : (
              recentCompletions.flatMap((c) => c.validation_result.artifacts_generated).map((art) => (
                <div key={art.artifact_id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-700 border border-teal-200">
                      <FileAudio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{art.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">{art.type}</div>
                    </div>
                  </div>
                  <pre className="p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-emerald-800 overflow-x-auto border border-slate-200">
                    {JSON.stringify(art.metadata, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Telemetry Events Stream */}
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
            <History className="w-4 h-4 text-sky-600" />
            <span>Lifecycle Telemetry Log Stream</span>
          </span>

          <div className="p-4 bg-white rounded-3xl border border-slate-200 space-y-2 max-h-[460px] overflow-y-auto shadow-2xs">
            {allAttempts.flatMap((a) => a.events).length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium">
                No telemetry events logged yet.
              </div>
            ) : (
              allAttempts.flatMap((a) => a.events).map((evt) => (
                <div key={evt.event_id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-sky-700">{evt.event_type}</span>
                    <span className="text-[9px] text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Attempt: {evt.attempt_id.substring(0, 12)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

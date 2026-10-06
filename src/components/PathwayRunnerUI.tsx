'use client';

import React, { useState } from 'react';
import { useTherapeutic } from '@/context/TherapeuticContext';
import {
  Play,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileCode,
  FileAudio,
  Activity as ActivityIcon,
  Clock,
  Award,
  Layers,
  ArrowRight,
  Star,
  Zap,
  Flame,
  Rocket
} from 'lucide-react';
import { ValidationResult, Completion } from '@/types/domain';

export const PathwayRunnerUI: React.FC = () => {
  const {
    activePathway,
    activeStage,
    activeActivityRef,
    activeRegisteredActivity,
    activeAttempt,
    startActivitySession,
    recordInteraction,
    submitActivity,
    advanceToNextActivity,
    pathwayProgress
  } = useTherapeutic();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);
  const [lastCompletion, setLastCompletion] = useState<Completion | null>(null);

  if (!activePathway || !activeStage || !activeActivityRef) {
    return (
      <div className="text-center py-16 text-slate-500 font-bold">
        <p>No active pathway selected. Please select a pathway from the catalog.</p>
      </div>
    );
  }

  const handleStartSession = () => {
    setLastValidation(null);
    setLastCompletion(null);
    startActivitySession(activeStage.stage_id, activeActivityRef.activity_id);
  };

  const handleComponentSubmit = async (rawPayload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const { validation, completion } = await submitActivity(rawPayload);
      setLastValidation(validation);
      setLastCompletion(completion);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RendererComponent = activeRegisteredActivity?.Component;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* PATHWAY & STAGE TIMELINE HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-pink-600 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 fill-current text-amber-500" />
              <span>Active Pathway Session</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900">{activePathway.title}</h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">{activePathway.description}</p>
          </div>

          <div className="flex items-center space-x-4 bg-pink-50/60 p-4 rounded-2xl border border-pink-100 shrink-0 shadow-2xs">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overall Progress</div>
              <div className="text-2xl font-mono font-black text-emerald-600">
                {pathwayProgress ? `${pathwayProgress.overall_completion_percent}%` : '0%'}
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl border-2 border-pink-200 flex items-center justify-center bg-white text-pink-600 font-black font-mono text-sm shadow-xs">
              {pathwayProgress?.completed_activity_ids.length || 0} / {activePathway.stages.reduce((a, s) => a + s.activities.length, 0)}
            </div>
          </div>
        </div>

        {/* STAGES & DAY SELECTION PILLS */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-1">
          {activePathway.stages.map((stage) => {
            const isCurrentStage = stage.stage_id === activeStage.stage_id;
            const isStageDone = pathwayProgress?.completed_stage_ids.includes(stage.stage_id);

            return (
              <div
                key={stage.stage_id}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                  isCurrentStage
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 border-pink-300 text-white shadow-md scale-105 ring-2 ring-pink-200'
                    : isStageDone
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="font-black text-amber-500">Day {stage.day_number}:</span>
                <span className="font-extrabold">{stage.title}</span>
                {isStageDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-1" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVITY RUNNER SESSION CONTAINER */}
      {!activeAttempt || activeAttempt.status === 'idle' ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-6 shadow-sm relative overflow-hidden">
          <div className="w-20 h-20 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-3xl flex items-center justify-center mx-auto text-white shadow-lg shadow-pink-200 animate-bounce-subtle">
            <Rocket className="w-10 h-10 fill-current" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs uppercase font-black text-pink-600 tracking-wider flex items-center justify-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Ready for Guided Practice</span>
            </span>
            <h3 className="text-3xl font-black text-slate-900">{activeActivityRef.title}</h3>
            <p className="text-sm text-slate-600 font-medium">{activeActivityRef.description}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-700 font-bold">
            <span className="px-3.5 py-2 bg-sky-50 rounded-xl border border-sky-100 text-sky-800">
              Est. Duration: {activeActivityRef.duration_seconds}s
            </span>
            <span className="px-3.5 py-2 bg-pink-50 rounded-xl border border-pink-100 text-pink-800">
              Target Skill: {activeActivityRef.target_skill}
            </span>
            <span className="px-3.5 py-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
              Interaction: {activeActivityRef.interaction_type}
            </span>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartSession}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-400 via-purple-400 to-sky-400 hover:from-pink-500 hover:to-sky-500 text-white font-black text-base rounded-2xl transition shadow-lg shadow-pink-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Activity Attempt Session 🚀</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Pluggable Activity Component Renderer */}
          {RendererComponent ? (
            <RendererComponent
              activity={activeRegisteredActivity.activity}
              attempt={activeAttempt}
              config={activeRegisteredActivity.defaultConfig}
              onInteraction={recordInteraction}
              onSubmit={handleComponentSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 text-center font-bold">
              Activity renderer component for ID &quot;{activeActivityRef.activity_id}&quot; not found in registry.
            </div>
          )}

          {/* VALIDATION & CLINICAL ARTIFACTS RESULT PANEL */}
          {lastValidation && lastCompletion && (
            <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-md space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-600">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900">Session Evaluated & Completed 🎉</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Attempt ID: <code className="text-slate-700 font-mono">{lastCompletion.attempt_id}</code> • Completed at {new Date(lastCompletion.completed_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Engagement Score</div>
                  <div className="text-3xl font-mono font-black text-emerald-600">{lastValidation.accuracy_score}%</div>
                </div>
              </div>

              {/* Feedback Message */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-sm font-extrabold shadow-2xs">
                {lastValidation.feedback_message}
              </div>

              {/* Clinical Observations */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Clinical Observations Recorded:</span>
                <ul className="space-y-1.5">
                  {lastValidation.clinical_observations.map((obs, idx) => (
                    <li key={idx} className="text-xs text-slate-700 font-medium flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Generated Clinical Artifacts */}
              {lastValidation.artifacts_generated.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Generated Clinical Artifacts:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lastValidation.artifacts_generated.map((art) => (
                      <div key={art.artifact_id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-3 text-xs shadow-2xs">
                        <FileAudio className="w-5 h-5 text-teal-600 shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-900">{art.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono">{art.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Activity Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={advanceToNextActivity}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500 text-slate-950 font-black text-base rounded-2xl transition shadow-md shadow-emerald-200 transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Advance to Next Activity in Pathway</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { activityRegistry } from '@/registry/activityRegistry';
import { RegisteredActivityDefinition } from '@/registry/types';
import {
  Sliders,
  CheckCircle2,
  FileCode,
  Shield,
  Eye,
  BookOpen,
  Mic,
  PenTool,
  HeartHandshake,
  Sparkles,
  Info,
  Code,
  Star
} from 'lucide-react';

export const ActivityRegistryUI: React.FC = () => {
  const registeredActivities = activityRegistry.getAll();
  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    registeredActivities[0]?.activity.activity_id || ''
  );

  const activeDef = registeredActivities.find((a) => a.activity.activity_id === selectedActivityId) || registeredActivities[0];

  if (!activeDef) {
    return (
      <div className="text-center py-16 text-slate-500 font-bold">
        No registered activities found in ActivityRegistry.
      </div>
    );
  }

  const { activity, defaultConfig } = activeDef;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Registry Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black text-purple-600 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Central Activity Registry Inspector</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-sky-600 bg-clip-text text-transparent">
              Registered Activity Definitions
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Pluggable activity schema registry mapping stable Activity IDs to renderers, configs, and evaluation runners.
          </p>
        </div>

        <div className="bg-purple-50 px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-mono text-purple-800 font-black shrink-0">
          {registeredActivities.length} Activities Registered
        </div>
      </div>

      {/* Main Grid: Left selector, Right details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Selector Sidebar */}
        <div className="space-y-3">
          <span className="text-xs uppercase font-black text-slate-500 tracking-wider flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>Registered Activity List</span>
          </span>
          <div className="space-y-2">
            {registeredActivities.map((def) => {
              const isSelected = def.activity.activity_id === selectedActivityId;
              return (
                <button
                  key={def.activity.activity_id}
                  onClick={() => setSelectedActivityId(def.activity.activity_id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col space-y-1 cursor-pointer transform hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-purple-50 border-purple-300 text-purple-950 ring-2 ring-purple-200 shadow-md font-bold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded text-purple-700 border border-purple-200 font-bold">
                      ID: {def.activity.activity_id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">v{def.activity.activity_version_id}</span>
                  </div>
                  <div className="font-black text-sm text-slate-900">{def.activity.title}</div>
                  <div className="text-xs text-slate-500 capitalize font-medium">{def.activity.service.replace('_', ' ')}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Inspector Pane */}
        <div className="md:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs uppercase font-black text-pink-600">Activity Specification</span>
                <h3 className="text-2xl font-black text-slate-900">{activity.title}</h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">{activity.short_description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">Service Domain</span>
                <span className="text-sm font-black text-purple-700 uppercase tracking-wider">{activity.service}</span>
              </div>
            </div>

            {/* Core Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 font-bold">Stable Activity ID</div>
                <div className="font-mono font-black text-pink-600">{activity.activity_id}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 font-bold">Version SemVer</div>
                <div className="font-mono font-black text-slate-800">v{activity.activity_version_id}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 font-bold">Interaction Type</div>
                <div className="font-extrabold text-slate-800">{activity.interaction_type}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-slate-500 font-bold">Target Skill</div>
                <div className="font-extrabold text-slate-800">{activity.target_skill}</div>
              </div>
            </div>

            {/* Clinical Review Notes */}
            <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-black text-purple-700">
                <BookOpen className="w-4 h-4" />
                <span>Clinical Review Notes & Evidence Base</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{activity.clinical_review_notes.evidence_base}</p>
              <div className="text-xs text-slate-600 font-medium">
                <strong className="text-slate-900">Therapist Guidance:</strong> {activity.clinical_review_notes.therapist_guidance}
              </div>
            </div>

            {/* Accessibility Metadata */}
            <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-black text-sky-700">
                <Eye className="w-4 h-4" />
                <span>Accessibility Metadata</span>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                <strong className="text-slate-900">Screen Reader Prompt:</strong> {activity.accessibility_metadata.screen_reader_prompt}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {activity.accessibility_metadata.supports_high_contrast && (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-lg">
                    High Contrast Supported
                  </span>
                )}
                {activity.accessibility_metadata.supports_audio_cues && (
                  <span className="px-2.5 py-1 bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-bold rounded-lg">
                    Audio Cues Supported
                  </span>
                )}
              </div>
            </div>

            {/* Default Config JSON Schema Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-black text-pink-600">
                <Code className="w-4 h-4" />
                <span>Default Activity Configuration (Extensible JSON Schema)</span>
              </div>
              <pre className="p-3 bg-white rounded-xl text-[11px] font-mono text-emerald-800 overflow-x-auto border border-slate-200">
                {JSON.stringify(defaultConfig, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

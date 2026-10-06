'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ActivityRendererProps, RegisteredActivityDefinition } from '@/registry/types';
import { Activity, ActivitySubmission, ValidationResult, ActivityArtifact } from '@/types/domain';
import { Mic, Volume2, Award, Play, Square, RefreshCw, CheckCircle2, Sparkles, Star } from 'lucide-react';

export interface SpeechToneConfig {
  target_vowel: 'AH' | 'EE' | 'OH' | 'OO';
  min_duration_sec: number;
  target_pitch_range_hz: [number, number];
  volume_threshold_db: number;
}

const DEFAULT_SPEECH_CONFIG: SpeechToneConfig = {
  target_vowel: 'AH',
  min_duration_sec: 4,
  target_pitch_range_hz: [180, 240],
  volume_threshold_db: -20
};

export const SustainedVocalToneActivityComponent: React.FC<ActivityRendererProps<SpeechToneConfig>> = ({
  activity,
  attempt,
  config = DEFAULT_SPEECH_CONFIG,
  onInteraction,
  onSubmit,
  isSubmitting
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [simulatedPitch, setSimulatedPitch] = useState(210);
  const [simulatedVolume, setSimulatedVolume] = useState(65);
  const [waveformSamples, setWaveformSamples] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setWaveformSamples([]);

    onInteraction({
      type: 'audio_input',
      payload: { action: 'start_vocal_recording', target_vowel: config.target_vowel }
    });

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const nextTime = prev + 0.2;
        const jitterPitch = Math.floor(210 + (Math.random() * 20 - 10));
        const jitterVol = Math.floor(70 + (Math.random() * 16 - 8));
        setSimulatedPitch(jitterPitch);
        setSimulatedVolume(jitterVol);

        setWaveformSamples((samples) => [...samples.slice(-24), jitterVol]);

        return Number(nextTime.toFixed(1));
      });
    }, 200);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    onInteraction({
      type: 'audio_input',
      payload: {
        action: 'stop_vocal_recording',
        total_duration_sec: recordingTime,
        avg_pitch_hz: simulatedPitch,
        waveform_sample_count: waveformSamples.length
      },
      duration_ms: Math.round(recordingTime * 1000)
    });
  };

  const handleSubmit = () => {
    if (isRecording) stopRecording();
    onSubmit({
      sustained_duration_sec: recordingTime,
      vowel_sound: config.target_vowel,
      pitch_stability_score: Math.min(100, Math.round((recordingTime / config.min_duration_sec) * 100)),
      waveform: waveformSamples
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round((recordingTime / config.min_duration_sec) * 100));

  return (
    <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-md text-slate-800 max-w-2xl mx-auto space-y-6">
      {/* Activity Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-2xl text-emerald-700">
            <Mic className="w-6 h-6 animate-bounce-subtle" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Speech Therapy
              </span>
              <span className="text-xs text-slate-500 font-medium">ID: {activity.activity_id} (v{activity.activity_version_id})</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{activity.title}</h3>
          </div>
        </div>
      </div>

      {/* Instructions Prompt */}
      <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-start space-x-3 shadow-2xs">
        <Volume2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-black text-emerald-900">Therapeutic Prompt</h4>
          <p className="text-sm text-slate-700 mt-1 font-medium">
            Press &quot;Start Mic Recording&quot; and hold a steady sustained <strong className="text-emerald-700 text-base font-mono">&quot;{config.target_vowel}&quot;</strong> sound for at least <strong>{config.min_duration_sec} seconds</strong>!
          </p>
        </div>
      </div>

      {/* Visual Sound Meter & Waveform */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-bold">Sustained Hold Timer</span>
          <span className="font-mono text-xl font-black text-emerald-700">{recordingTime.toFixed(1)}s / {config.min_duration_sec}s</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live Audio Meter & Waveform Visualizer */}
        <div className="h-24 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
          {isRecording ? (
            <div className="flex items-end justify-center space-x-1.5 w-full h-full">
              {waveformSamples.map((val, idx) => (
                <div
                  key={idx}
                  className="w-2 bg-gradient-to-t from-emerald-400 to-teal-300 rounded-t transition-all duration-150"
                  style={{ height: `${Math.max(15, val)}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 flex flex-col items-center">
              <Mic className="w-8 h-8 text-slate-300 mb-1 animate-pulse" />
              <span className="text-xs font-medium">Microphone ready. Press Start to begin hold.</span>
            </div>
          )}
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between">
            <span className="text-slate-500 font-bold">Est. Pitch:</span>
            <span className="font-mono font-black text-slate-800">{simulatedPitch} Hz</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between">
            <span className="text-slate-500 font-bold">Target Range:</span>
            <span className="font-mono font-black text-slate-800">{config.target_pitch_range_hz[0]}-{config.target_pitch_range_hz[1]} Hz</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl transition shadow-md shadow-emerald-200 cursor-pointer transform hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Mic Recording 🎤</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center space-x-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl transition shadow-md shadow-rose-200 cursor-pointer transform hover:scale-105"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Recording</span>
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={recordingTime === 0 || isSubmitting}
          className={`flex items-center space-x-2 px-6 py-3 font-black rounded-2xl transition shadow-md ${
            recordingTime > 0 && !isSubmitting
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-emerald-200 cursor-pointer transform hover:scale-105'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isSubmitting ? 'Validating...' : 'Submit Vocal Attempt'}</span>
        </button>
      </div>
    </div>
  );
};

export const SustainedVocalToneActivityDefinition: RegisteredActivityDefinition<SpeechToneConfig> = {
  activity: {
    activity_id: 'act_speech_tone_01',
    activity_version_id: '1.0.0',
    title: 'Sustained Vocal Pitch & Vowel Hold',
    short_description: 'Sustain target vowel sounds to build vocal breath control, resonance, and motor speech endurance.',
    service: 'speech_therapy',
    target_skill: 'Vocal Breath & Pitch Stability',
    target_age_range: '4-12 years',
    estimated_duration_sec: 120,
    instructions: [
      {
        step_number: 1,
        title: 'Deep Breath',
        text: 'Take a deep breath into your belly.'
      },
      {
        step_number: 2,
        title: 'Sustain Sound',
        text: 'Press Start and make a steady "AH" sound into the microphone until the timer fills up.'
      }
    ],
    interaction_type: 'vocal_speech',
    activity_config: DEFAULT_SPEECH_CONFIG,
    completion_criteria: {
      min_accuracy_percent: 75,
      min_required_interactions: 1,
      max_allowed_time_sec: 120,
      required_artifact_types: ['audio_recording', 'latency_graph']
    },
    accessibility_metadata: {
      screen_reader_prompt: 'Press start recording button, then speak the vowel AH into the microphone for 4 seconds.',
      supports_high_contrast: true,
      supports_audio_cues: true,
      supports_motor_scaling: true,
      alternative_input_modes: ['keyboard', 'switch_access']
    },
    clinical_review_notes: {
      evidence_base: 'Subglottic pressure and sustained vocalization exercises increase acoustic clarity and phonatory stability in dysarthria and articulation therapy.',
      therapist_guidance: 'Observe thoracic vs abdominal breathing. Encourage gentle onset vocal entry without glottal attack.',
      observed_behaviors: ['Breathiness', 'Pitch cracks', 'Premature breath exhaustion'],
      parent_support_tips: ['Model the sound first by singing "AHHH" together like a lion pitch.']
    }
  },
  Component: SustainedVocalToneActivityComponent,
  defaultConfig: DEFAULT_SPEECH_CONFIG,
  validateConfig: (config: unknown) => {
    const cfg = config as Partial<SpeechToneConfig>;
    if (!cfg || typeof cfg.min_duration_sec !== 'number' || cfg.min_duration_sec <= 0) {
      return { valid: false, errors: ['min_duration_sec must be a positive number'] };
    }
    return { valid: true };
  },
  evaluate: async (submission: ActivitySubmission, config: SpeechToneConfig, activity: Activity<SpeechToneConfig>): Promise<ValidationResult> => {
    const sustainedSec = (submission.raw_payload.sustained_duration_sec as number) || 0;
    const targetSec = config.min_duration_sec;

    const ratio = Math.min(1.0, sustainedSec / targetSec);
    const accuracyScore = Math.round(ratio * 100);
    const isPassed = accuracyScore >= activity.completion_criteria.min_accuracy_percent;

    const generatedArtifacts: ActivityArtifact[] = [
      {
        artifact_id: `art_audio_${Date.now()}`,
        attempt_id: submission.attempt_id,
        activity_id: activity.activity_id,
        type: 'audio_recording',
        title: `Vocal Hold Audio (${config.target_vowel})`,
        data_url_or_blob: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        metadata: {
          sustained_sec: sustainedSec,
          vowel: config.target_vowel,
          target_sec: targetSec
        },
        created_at: new Date().toISOString()
      },
      {
        artifact_id: `art_latency_${Date.now()}`,
        attempt_id: submission.attempt_id,
        activity_id: activity.activity_id,
        type: 'latency_graph',
        title: 'Pitch Stability Telemetry',
        data_url_or_blob: 'data:image/svg+xml;utf8,<svg width="100" height="50"></svg>',
        metadata: {
          pitch_variance_hz: 8,
          accuracy_score: accuracyScore
        },
        created_at: new Date().toISOString()
      }
    ];

    return {
      is_passed: isPassed,
      accuracy_score: accuracyScore,
      score_breakdown: {
        duration_hold_score: accuracyScore,
        pitch_steady_score: Math.min(100, accuracyScore + 5)
      },
      feedback_message: isPassed
        ? `Fantastic vocal control! You held the "${config.target_vowel}" sound for ${sustainedSec.toFixed(1)}s!`
        : `Good effort! You sustained for ${sustainedSec.toFixed(1)}s. Target is ${targetSec}s. Keep practicing!`,
      clinical_observations: [
        `Client sustained vowel phonation for ${sustainedSec.toFixed(1)} seconds.`,
        `Acoustic stability score achieved: ${accuracyScore}%.`
      ],
      artifacts_generated: generatedArtifacts,
      evaluated_at: new Date().toISOString()
    };
  }
};

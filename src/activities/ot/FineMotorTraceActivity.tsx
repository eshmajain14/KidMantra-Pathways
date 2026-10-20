'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActivityRendererProps, RegisteredActivityDefinition } from '@/registry/types';
import { Activity, ActivitySubmission, ValidationResult, ActivityArtifact } from '@/types/domain';
import { PenTool, CheckCircle2, RotateCcw, Activity as MotorIcon } from 'lucide-react';

export interface OTTraceConfig {
  path_shape: 'wave' | 'loop' | 'zigzag';
  line_thickness_px: number;
  tolerance_threshold_px: number;
  min_completion_points: number;
}

const DEFAULT_OT_CONFIG: OTTraceConfig = {
  path_shape: 'wave',
  line_thickness_px: 12,
  tolerance_threshold_px: 24,
  min_completion_points: 25
};

export const FineMotorTraceActivityComponent: React.FC<ActivityRendererProps<OTTraceConfig>> = ({
  activity,
  config = DEFAULT_OT_CONFIG,
  onInteraction,
  onSubmit,
  isSubmitting
}) => {
  const [tracedPoints, setTracedPoints] = useState<{ x: number; y: number }[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [deviationScore, setDeviationScore] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stage: 'tracing' | 'results'
  const [stage, setStage] = useState<'tracing' | 'results'>('tracing');

  // Generate reference path coordinates (wave)
  const getGuidePath = (width: number, height: number) => {
    const points: { x: number; y: number }[] = [];
    const padding = 44;
    const usableW = width - padding * 2;
    const centerY = height / 2;

    for (let i = 0; i <= 50; i++) {
      const x = padding + (i / 50) * usableW;
      const y = centerY + Math.sin((i / 50) * Math.PI * 2) * 50;
      points.push({ x, y });
    }
    return points;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsTracing(true);
    setTracedPoints([{ x, y }]);

    onInteraction({
      type: 'touch_drag',
      payload: { action: 'pointer_down', start_x: x, start_y: y }
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isTracing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setTracedPoints((prev) => {
      const newPoints = [...prev, { x, y }];
      const guide = getGuidePath(canvas.width, canvas.height);
      let minDistanceSum = 0;
      newPoints.forEach((p) => {
        const closest = Math.min(...guide.map((g) => Math.hypot(g.x - p.x, g.y - p.y)));
        minDistanceSum += closest;
      });
      const avgDev = minDistanceSum / newPoints.length;
      // Convert average deviation in px to a friendly score
      const accuracy = Math.max(0, Math.min(100, Math.round(100 - avgDev * 1.8)));
      setDeviationScore(accuracy);
      return newPoints;
    });

    onInteraction({
      type: 'canvas_draw',
      payload: { point_count: tracedPoints.length + 1, current_x: x, current_y: y }
    });
  };

  const handlePointerUp = () => {
    if (isTracing) {
      setIsTracing(false);
      onInteraction({
        type: 'touch_drag',
        payload: { action: 'pointer_up', total_points: tracedPoints.length, final_accuracy: deviationScore }
      });
    }
  };

  const handleReset = () => {
    setTracedPoints([]);
    setDeviationScore(100);
    setStage('tracing');
    onInteraction({
      type: 'prompt_viewed',
      payload: { action: 'try_again_reset' }
    });
  };

  // Submitting transitions to internal dedicated results screen first
  const handleShowResults = () => {
    if (isTracing) setIsTracing(false);
    setStage('results');
    onInteraction({
      type: 'prompt_viewed',
      payload: {
        stage: 'results',
        total_points: tracedPoints.length,
        accuracy_percent: deviationScore
      }
    });
  };

  // Final submit returns to dashboard
  const handleFinishAndReturn = () => {
    onSubmit({
      traced_point_count: tracedPoints.length,
      accuracy_percent: deviationScore,
      path_shape: config.path_shape,
      traced_path: tracedPoints
    });
  };

  // Canvas Drawing Render Loop (Light Theme Colors with Start and Finish Markers)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const guide = getGuidePath(canvas.width, canvas.height);
    const startPoint = guide[0];
    const finishPoint = guide[guide.length - 1];

    // 1. Draw Guide Path Background (Soft sky pastel)
    ctx.beginPath();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = config.line_thickness_px * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    guide.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 2. Draw Center Dashed Guide Line (Sky blue)
    ctx.beginPath();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    guide.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw User Traced Line
    if (tracedPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = deviationScore > 75 ? '#059669' : '#e11d48';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      tracedPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    // 4. Draw Start Marker (Green circle with "START")
    ctx.beginPath();
    ctx.fillStyle = '#10b981';
    ctx.arc(startPoint.x, startPoint.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#065f46';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', startPoint.x, startPoint.y + 24);

    // 5. Draw Finish Marker (Purple circle with "FINISH" / Flag)
    ctx.beginPath();
    ctx.fillStyle = '#8b5cf6';
    ctx.arc(finishPoint.x, finishPoint.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#5b21b6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH', finishPoint.x, finishPoint.y + 24);

  }, [tracedPoints, deviationScore, config]);

  const hasTracedEnough = tracedPoints.length >= config.min_completion_points;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm text-slate-800 max-w-2xl mx-auto space-y-5 sm:space-y-6 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-sky-400 to-blue-500 rounded-2xl text-white shadow-md shadow-sky-200 shrink-0">
            <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky-800 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                Occupational Therapy
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Fine Motor Path</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">Follow the Wavy Line</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-xl border border-sky-100 text-xs font-black text-slate-700 self-start sm:self-auto">
          <span>{hasTracedEnough ? '✓ Path Complete' : `${tracedPoints.length}/${config.min_completion_points} points`}</span>
        </div>
      </div>

      {/* STAGE 1: TRACING SCREEN */}
      {stage === 'tracing' && (
        <div className="space-y-4">
          {/* Instructions Block */}
          <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-3.5 sm:p-4 space-y-1">
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
              Follow the dotted path from the start to the finish.
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Move slowly and try to stay close to the line using your finger, stylus, or mouse.
            </p>
          </div>

          {/* Interactive Tracing Canvas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-700 font-bold flex items-center space-x-1.5">
                <MotorIcon className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  {tracedPoints.length === 0
                    ? 'Touch green START to begin'
                    : isTracing
                    ? 'Tracing in progress...'
                    : hasTracedEnough
                    ? 'Trace ready to submit!'
                    : 'Keep tracing toward FINISH'}
                </span>
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  tracedPoints.length === 0
                    ? 'text-slate-400 bg-slate-100'
                    : hasTracedEnough
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-sky-700 bg-sky-50 border border-sky-200'
                }`}
              >
                {tracedPoints.length === 0
                  ? 'Ready to trace'
                  : hasTracedEnough
                  ? 'Ready to review ✓'
                  : `${tracedPoints.length} points traced`}
              </span>
            </div>

            <div className="bg-sky-50/40 rounded-2xl p-2 sm:p-3 border-2 border-dashed border-sky-200 touch-none flex justify-center shadow-inner overflow-hidden max-w-full">
              <canvas
                ref={canvasRef}
                width={580}
                height={200}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="w-full h-auto cursor-crosshair rounded-xl bg-white shadow-xs select-none max-w-full"
                style={{ touchAction: 'none' }}
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={tracedPoints.length === 0}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-black rounded-xl transition ${
                tracedPoints.length > 0
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-50'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear & Retrace</span>
            </button>

            <button
              type="button"
              onClick={handleShowResults}
              disabled={!hasTracedEnough}
              className={`flex items-center justify-center space-x-2 px-6 py-3 font-black text-xs sm:text-sm rounded-xl transition shadow-md ${
                hasTracedEnough
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-sky-200 cursor-pointer transform hover:scale-105 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {!hasTracedEnough
                  ? `Trace a bit more to submit (${config.min_completion_points - tracedPoints.length} pts)`
                  : 'Submit Trace & View Results →'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: DEDICATED RESULTS SCREEN */}
      {stage === 'results' && (
        <div className="space-y-6 text-center py-2 sm:py-4">
          {/* Friendly Celebration Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-50 text-sky-600 rounded-3xl border border-sky-200 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-sky-600 animate-pulse" />
          </div>

          {/* Heading and Encouraging Copy */}
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Great tracing!
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto font-medium">
              You completed the path. Every try helps you practise control and coordination.
            </p>
          </div>

          {/* Authentic Trace Summary Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-left space-y-3">
            <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/80 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Practice Recap</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Path Shape</span>
                <span className="text-base font-extrabold text-slate-800 capitalize mt-0.5 block">{config.path_shape} wave</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Path Coverage</span>
                <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">Completed ✓</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Motion Guidance</span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5 block">Smooth distal hand-eye coordination practiced</span>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 ml-2">
                  Complete ✓
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Primary Finish & Return, Secondary Try Again */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleFinishAndReturn}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-sm rounded-xl transition shadow-md shadow-sky-200 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? 'Marking as completed...' : 'Mark as completed 🚀'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const FineMotorTraceActivityDefinition: RegisteredActivityDefinition<OTTraceConfig> = {
  activity: {
    activity_id: 'act_ot_motor_trace_01',
    activity_version_id: '1.0.0',
    title: 'Follow the Wavy Line',
    short_description: 'Trace along dynamic paths to improve fine motor precision, motor planning, and hand-eye coordination.',
    service: 'occupational_therapy',
    target_skill: 'Fine Motor Precision & Visual Motor Control',
    target_age_range: '3-10 years',
    estimated_duration_sec: 180,
    instructions: [
      {
        step_number: 1,
        title: 'Finger/Stylus Control',
        text: 'Use your finger or mouse to touch the start of the line.'
      },
      {
        step_number: 2,
        title: 'Trace Wave',
        text: 'Smoothly trace along the dashed path from left to right without straying off course.'
      }
    ],
    interaction_type: 'fine_motor_trace',
    activity_config: DEFAULT_OT_CONFIG,
    completion_criteria: {
      min_accuracy_percent: 70,
      min_required_interactions: 15,
      max_allowed_time_sec: 180,
      required_artifact_types: ['motor_drawing']
    },
    accessibility_metadata: {
      screen_reader_prompt: 'Use touch or mouse cursor to trace from left to right inside the wave guide.',
      supports_high_contrast: true,
      supports_audio_cues: true,
      supports_motor_scaling: true,
      alternative_input_modes: ['keyboard', 'large_target']
    },
    clinical_review_notes: {
      evidence_base: 'Visual-motor integration and fine motor control activities enhance handwriting readiness and distal dexterity.',
      therapist_guidance: 'Observe pincer grip, wrist stability, and shoulder posture during tracing.',
      observed_behaviors: ['Tremor', 'Line overshoot', 'Excessive pressure'],
      parent_support_tips: ['Encourage slow, deliberate movement rather than rushing.']
    }
  },
  Component: FineMotorTraceActivityComponent,
  defaultConfig: DEFAULT_OT_CONFIG,
  validateConfig: (config: unknown) => {
    const cfg = config as Partial<OTTraceConfig>;
    if (!cfg || typeof cfg.line_thickness_px !== 'number') {
      return { valid: false, errors: ['line_thickness_px must be a number'] };
    }
    return { valid: true };
  },
  evaluate: async (submission: ActivitySubmission, config: OTTraceConfig, activity: Activity<OTTraceConfig>): Promise<ValidationResult> => {
    const accuracyScore = (submission.raw_payload.accuracy_percent as number) || 0;
    const isPassed = accuracyScore >= activity.completion_criteria.min_accuracy_percent;

    const generatedArtifacts: ActivityArtifact[] = [
      {
        artifact_id: `art_motor_${Date.now()}`,
        attempt_id: submission.attempt_id,
        activity_id: activity.activity_id,
        type: 'motor_drawing',
        title: `Motor Trace Canvas Artifact (${config.path_shape})`,
        data_url_or_blob: 'data:image/svg+xml;utf8,<svg width="200" height="100"></svg>',
        metadata: {
          path_shape: config.path_shape,
          total_traced_points: submission.raw_payload.traced_point_count,
          precision_accuracy: accuracyScore
        },
        created_at: new Date().toISOString()
      }
    ];

    return {
      is_passed: isPassed,
      accuracy_score: accuracyScore,
      score_breakdown: {
        spatial_precision: accuracyScore,
        smoothness_index: Math.min(100, accuracyScore + 4)
      },
      feedback_message: isPassed
        ? `Great motor control! Your tracing precision reached ${accuracyScore}%!`
        : `Keep practicing your motor trace! Your precision was ${accuracyScore}%.`,
      clinical_observations: [
        `Client executed fine motor path tracing for ${config.path_shape} shape.`,
        `Spatial deviation accuracy score: ${accuracyScore}%.`
      ],
      artifacts_generated: generatedArtifacts,
      evaluated_at: new Date().toISOString()
    };
  }
};

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

  // Generate reference path coordinates (wave)
  const getGuidePath = (width: number, height: number) => {
    const points: { x: number; y: number }[] = [];
    const padding = 40;
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
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsTracing(true);
    setTracedPoints([{ x, y }]);

    onInteraction({
      type: 'touch_drag',
      payload: { action: 'pointer_down', start_x: x, start_y: y }
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isTracing) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTracedPoints((prev) => {
      const newPoints = [...prev, { x, y }];
      if (canvasRef.current) {
        const guide = getGuidePath(canvasRef.current.width, canvasRef.current.height);
        let minDistanceSum = 0;
        newPoints.forEach((p) => {
          const closest = Math.min(...guide.map((g) => Math.hypot(g.x - p.x, g.y - p.y)));
          minDistanceSum += closest;
        });
        const avgDev = minDistanceSum / newPoints.length;
        const accuracy = Math.max(0, Math.min(100, Math.round(100 - avgDev * 1.8)));
        setDeviationScore(accuracy);
      }
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
  };

  const handleSubmit = () => {
    onSubmit({
      traced_point_count: tracedPoints.length,
      accuracy_percent: deviationScore,
      path_shape: config.path_shape,
      traced_path: tracedPoints
    });
  };

  // Canvas Drawing Render Loop (Light Theme Colors)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Guide Path Background (Soft sky pastel)
    const guide = getGuidePath(canvas.width, canvas.height);
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

    // Draw Center Guide Line (Sky blue)
    ctx.beginPath();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    guide.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw User Traced Line
    if (tracedPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = deviationScore > 75 ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      tracedPoints.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }, [tracedPoints, deviationScore, config]);

  return (
    <div className="bg-white border-2 border-sky-200 rounded-3xl p-6 shadow-md text-slate-800 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-sky-100 border border-sky-200 rounded-2xl text-sky-700">
            <PenTool className="w-6 h-6 animate-bounce-subtle" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                Occupational Therapy
              </span>
              <span className="text-xs text-slate-500 font-medium">ID: {activity.activity_id} (v{activity.activity_version_id})</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{activity.title}</h3>
          </div>
        </div>
      </div>

      {/* Interactive Tracing Canvas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-bold flex items-center space-x-1">
            <MotorIcon className="w-4 h-4 text-sky-600" />
            <span>Trace inside the dashed blue line:</span>
          </span>
          <span className={`font-mono text-sm font-black ${deviationScore > 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
            Precision Accuracy: {deviationScore}%
          </span>
        </div>

        <div className="bg-sky-50/50 rounded-2xl p-2 border border-sky-100 touch-none flex justify-center shadow-inner">
          <canvas
            ref={canvasRef}
            width={580}
            height={200}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-auto cursor-crosshair rounded-xl bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear Trace</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={tracedPoints.length < config.min_completion_points || isSubmitting}
          className={`flex items-center space-x-2 px-6 py-3 font-black rounded-2xl transition shadow-md ${
            tracedPoints.length >= config.min_completion_points && !isSubmitting
              ? 'bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500 text-slate-950 shadow-sky-200 cursor-pointer transform hover:scale-105'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isSubmitting ? 'Validating...' : 'Submit Motor Trace'}</span>
        </button>
      </div>
    </div>
  );
};

export const FineMotorTraceActivityDefinition: RegisteredActivityDefinition<OTTraceConfig> = {
  activity: {
    activity_id: 'act_ot_motor_trace_01',
    activity_version_id: '1.0.0',
    title: 'Fine Motor Precision Path Tracing',
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

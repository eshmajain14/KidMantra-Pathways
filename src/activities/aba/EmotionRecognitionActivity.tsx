'use client';

import React, { useState } from 'react';
import { ActivityRendererProps, RegisteredActivityDefinition } from '@/registry/types';
import { Activity, ActivitySubmission, ValidationResult, ActivityArtifact } from '@/types/domain';
import { HeartHandshake, CheckCircle2, Volume2, Sparkles, HelpCircle } from 'lucide-react';

export interface ABAEmotionConfig {
  target_emotions: Array<{
    id: string;
    label: string;
    emoji: string;
    cue_prompt: string;
  }>;
  enable_prompt_hierarchy: boolean;
  reward_animation: boolean;
}

const DEFAULT_ABA_CONFIG: ABAEmotionConfig = {
  target_emotions: [
    { id: 'happy', label: 'Happy', emoji: '😊', cue_prompt: 'Select the face that looks happy and joyful!' },
    { id: 'calm', label: 'Calm', emoji: '😌', cue_prompt: 'Select the face that feels calm and relaxed.' },
    { id: 'excited', label: 'Excited', emoji: '🤩', cue_prompt: 'Select the face showing high excitement!' },
    { id: 'sad', label: 'Sad', emoji: '😢', cue_prompt: 'Select the face feeling sad or down.' }
  ],
  enable_prompt_hierarchy: true,
  reward_animation: true
};

export const EmotionRecognitionActivityComponent: React.FC<ActivityRendererProps<ABAEmotionConfig>> = ({
  activity,
  config = DEFAULT_ABA_CONFIG,
  onInteraction,
  onSubmit,
  isSubmitting
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [promptLevel, setPromptLevel] = useState<'independent' | 'visual_hint' | 'full_prompt'>('independent');
  const [scoreCount, setScoreCount] = useState(0);

  const currentEmotion = config.target_emotions[currentIndex] || config.target_emotions[0];

  const handleSelect = (emotionId: string) => {
    setSelectedId(emotionId);
    const isCorrect = emotionId === currentEmotion.id;

    onInteraction({
      type: 'choice_selected',
      payload: {
        target_emotion: currentEmotion.id,
        chosen_emotion: emotionId,
        is_correct: isCorrect,
        prompt_level: promptLevel
      }
    });

    if (isCorrect) {
      setScoreCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < config.target_emotions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedId(null);
      setPromptLevel('independent');
    } else {
      onSubmit({
        total_questions: config.target_emotions.length,
        correct_count: scoreCount + (selectedId === currentEmotion.id ? 1 : 0),
        prompt_hierarchy_used: promptLevel
      });
    }
  };

  const handleRequestHint = () => {
    const nextLevel = promptLevel === 'independent' ? 'visual_hint' : 'full_prompt';
    setPromptLevel(nextLevel);
    onInteraction({
      type: 'prompt_viewed',
      payload: { requested_hint_level: nextLevel, emotion_id: currentEmotion.id }
    });
  };

  return (
    <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-md text-slate-800 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 border border-purple-200 rounded-2xl text-purple-700">
            <HeartHandshake className="w-6 h-6 animate-bounce-subtle" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                ABA / Special Needs
              </span>
              <span className="text-xs text-slate-500 font-medium">ID: {activity.activity_id} (v{activity.activity_version_id})</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{activity.title}</h3>
          </div>
        </div>
      </div>

      {/* Prompt Card */}
      <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <Volume2 className="w-5 h-5 text-purple-600 shrink-0" />
          <p className="text-sm font-black text-purple-900">{currentEmotion.cue_prompt}</p>
        </div>
        {config.enable_prompt_hierarchy && (
          <button
            onClick={handleRequestHint}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 transition shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{promptLevel === 'independent' ? 'Get Visual Cue' : 'Highlight Target'}</span>
          </button>
        )}
      </div>

      {/* Choice Grid */}
      <div className="grid grid-cols-2 gap-4">
        {config.target_emotions.map((item) => {
          const isSelected = selectedId === item.id;
          const isTarget = item.id === currentEmotion.id;
          const showHighlight = promptLevel === 'full_prompt' && isTarget;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 text-center cursor-pointer transform hover:scale-105 ${
                isSelected
                  ? isTarget
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300 scale-105 shadow-md font-black'
                    : 'bg-rose-100 border-rose-300 text-rose-950 font-black'
                  : showHighlight
                  ? 'bg-purple-100 border-purple-400 text-purple-950 animate-pulse font-black'
                  : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-800'
              }`}
            >
              <span className="text-5xl">{item.emoji}</span>
              <span className="font-extrabold text-lg">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs font-bold text-slate-500">
          Card {currentIndex + 1} of {config.target_emotions.length}
        </div>
        <button
          onClick={handleNext}
          disabled={!selectedId || isSubmitting}
          className={`flex items-center space-x-2 px-6 py-3 font-black rounded-2xl transition shadow-md ${
            selectedId && !isSubmitting
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-200 cursor-pointer transform hover:scale-105'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{currentIndex < config.target_emotions.length - 1 ? 'Next Card' : 'Submit ABA Module'}</span>
        </button>
      </div>
    </div>
  );
};

export const EmotionRecognitionActivityDefinition: RegisteredActivityDefinition<ABAEmotionConfig> = {
  activity: {
    activity_id: 'act_aba_emotion_match_01',
    activity_version_id: '1.0.0',
    title: 'Visual Emotion Recognition & Social Cue Prompting',
    short_description: 'Identify facial expressions and social emotional cues through a structured prompt hierarchy.',
    service: 'aba_special_needs',
    target_skill: 'Emotion Identification & Prompt Independence',
    target_age_range: '4-14 years',
    estimated_duration_sec: 150,
    instructions: [
      {
        step_number: 1,
        title: 'Listen to Cue',
        text: 'Listen to the audio prompt describing the emotional state.'
      },
      {
        step_number: 2,
        title: 'Match Expression',
        text: 'Select the matching facial emotion icon.'
      }
    ],
    interaction_type: 'visual_choice',
    activity_config: DEFAULT_ABA_CONFIG,
    completion_criteria: {
      min_accuracy_percent: 75,
      min_required_interactions: 4,
      max_allowed_time_sec: 150,
      required_artifact_types: ['response_matrix']
    },
    accessibility_metadata: {
      screen_reader_prompt: 'Listen to prompt, then select matching emotion card happy, calm, excited, or sad.',
      supports_high_contrast: true,
      supports_audio_cues: true,
      supports_motor_scaling: true,
      alternative_input_modes: ['keyboard', 'switch_access', 'large_target']
    },
    clinical_review_notes: {
      evidence_base: 'Discrete trial training (DTT) and prompt fading procedures build socio-emotional recognition in developmental speech and ABA protocols.',
      therapist_guidance: 'Fade visual prompts systematically over successive therapy sessions.',
      observed_behaviors: ['Prompt dependency', 'Choice hesitation', 'Over-reliance on visual cues'],
      parent_support_tips: ['Reinforce emotion naming during daily activities (e.g., "Look, grandma is happy!").']
    }
  },
  Component: EmotionRecognitionActivityComponent,
  defaultConfig: DEFAULT_ABA_CONFIG,
  validateConfig: (config: unknown) => {
    const cfg = config as Partial<ABAEmotionConfig>;
    if (!cfg || !Array.isArray(cfg.target_emotions)) {
      return { valid: false, errors: ['target_emotions must be an array'] };
    }
    return { valid: true };
  },
  evaluate: async (submission: ActivitySubmission, config: ABAEmotionConfig, activity: Activity<ABAEmotionConfig>): Promise<ValidationResult> => {
    const correctCount = (submission.raw_payload.correct_count as number) || 0;
    const totalCount = (submission.raw_payload.total_questions as number) || config.target_emotions.length;

    const accuracyScore = Math.round((correctCount / totalCount) * 100);
    const isPassed = accuracyScore >= activity.completion_criteria.min_accuracy_percent;

    const generatedArtifacts: ActivityArtifact[] = [
      {
        artifact_id: `art_response_${Date.now()}`,
        attempt_id: submission.attempt_id,
        activity_id: activity.activity_id,
        type: 'response_matrix',
        title: 'Emotion Choice Response Matrix',
        data_url_or_blob: 'data:application/json;utf8,' + JSON.stringify(submission.user_interactions),
        metadata: {
          correct_choices: correctCount,
          total_trials: totalCount,
          prompt_level: submission.raw_payload.prompt_hierarchy_used
        },
        created_at: new Date().toISOString()
      }
    ];

    return {
      is_passed: isPassed,
      accuracy_score: accuracyScore,
      score_breakdown: {
        visual_discrimination: accuracyScore,
        prompt_independence: submission.raw_payload.prompt_hierarchy_used === 'independent' ? 100 : 70
      },
      feedback_message: isPassed
        ? `Super job recognizing emotions! You got ${correctCount} out of ${totalCount} right!`
        : `Good effort! You recognized ${correctCount} of ${totalCount} emotions correctly.`,
      clinical_observations: [
        `Client completed visual emotion matching.`,
        `Accuracy: ${accuracyScore}% across ${totalCount} trials.`
      ],
      artifacts_generated: generatedArtifacts,
      evaluated_at: new Date().toISOString()
    };
  }
};

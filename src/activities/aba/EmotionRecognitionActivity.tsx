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
  onBackStep,
  onStepChange,
  isSubmitting
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [promptLevel, setPromptLevel] = useState<'independent' | 'visual_hint' | 'full_prompt'>('independent');
  const [scoreCount, setScoreCount] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<Array<{
    emotionId: string;
    emotionLabel: string;
    selectedId: string;
    isCorrect: boolean;
  }>>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Notify container of card index changes
  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(currentIndex, config.target_emotions.length);
    }
  }, [currentIndex, onStepChange, config.target_emotions.length]);

  // Support external step back navigation triggered from header
  React.useEffect(() => {
    const handleHeaderBack = () => {
      if (currentIndex > 0 && !isCompleted) {
        setCurrentIndex((prev) => prev - 1);
        setSelectedId(null);
        setHasAnsweredCurrent(false);
        setPromptLevel('independent');
      }
    };
    window.addEventListener('kidmantra_activity_step_back', handleHeaderBack);
    return () => {
      window.removeEventListener('kidmantra_activity_step_back', handleHeaderBack);
    };
  }, [currentIndex, isCompleted]);

  const currentEmotion = config.target_emotions[currentIndex] || config.target_emotions[0];

  const handleSelect = (emotionId: string) => {
    // If already answered this card, prevent multiple clicks from changing answer or score
    if (hasAnsweredCurrent) return;

    setSelectedId(emotionId);
    setHasAnsweredCurrent(true);

    const isCorrect = emotionId === currentEmotion.id;
    if (isCorrect) {
      setScoreCount((prev) => prev + 1);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        emotionId: currentEmotion.id,
        emotionLabel: currentEmotion.label,
        selectedId: emotionId,
        isCorrect
      }
    ]);

    onInteraction({
      type: 'choice_selected',
      payload: {
        target_emotion: currentEmotion.id,
        chosen_emotion: emotionId,
        is_correct: isCorrect,
        prompt_level: promptLevel,
        card_index: currentIndex
      }
    });
  };

  const handleContinue = () => {
    if (currentIndex < config.target_emotions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedId(null);
      setHasAnsweredCurrent(false);
      setPromptLevel('independent');
    } else {
      // Transition to dedicated Results Screen within activity
      setIsCompleted(true);
      onInteraction({
        type: 'prompt_viewed',
        payload: { stage: 'RESULTS', total_correct: scoreCount }
      });
    }
  };

  const handleTryAgain = () => {
    setCurrentIndex(0);
    setSelectedId(null);
    setHasAnsweredCurrent(false);
    setPromptLevel('independent');
    setScoreCount(0);
    setAnswersHistory([]);
    setIsCompleted(false);
    onInteraction({
      type: 'prompt_viewed',
      payload: { action: 'try_again_reset' }
    });
  };

  const handleFinishSubmit = () => {
    onSubmit({
      total_questions: config.target_emotions.length,
      correct_count: scoreCount,
      answers_history: answersHistory,
      prompt_hierarchy_used: promptLevel
    });
  };

  const handleRequestHint = () => {
    const nextLevel = promptLevel === 'independent' ? 'visual_hint' : 'full_prompt';
    setPromptLevel(nextLevel);
    onInteraction({
      type: 'prompt_viewed',
      payload: { requested_hint_level: nextLevel, emotion_id: currentEmotion.id }
    });
  };

  const isCurrentCorrect = selectedId === currentEmotion.id;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm text-slate-800 max-w-2xl mx-auto space-y-5 sm:space-y-6 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl text-white shadow-md shadow-purple-200 shrink-0">
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-800 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                ABA & Social Skills
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Emotion Recognition</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">Match the Feelings</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-xl border border-purple-100 text-xs font-black text-slate-700 self-start sm:self-auto">
          <span>Card {isCompleted ? config.target_emotions.length : currentIndex + 1} of {config.target_emotions.length}</span>
        </div>
      </div>

      {/* STAGE 1: QUESTION & CHOICES */}
      {!isCompleted && (
        <div className="space-y-4 sm:space-y-5">
          {/* Prompt Card with Audio */}
          <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utt = new SpeechSynthesisUtterance(currentEmotion.cue_prompt);
                    utt.rate = 0.9;
                    window.speechSynthesis.speak(utt);
                  }
                }}
                className="p-2.5 bg-white hover:bg-purple-100 text-purple-700 rounded-xl border border-purple-200 shadow-2xs transition transform hover:scale-105 cursor-pointer shrink-0"
                title="Listen to prompt"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <p className="text-sm sm:text-base font-extrabold text-purple-950">{currentEmotion.cue_prompt}</p>
            </div>
            {config.enable_prompt_hierarchy && !hasAnsweredCurrent && (
              <button
                type="button"
                onClick={handleRequestHint}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-purple-100 text-purple-700 text-xs font-extrabold rounded-xl border border-purple-200 transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{promptLevel === 'independent' ? 'Visual Cue' : 'Highlight Match'}</span>
              </button>
            )}
          </div>

          {/* Choice Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            {config.target_emotions.map((item) => {
              const isSelected = selectedId === item.id;
              const isTarget = item.id === currentEmotion.id;
              const showHighlight = promptLevel === 'full_prompt' && isTarget;

              let cardStyle = 'bg-slate-50 border-slate-200 hover:bg-white text-slate-800';

              if (hasAnsweredCurrent) {
                if (isSelected && isTarget) {
                  cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 shadow-sm font-black';
                } else if (isSelected && !isTarget) {
                  cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200 font-black';
                } else if (isTarget) {
                  cardStyle = 'bg-emerald-50/70 border-emerald-300 text-emerald-900 border-dashed font-bold';
                } else {
                  cardStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-70';
                }
              } else if (showHighlight) {
                cardStyle = 'bg-purple-100 border-purple-400 text-purple-950 animate-pulse font-black';
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  disabled={hasAnsweredCurrent}
                  className={`p-4 sm:p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-1 sm:space-y-2 text-center ${
                    !hasAnsweredCurrent ? 'cursor-pointer transform hover:scale-105 active:scale-95' : 'cursor-default'
                  } ${cardStyle}`}
                >
                  <span className="text-4xl sm:text-5xl select-none">{item.emoji}</span>
                  <span className="font-extrabold text-sm sm:text-base">{item.label}</span>
                  {hasAnsweredCurrent && isSelected && (
                    <span
                      className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                        isTarget ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {isTarget ? 'That’s right! 🌟' : 'Good try!'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Inline Feedback Banner when answered */}
          {hasAnsweredCurrent && (
            <div
              className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-between gap-2 ${
                isCurrentCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${isCurrentCorrect ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>
                  {isCurrentCorrect
                    ? `That's right! You identified "${currentEmotion.label}"!`
                    : `Good try! That face shows "${currentEmotion.label}". Look closely at the eyes and mouth.`}
                </span>
              </div>
            </div>
          )}

          {/* Footer Navigation Bar */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4 mt-2">
            <div className="text-xs font-bold text-slate-500 text-center sm:text-left">
              Score: <strong className="text-purple-700 font-mono text-sm">{scoreCount}</strong> of {config.target_emotions.length} correct
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!hasAnsweredCurrent}
              className={`flex items-center justify-center space-x-2 px-6 py-3 font-black text-xs sm:text-sm rounded-xl transition shadow-md ${
                hasAnsweredCurrent
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-200 cursor-pointer transform hover:scale-105 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>
                {!hasAnsweredCurrent
                  ? 'Choose an emotion to proceed'
                  : currentIndex < config.target_emotions.length - 1
                  ? 'Next Emotion Card →'
                  : 'View Results →'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: DEDICATED RESULTS SCREEN */}
      {isCompleted && (
        <div className="space-y-6 text-center py-2 sm:py-4">
          {/* Result Celebration Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 text-purple-600 rounded-3xl border border-purple-200 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 animate-pulse" />
          </div>

          {/* Heading and Encouraging Copy */}
          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Great job exploring emotions!
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto font-medium">
              You finished recognizing all {config.target_emotions.length} facial expressions.
            </p>
          </div>

          {/* Actual Results Summary Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-left space-y-3">
            <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/80 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Activity Summary</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Cards Explored</span>
                <span className="text-xl font-mono font-black text-slate-900 mt-0.5 block">{config.target_emotions.length}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">Correct Matches</span>
                <span className="text-xl font-mono font-black text-emerald-600 mt-0.5 block">{scoreCount}</span>
              </div>
            </div>

            {/* Compact List of Emotions Explored */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Emotions Practiced</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {answersHistory.map((ans, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 font-semibold text-slate-700">
                    <span className={ans.isCorrect ? 'text-emerald-600' : 'text-amber-500'}>
                      {ans.isCorrect ? '✓' : '•'}
                    </span>
                    <span>{ans.emotionLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Action (Finish & Return) & Secondary Action (Try Again) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleFinishSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-sm rounded-xl transition shadow-md shadow-purple-200 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? 'Marking as completed...' : 'Mark as completed 🚀'}</span>
            </button>

            <button
              type="button"
              onClick={handleTryAgain}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-xl transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const EmotionRecognitionActivityDefinition: RegisteredActivityDefinition<ABAEmotionConfig> = {
  activity: {
    activity_id: 'act_aba_emotion_match_01',
    activity_version_id: '1.0.0',
    title: 'Match the Feelings',
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

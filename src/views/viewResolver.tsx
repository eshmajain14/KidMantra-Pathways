'use client';

import React from 'react';
import ActivityContainer from '@/components/ActivityContainer';
import { EarlyLanguageActivityDefinition } from '@/activities/speech/EarlyLanguageActivity';
import { SpeechClarityActivityDefinition } from '@/activities/speech/SpeechClarityActivity';
import { SustainedVocalToneActivityDefinition } from '@/activities/speech/SustainedVocalToneActivity';
import { FineMotorTraceActivityDefinition } from '@/activities/ot/FineMotorTraceActivity';
import { EmotionRecognitionActivityDefinition } from '@/activities/aba/EmotionRecognitionActivity';
import { completeLesson } from '@/mantra/api';
import { ActivityAttempt, UserInteraction } from '@/types/domain';

interface ActivityRunnerProps {
  onBack: () => void;
  onNavigate: (route: string) => void;
}

// Helper to create a standard mock attempt for an activity
function createActivitySessionAttempt(activityId: string, versionId: string): ActivityAttempt {
  return {
    attempt_id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    activity_id: activityId,
    activity_version_id: versionId,
    pathway_id: `pathway_${activityId}`,
    stage_id: `stage_${activityId}`,
    user_id: 'user_demo_01',
    started_at: new Date().toISOString(),
    status: 'in_progress',
    interactions: [],
    artifacts: [],
    events: []
  };
}

// 1. Speech Early Language
export function SpeechEarlyLanguagePage({ onBack }: ActivityRunnerProps) {
  const def = EarlyLanguageActivityDefinition;
  const [attempt] = React.useState(() => createActivitySessionAttempt(def.activity.activity_id, def.activity.activity_version_id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const Component = def.Component;

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await completeLesson(def.activity.activity_id, 'speech', 25);
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackStep = () => {
    window.dispatchEvent(new CustomEvent('kidmantra_activity_step_back'));
  };

  return (
    <ActivityContainer
      title={def.activity.title}
      domain="Speech Therapy"
      targetSkill={def.activity.target_skill}
      points={25}
      onBack={onBack}
      onBackStep={handleBackStep}
      canGoBackStep={currentStepIndex > 0}
    >
      <Component
        activity={def.activity}
        attempt={attempt}
        config={def.defaultConfig}
        onInteraction={() => {}}
        onStepChange={(stepIdx) => setCurrentStepIndex(stepIdx)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ActivityContainer>
  );
}

// 2. Speech Clarity Journey
export function SpeechClarityJourneyPage({ onBack }: ActivityRunnerProps) {
  const def = SpeechClarityActivityDefinition;
  const [attempt] = React.useState(() => createActivitySessionAttempt(def.activity.activity_id, def.activity.activity_version_id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const Component = def.Component;

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await completeLesson(def.activity.activity_id, 'speech', 30);
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackStep = () => {
    window.dispatchEvent(new CustomEvent('kidmantra_activity_step_back'));
  };

  return (
    <ActivityContainer
      title={def.activity.title}
      domain="Speech Therapy"
      targetSkill={def.activity.target_skill}
      points={30}
      onBack={onBack}
      onBackStep={handleBackStep}
      canGoBackStep={currentStepIndex > 0}
    >
      <Component
        activity={def.activity}
        attempt={attempt}
        config={def.defaultConfig}
        onInteraction={() => {}}
        onStepChange={(stepIdx) => setCurrentStepIndex(stepIdx)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ActivityContainer>
  );
}

// 3. Speech Vocal Tone
export function SpeechVocalTonePage({ onBack }: ActivityRunnerProps) {
  const def = SustainedVocalToneActivityDefinition;
  const [attempt] = React.useState(() => createActivitySessionAttempt(def.activity.activity_id, def.activity.activity_version_id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const Component = def.Component;

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await completeLesson(def.activity.activity_id, 'speech', 20);
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ActivityContainer
      title={def.activity.title}
      domain="Speech Therapy"
      targetSkill={def.activity.target_skill}
      points={20}
      onBack={onBack}
    >
      <Component
        activity={def.activity}
        attempt={attempt}
        config={def.defaultConfig}
        onInteraction={() => {}}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ActivityContainer>
  );
}

// 4. OT Fine Motor Trace
export function OTFineMotorTracePage({ onBack }: ActivityRunnerProps) {
  const def = FineMotorTraceActivityDefinition;
  const [attempt] = React.useState(() => createActivitySessionAttempt(def.activity.activity_id, def.activity.activity_version_id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const Component = def.Component;

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await completeLesson(def.activity.activity_id, 'ot', 25);
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ActivityContainer
      title={def.activity.title}
      domain="Occupational Therapy"
      targetSkill={def.activity.target_skill}
      points={25}
      onBack={onBack}
    >
      <Component
        activity={def.activity}
        attempt={attempt}
        config={def.defaultConfig}
        onInteraction={() => {}}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ActivityContainer>
  );
}

// 5. ABA Emotion Recognition
export function ABAEmotionRecognitionPage({ onBack }: ActivityRunnerProps) {
  const def = EmotionRecognitionActivityDefinition;
  const [attempt] = React.useState(() => createActivitySessionAttempt(def.activity.activity_id, def.activity.activity_version_id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const Component = def.Component;

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await completeLesson(def.activity.activity_id, 'aba', 25);
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackStep = () => {
    window.dispatchEvent(new CustomEvent('kidmantra_activity_step_back'));
  };

  return (
    <ActivityContainer
      title={def.activity.title}
      domain="ABA / Special Needs"
      targetSkill={def.activity.target_skill}
      points={25}
      onBack={onBack}
      onBackStep={handleBackStep}
      canGoBackStep={currentIndex > 0}
    >
      <Component
        activity={def.activity}
        attempt={attempt}
        config={def.defaultConfig}
        onInteraction={() => {}}
        onStepChange={(cardIdx) => setCurrentIndex(cardIdx)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </ActivityContainer>
  );
}

export const ROUTE_VIEW_REGISTRY: Record<string, React.ComponentType<ActivityRunnerProps>> = {
  // Speech routes
  '/task/speech-early-language': SpeechEarlyLanguagePage,
  '/task/act_speech_language_01': SpeechEarlyLanguagePage,
  '/task/early-language': SpeechEarlyLanguagePage,

  '/task/speech-clarity-journey': SpeechClarityJourneyPage,
  '/task/act_speech_clarity_01': SpeechClarityJourneyPage,
  '/task/speech-clarity': SpeechClarityJourneyPage,

  '/task/speech-vocal-tone': SpeechVocalTonePage,
  '/task/act_speech_tone_01': SpeechVocalTonePage,
  '/task/vocal-tone': SpeechVocalTonePage,

  // OT routes
  '/task/ot-fine-motor-trace': OTFineMotorTracePage,
  '/task/act_ot_motor_trace_01': OTFineMotorTracePage,
  '/task/fine-motor-trace': OTFineMotorTracePage,

  // ABA routes
  '/task/aba-emotion-recognition': ABAEmotionRecognitionPage,
  '/task/act_aba_emotion_match_01': ABAEmotionRecognitionPage,
  '/task/emotion-recognition': ABAEmotionRecognitionPage
};

export function resolveLessonView({
  currentPath,
  onBack,
  onNavigate
}: {
  currentPath: string;
  currentService: string;
  onBack: () => void;
  onNavigate: (route: string) => void;
  activities?: any[];
}): React.ReactNode {
  if (!currentPath) return null;
  const cleanPath = currentPath.toLowerCase().trim();

  const MatchedComponent = ROUTE_VIEW_REGISTRY[cleanPath];
  if (MatchedComponent) {
    return <MatchedComponent onBack={onBack} onNavigate={onNavigate} />;
  }

  return null;
}

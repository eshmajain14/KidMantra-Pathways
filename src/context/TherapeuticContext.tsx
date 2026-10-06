'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Pathway,
  Stage,
  PathwayActivityRef,
  ActivityAttempt,
  ValidationResult,
  Completion,
  PathwayProgress,
  UserInteraction,
  TherapeuticService
} from '@/types/domain';
import { RegisteredActivityDefinition } from '@/registry/types';
import { activityRegistry } from '@/registry/activityRegistry';
import { registerAllActivities } from '@/registry/registerAllActivities';
import { therapeuticEngine } from '@/engine/TherapeuticEngine';
import { MOCK_PATHWAYS } from '@/data/mockPathways';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  audioPrompts: boolean;
}

interface TherapeuticContextType {
  pathways: Pathway[];
  activePathway: Pathway | null;
  activeStage: Stage | null;
  activeActivityRef: PathwayActivityRef | null;
  activeRegisteredActivity: RegisteredActivityDefinition | null;
  activeAttempt: ActivityAttempt | null;
  pathwayProgress: PathwayProgress | null;
  accessibility: AccessibilitySettings;
  activeTab: 'runner' | 'catalog' | 'registry' | 'analytics' | 'architecture';
  
  // Actions
  setActiveTab: (tab: 'runner' | 'catalog' | 'registry' | 'analytics' | 'architecture') => void;
  selectPathway: (pathwayId: string) => void;
  startActivitySession: (stageId: string, activityId: string) => void;
  recordInteraction: (interaction: Omit<UserInteraction, 'interaction_id' | 'timestamp_ms'>) => void;
  submitActivity: (rawPayload: Record<string, unknown>, customConfig?: unknown) => Promise<{ validation: ValidationResult; completion: Completion }>;
  advanceToNextActivity: () => void;
  toggleAccessibility: (key: keyof AccessibilitySettings) => void;
  recentCompletions: Completion[];
  allAttempts: ActivityAttempt[];
}

const TherapeuticContext = createContext<TherapeuticContextType | undefined>(undefined);

export const TherapeuticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Ensure all registered activity implementations are loaded
  useEffect(() => {
    registerAllActivities();
  }, []);

  const [pathways] = useState<Pathway[]>(MOCK_PATHWAYS);
  const [activePathway, setActivePathway] = useState<Pathway | null>(MOCK_PATHWAYS[0]);
  const [activeStage, setActiveStage] = useState<Stage | null>(MOCK_PATHWAYS[0].stages[0]);
  const [activeActivityRef, setActiveActivityRef] = useState<PathwayActivityRef | null>(
    MOCK_PATHWAYS[0].stages[0].activities[0]
  );

  const [activeRegisteredActivity, setActiveRegisteredActivity] = useState<RegisteredActivityDefinition | null>(
    null
  );
  const [activeAttempt, setActiveAttempt] = useState<ActivityAttempt | null>(null);
  const [pathwayProgress, setPathwayProgress] = useState<PathwayProgress | null>(null);
  const [recentCompletions, setRecentCompletions] = useState<Completion[]>([]);
  const [allAttempts, setAllAttempts] = useState<ActivityAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'runner' | 'catalog' | 'registry' | 'analytics' | 'architecture'>('runner');

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    audioPrompts: true
  });

  // Sync active registered activity whenever activeActivityRef changes
  useEffect(() => {
    if (activeActivityRef) {
      const reg = activityRegistry.get(activeActivityRef.activity_id, activeActivityRef.activity_version_id);
      setActiveRegisteredActivity(reg || null);
    }
  }, [activeActivityRef]);

  // Select Pathway
  const selectPathway = (pathwayId: string) => {
    const found = pathways.find((p) => p.pathway_id === pathwayId);
    if (found) {
      setActivePathway(found);
      const firstStage = found.stages[0];
      setActiveStage(firstStage || null);
      const firstAct = firstStage?.activities[0];
      setActiveActivityRef(firstAct || null);
      setActiveAttempt(null);
    }
  };

  // Start an Activity Session
  const startActivitySession = (stageId: string, activityId: string) => {
    if (!activePathway) return;

    const targetStage = activePathway.stages.find((s) => s.stage_id === stageId) || activePathway.stages[0];
    const targetRef = targetStage?.activities.find((a) => a.activity_id === activityId) || targetStage?.activities[0];

    if (!targetStage || !targetRef) return;

    setActiveStage(targetStage);
    setActiveActivityRef(targetRef);

    const attempt = therapeuticEngine.createAttempt(
      activePathway.pathway_id,
      targetStage.stage_id,
      targetRef.activity_id,
      targetRef.activity_version_id,
      'user_demo_01'
    );

    setActiveAttempt(attempt);
    setAllAttempts(therapeuticEngine.getAllAttempts());
  };

  // Record Interaction
  const recordInteraction = (interactionData: Omit<UserInteraction, 'interaction_id' | 'timestamp_ms'>) => {
    if (!activeAttempt) return;
    therapeuticEngine.recordInteraction(activeAttempt.attempt_id, interactionData);
    const updated = therapeuticEngine.getAttempt(activeAttempt.attempt_id);
    if (updated) setActiveAttempt({ ...updated });
  };

  // Submit Activity
  const submitActivity = async (rawPayload: Record<string, unknown>, customConfig?: unknown) => {
    if (!activeAttempt || !activePathway) {
      throw new Error('No active attempt session to submit.');
    }

    const { validation, completion } = await therapeuticEngine.submitAndValidateAttempt(
      activeAttempt.attempt_id,
      rawPayload,
      customConfig
    );

    const updatedAttempt = therapeuticEngine.getAttempt(activeAttempt.attempt_id);
    if (updatedAttempt) setActiveAttempt({ ...updatedAttempt });

    // Update Pathway Progress
    const { progress } = therapeuticEngine.updatePathwayProgress(activePathway, 'user_demo_01', completion);
    setPathwayProgress({ ...progress });

    setRecentCompletions((prev) => [completion, ...prev]);
    setAllAttempts(therapeuticEngine.getAllAttempts());

    return { validation, completion };
  };

  // Advance to Next Activity
  const advanceToNextActivity = () => {
    if (!activePathway || !activeStage || !activeActivityRef) return;

    const { nextActivityRef, nextStageId } = therapeuticEngine.calculateNext(
      activePathway,
      activeStage.stage_id,
      activeActivityRef.activity_id
    );

    if (nextActivityRef && nextStageId) {
      startActivitySession(nextStageId, nextActivityRef.activity_id);
    } else {
      // Pathway Completed!
      alert('Congratulations! You have completed all stages of this therapeutic pathway!');
    }
  };

  const toggleAccessibility = (key: keyof AccessibilitySettings) => {
    setAccessibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <TherapeuticContext.Provider
      value={{
        pathways,
        activePathway,
        activeStage,
        activeActivityRef,
        activeRegisteredActivity,
        activeAttempt,
        pathwayProgress,
        accessibility,
        activeTab,
        setActiveTab,
        selectPathway,
        startActivitySession,
        recordInteraction,
        submitActivity,
        advanceToNextActivity,
        toggleAccessibility,
        recentCompletions,
        allAttempts
      }}
    >
      {children}
    </TherapeuticContext.Provider>
  );
};

export const useTherapeutic = () => {
  const context = useContext(TherapeuticContext);
  if (!context) {
    throw new Error('useTherapeutic must be used within a TherapeuticProvider');
  }
  return context;
};

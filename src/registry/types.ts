import React from 'react';
import {
  Activity,
  ActivityAttempt,
  ActivitySubmission,
  ValidationResult,
  UserInteraction,
  TherapeuticService
} from '@/types/domain';

/**
 * Props passed to any registered Activity Component Renderer
 */
export interface ActivityRendererProps<TConfig = Record<string, unknown>> {
  activity: Activity<TConfig>;
  attempt: ActivityAttempt;
  config: TConfig;
  onInteraction: (interaction: Omit<UserInteraction, 'interaction_id' | 'timestamp_ms'>) => void;
  onSubmit: (rawPayload: Record<string, unknown>) => void;
  onPauseToggle?: () => void;
  onBackStep?: () => void;
  onStepChange?: (stepIndex: number, totalSteps: number) => void;
  onExit?: () => void;
  isSubmitting?: boolean;
}

/**
 * Pluggable Activity Definition structure registered in the central ActivityRegistry
 */
export interface RegisteredActivityDefinition<TConfig = Record<string, unknown>> {
  /**
   * The activity metadata & clinical configuration specs
   */
  activity: Activity<TConfig>;

  /**
   * The React Component that renders the interactive activity UI
   */
  Component: React.ComponentType<ActivityRendererProps<TConfig>>;

  /**
   * Default configuration preset
   */
  defaultConfig: TConfig;

  /**
   * Validates if a custom configuration object matches this activity's requirements
   */
  validateConfig: (config: unknown) => { valid: boolean; errors?: string[] };

  /**
   * The validation runner / evaluator that scores an ActivitySubmission
   */
  evaluate: (
    submission: ActivitySubmission,
    config: TConfig,
    activity: Activity<TConfig>
  ) => Promise<ValidationResult>;
}

/**
 * Interface for the Central Activity Registry
 */
export interface IActivityRegistry {
  register<TConfig = Record<string, unknown>>(
    definition: RegisteredActivityDefinition<TConfig>
  ): void;

  get<TConfig = Record<string, unknown>>(
    activityId: string,
    versionId?: string
  ): RegisteredActivityDefinition<TConfig> | undefined;

  getAll(): RegisteredActivityDefinition[];

  getByService(service: TherapeuticService): RegisteredActivityDefinition[];

  has(activityId: string): boolean;

  validateConfig(
    activityId: string,
    config: unknown
  ): { valid: boolean; errors?: string[] };

  evaluateSubmission(
    submission: ActivitySubmission,
    config: unknown
  ): Promise<ValidationResult>;
}

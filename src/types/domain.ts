/**
 * MantraCare Therapeutic Activity Platform
 * Core Domain Model Definition
 * 
 * Reusable architecture supporting Speech Therapy, Occupational Therapy,
 * ABA / Special Needs, and Multidisciplinary therapeutic pathways.
 */

export type TherapeuticService = 
  | 'speech_therapy'
  | 'occupational_therapy'
  | 'aba_special_needs'
  | 'multidisciplinary';

export type ActivityInteractionType =
  | 'vocal_speech'
  | 'fine_motor_trace'
  | 'visual_choice'
  | 'drag_and_drop'
  | 'sensory_tap';

export type ActivityArtifactType =
  | 'audio_recording'
  | 'motor_drawing'
  | 'response_matrix'
  | 'latency_graph';

export type AttemptStatus =
  | 'idle'
  | 'in_progress'
  | 'paused'
  | 'submitted'
  | 'evaluated'
  | 'failed';

export type EventType =
  | 'ATTEMPT_STARTED'
  | 'INTERACTION_RECORDED'
  | 'SUBMISSION_CREATED'
  | 'VALIDATION_COMPLETED'
  | 'COMPLETION_DECLARED'
  | 'PATHWAY_PROGRESS_UPDATED';

/**
 * 1. Activity Instruction Step
 */
export interface ActivityInstructionStep {
  step_number: number;
  title: string;
  text: string;
  audio_prompt_url?: string;
  visual_guide_type?: 'animation' | 'image' | 'video' | 'icon';
}

/**
 * 2. Completion Criteria
 */
export interface CompletionCriteria {
  min_accuracy_percent: number;
  min_required_interactions: number;
  max_allowed_time_sec?: number;
  required_artifact_types?: ActivityArtifactType[];
  custom_rule_evaluator_id?: string;
}

/**
 * 3. Accessibility Metadata
 */
export interface AccessibilityMetadata {
  screen_reader_prompt: string;
  supports_high_contrast: boolean;
  supports_audio_cues: boolean;
  supports_motor_scaling: boolean;
  alternative_input_modes: ('keyboard' | 'large_target' | 'switch_access' | 'voice')[];
}

/**
 * 4. Clinical Review Notes
 */
export interface ClinicalReviewNotes {
  evidence_base: string;
  therapist_guidance: string;
  observed_behaviors: string[];
  parent_support_tips: string[];
}

/**
 * 5. Reusable Activity Entity
 * Note: Stable activity_id (numeric or string slug, e.g. "1042", "act_speech_tone_01").
 * Titles may change, IDs remain constant.
 */
export interface Activity<TConfig = Record<string, unknown>> {
  activity_id: string; // Stable primary key
  activity_version_id: string; // SemVer string e.g. "1.0.0"
  title: string;
  short_description: string;
  service: TherapeuticService;
  target_skill: string;
  target_age_range: string;
  estimated_duration_sec: number;
  instructions: ActivityInstructionStep[];
  interaction_type: ActivityInteractionType;
  activity_config: TConfig;
  completion_criteria: CompletionCriteria;
  accessibility_metadata: AccessibilityMetadata;
  clinical_review_notes: ClinicalReviewNotes;
}

/**
 * 6. Reference to an Activity within a Stage
 */
export interface PathwayActivityRef {
  activity_id: string;
  activity_version_id: string;
  title: string;
  description: string;
  duration_seconds: number;
  target_skill: string;
  interaction_type: ActivityInteractionType;
  required_passing_score: number;
}

/**
 * 7. Stage / Day Entity
 */
export interface Stage {
  stage_id: string; // Stable ID e.g. "stage_day_01"
  day_number: number;
  stage_order: number;
  title: string;
  description: string;
  prerequisite_stage_ids?: string[];
  activities: PathwayActivityRef[];
}

/**
 * 8. Pathway Target User Profile
 */
export interface PathwayTargetUser {
  age_range: string;
  target_diagnoses: string[];
  prerequisite_skills: string[];
  sensory_accommodations: string[];
}

/**
 * 9. Pathway Metadata & Goal
 */
export interface PathwayGoal {
  clinical_goal_statement: string;
  metric_targets: Record<string, number>;
  expected_outcomes: string[];
}

export interface PathwayMetadata {
  created_at: string;
  updated_at: string;
  author: string;
  tags: string[];
  icon_name: string;
}

/**
 * 10. Reusable Pathway Entity
 */
export interface Pathway {
  pathway_id: string; // Stable ID e.g. "pathway_speech_articulation_v1"
  pathway_version_id: string;
  title: string;
  description: string;
  service: TherapeuticService;
  metadata: PathwayMetadata;
  target_user: PathwayTargetUser;
  goal: PathwayGoal;
  stages: Stage[];
}

/**
 * 11. User Interaction Captured During Attempt
 */
export interface UserInteraction {
  interaction_id: string;
  timestamp_ms: number;
  type: 'audio_input' | 'touch_drag' | 'choice_selected' | 'canvas_draw' | 'prompt_viewed' | 'pause_resume';
  payload: Record<string, unknown>;
  duration_ms?: number;
}

/**
 * 12. Clinical Artifact Generated
 */
export interface ActivityArtifact {
  artifact_id: string;
  attempt_id: string;
  activity_id: string;
  type: ActivityArtifactType;
  title: string;
  data_url_or_blob: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * 13. Telemetry Event
 */
export interface ActivityEvent {
  event_id: string;
  attempt_id: string;
  activity_id: string;
  event_type: EventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

/**
 * 14. Activity Attempt Session
 */
export interface ActivityAttempt {
  attempt_id: string;
  activity_id: string;
  activity_version_id: string;
  pathway_id: string;
  stage_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  status: AttemptStatus;
  interactions: UserInteraction[];
  artifacts: ActivityArtifact[];
  events: ActivityEvent[];
}

/**
 * 15. Activity Submission (Raw Data sent for Evaluation)
 */
export interface ActivitySubmission {
  attempt_id: string;
  activity_id: string;
  activity_version_id: string;
  submitted_at: string;
  user_interactions: UserInteraction[];
  raw_payload: Record<string, unknown>;
  client_metrics: {
    total_duration_ms: number;
    idle_time_ms: number;
    prompt_count: number;
  };
}

/**
 * 16. Validation Result Output from Evaluator
 */
export interface ValidationResult {
  is_passed: boolean;
  accuracy_score: number; // 0 - 100
  score_breakdown: Record<string, number>;
  feedback_message: string;
  clinical_observations: string[];
  artifacts_generated: ActivityArtifact[];
  evaluated_at: string;
}

/**
 * 17. Final Activity Completion Record
 */
export interface Completion {
  completion_id: string;
  attempt_id: string;
  activity_id: string;
  activity_version_id: string;
  pathway_id: string;
  stage_id: string;
  user_id: string;
  is_success: boolean;
  score: number;
  duration_seconds: number;
  completed_at: string;
  validation_result: ValidationResult;
  next_activity_suggestion?: {
    pathway_id: string;
    stage_id: string;
    activity_id: string;
  };
}

/**
 * 18. Pathway Progress State
 */
export interface PathwayProgress {
  pathway_id: string;
  user_id: string;
  completed_stage_ids: string[];
  completed_activity_ids: string[];
  current_stage_id: string;
  current_activity_id: string;
  activity_completions: Record<string, Completion>; // Keyed by activity_id
  overall_completion_percent: number;
  streak_days: number;
  total_time_spent_sec: number;
  skill_mastery: Record<string, number>; // Skill name -> score 0-100
}

import {
  ActivityAttempt,
  ActivitySubmission,
  ActivityEvent,
  UserInteraction,
  ValidationResult,
  Completion,
  Pathway,
  PathwayProgress,
  PathwayActivityRef
} from '@/types/domain';
import { activityRegistry } from '@/registry/activityRegistry';

export class TherapeuticEngine {
  private attempts = new Map<string, ActivityAttempt>();
  private completions = new Map<string, Completion>();
  private progressStore = new Map<string, PathwayProgress>(); // Key: `${pathway_id}:${user_id}`

  /**
   * 1. PATHWAY → STAGE → ACTIVITY → ATTEMPT (Initialization)
   */
  public createAttempt(
    pathwayId: string,
    stageId: string,
    activityId: string,
    versionId: string,
    userId: string
  ): ActivityAttempt {
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialEvent: ActivityEvent = {
      event_id: `evt_start_${Date.now()}`,
      attempt_id: attemptId,
      activity_id: activityId,
      event_type: 'ATTEMPT_STARTED',
      timestamp: now,
      payload: { pathwayId, stageId, versionId, userId }
    };

    const attempt: ActivityAttempt = {
      attempt_id: attemptId,
      activity_id: activityId,
      activity_version_id: versionId,
      pathway_id: pathwayId,
      stage_id: stageId,
      user_id: userId,
      started_at: now,
      status: 'in_progress',
      interactions: [],
      artifacts: [],
      events: [initialEvent]
    };

    this.attempts.set(attemptId, attempt);
    return attempt;
  }

  /**
   * 2. USER INTERACTION (Log event during attempt)
   */
  public recordInteraction(
    attemptId: string,
    interactionData: Omit<UserInteraction, 'interaction_id' | 'timestamp_ms'>
  ): UserInteraction {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) {
      throw new Error(`[TherapeuticEngine] Attempt "${attemptId}" not found.`);
    }

    const interaction: UserInteraction = {
      interaction_id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp_ms: Date.now(),
      ...interactionData
    };

    attempt.interactions.push(interaction);

    // Append telemetry event
    attempt.events.push({
      event_id: `evt_int_${Date.now()}`,
      attempt_id: attemptId,
      activity_id: attempt.activity_id,
      event_type: 'INTERACTION_RECORDED',
      timestamp: new Date().toISOString(),
      payload: { interactionType: interaction.type }
    });

    return interaction;
  }

  /**
   * 3. SUBMISSION & 4. VALIDATION
   */
  public async submitAndValidateAttempt(
    attemptId: string,
    rawPayload: Record<string, unknown>,
    customConfig?: unknown
  ): Promise<{ validation: ValidationResult; completion: Completion }> {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) {
      throw new Error(`[TherapeuticEngine] Attempt "${attemptId}" not found.`);
    }

    const now = new Date().toISOString();
    attempt.status = 'submitted';

    // Build ActivitySubmission object
    const startTimeMs = new Date(attempt.started_at).getTime();
    const durationMs = Date.now() - startTimeMs;

    const submission: ActivitySubmission = {
      attempt_id: attemptId,
      activity_id: attempt.activity_id,
      activity_version_id: attempt.activity_version_id,
      submitted_at: now,
      user_interactions: attempt.interactions,
      raw_payload: rawPayload,
      client_metrics: {
        total_duration_ms: durationMs,
        idle_time_ms: 0,
        prompt_count: attempt.interactions.filter((i) => i.type === 'prompt_viewed').length
      }
    };

    attempt.events.push({
      event_id: `evt_sub_${Date.now()}`,
      attempt_id: attemptId,
      activity_id: attempt.activity_id,
      event_type: 'SUBMISSION_CREATED',
      timestamp: now,
      payload: { durationMs }
    });

    // Run registry validation
    const validation = await activityRegistry.evaluateSubmission(submission, customConfig);

    attempt.status = validation.is_passed ? 'evaluated' : 'failed';
    attempt.completed_at = now;
    attempt.artifacts = validation.artifacts_generated;

    attempt.events.push({
      event_id: `evt_val_${Date.now()}`,
      attempt_id: attemptId,
      activity_id: attempt.activity_id,
      event_type: 'VALIDATION_COMPLETED',
      timestamp: now,
      payload: { isPassed: validation.is_passed, score: validation.accuracy_score }
    });

    // 5. COMPLETION & COMPLETION EVENT
    const completionId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const completion: Completion = {
      completion_id: completionId,
      attempt_id: attemptId,
      activity_id: attempt.activity_id,
      activity_version_id: attempt.activity_version_id,
      pathway_id: attempt.pathway_id,
      stage_id: attempt.stage_id,
      user_id: attempt.user_id,
      is_success: validation.is_passed,
      score: validation.accuracy_score,
      duration_seconds: Math.round(durationMs / 1000),
      completed_at: now,
      validation_result: validation
    };

    this.completions.set(completionId, completion);

    attempt.events.push({
      event_id: `evt_cmp_${Date.now()}`,
      attempt_id: attemptId,
      activity_id: attempt.activity_id,
      event_type: 'COMPLETION_DECLARED',
      timestamp: now,
      payload: { completionId, isSuccess: completion.is_success }
    });

    return { validation, completion };
  }

  /**
   * 6. PATHWAY PROGRESS & 7. NEXT ACTIVITY
   */
  public updatePathwayProgress(
    pathway: Pathway,
    userId: string,
    completion: Completion
  ): { progress: PathwayProgress; nextActivityRef?: PathwayActivityRef; nextStageId?: string } {
    const key = `${pathway.pathway_id}:${userId}`;
    let progress = this.progressStore.get(key);

    if (!progress) {
      progress = {
        pathway_id: pathway.pathway_id,
        user_id: userId,
        completed_stage_ids: [],
        completed_activity_ids: [],
        current_stage_id: pathway.stages[0]?.stage_id || '',
        current_activity_id: pathway.stages[0]?.activities[0]?.activity_id || '',
        activity_completions: {},
        overall_completion_percent: 0,
        streak_days: 1,
        total_time_spent_sec: 0,
        skill_mastery: {}
      };
    }

    // Record completion
    progress.activity_completions[completion.activity_id] = completion;
    if (!progress.completed_activity_ids.includes(completion.activity_id)) {
      progress.completed_activity_ids.push(completion.activity_id);
    }

    progress.total_time_spent_sec += completion.duration_seconds;

    // Calculate total activities in pathway
    const totalActivities = pathway.stages.reduce((acc, stage) => acc + stage.activities.length, 0);
    progress.overall_completion_percent = Math.round(
      (progress.completed_activity_ids.length / Math.max(1, totalActivities)) * 100
    );

    // Check if current stage is fully completed
    const currentStage = pathway.stages.find((s) => s.stage_id === completion.stage_id);
    if (currentStage) {
      const allStageActsCompleted = currentStage.activities.every((act) =>
        progress?.completed_activity_ids.includes(act.activity_id)
      );
      if (allStageActsCompleted && !progress.completed_stage_ids.includes(currentStage.stage_id)) {
        progress.completed_stage_ids.push(currentStage.stage_id);
      }
    }

    // Determine Next Activity / Next Stage
    const { nextActivityRef, nextStageId } = this.calculateNext(pathway, completion.stage_id, completion.activity_id);

    if (nextActivityRef) {
      progress.current_activity_id = nextActivityRef.activity_id;
    }
    if (nextStageId) {
      progress.current_stage_id = nextStageId;
    }

    this.progressStore.set(key, progress);

    return { progress, nextActivityRef, nextStageId };
  }

  /**
   * Calculate Next Activity in sequence
   */
  public calculateNext(
    pathway: Pathway,
    currentStageId: string,
    currentActivityId: string
  ): { nextActivityRef?: PathwayActivityRef; nextStageId?: string } {
    const stageIdx = pathway.stages.findIndex((s) => s.stage_id === currentStageId);
    if (stageIdx === -1) return {};

    const currentStage = pathway.stages[stageIdx];
    const actIdx = currentStage.activities.findIndex((a) => a.activity_id === currentActivityId);

    // If there is another activity in the current stage:
    if (actIdx !== -1 && actIdx < currentStage.activities.length - 1) {
      return {
        nextActivityRef: currentStage.activities[actIdx + 1],
        nextStageId: currentStage.stage_id
      };
    }

    // If current stage activities are completed, move to next stage:
    if (stageIdx < pathway.stages.length - 1) {
      const nextStage = pathway.stages[stageIdx + 1];
      return {
        nextActivityRef: nextStage.activities[0],
        nextStageId: nextStage.stage_id
      };
    }

    // Pathway completed!
    return {};
  }

  public getAttempt(attemptId: string): ActivityAttempt | undefined {
    return this.attempts.get(attemptId);
  }

  public getProgress(pathwayId: string, userId: string): PathwayProgress | undefined {
    return this.progressStore.get(`${pathwayId}:${userId}`);
  }

  public getAllAttempts(): ActivityAttempt[] {
    return Array.from(this.attempts.values());
  }

  public getAllCompletions(): Completion[] {
    return Array.from(this.completions.values());
  }
}

// Global Singleton Engine
export const therapeuticEngine = new TherapeuticEngine();

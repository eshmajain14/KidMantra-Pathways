import {
  IActivityRegistry,
  RegisteredActivityDefinition
} from './types';
import {
  ActivitySubmission,
  ValidationResult,
  TherapeuticService
} from '@/types/domain';

class ActivityRegistryImpl implements IActivityRegistry {
  // Key format: `${activity_id}@${activity_version_id}` and fallback `${activity_id}`
  private registry = new Map<string, RegisteredActivityDefinition<any>>();
  private latestVersionMap = new Map<string, string>(); // activity_id -> latest version_id

  /**
   * Register a therapeutic activity definition
   */
  public register<TConfig = Record<string, unknown>>(
    definition: RegisteredActivityDefinition<TConfig>
  ): void {
    const { activity_id, activity_version_id } = definition.activity;

    if (!activity_id) {
      throw new Error('[ActivityRegistry] Cannot register an activity without a stable activity_id.');
    }

    const versionedKey = `${activity_id}@${activity_version_id}`;
    
    // Store versioned instance
    this.registry.set(versionedKey, definition);

    // Default primary key maps to latest registered version
    this.registry.set(activity_id, definition);
    this.latestVersionMap.set(activity_id, activity_version_id);

    console.log(
      `[ActivityRegistry] Registered activity: [${activity_id}] (${definition.activity.title}) v${activity_version_id} [Service: ${definition.activity.service}]`
    );
  }

  /**
   * Retrieve an activity definition by stable ID and optional version
   */
  public get<TConfig = Record<string, unknown>>(
    activityId: string,
    versionId?: string
  ): RegisteredActivityDefinition<TConfig> | undefined {
    if (versionId) {
      const versionedKey = `${activityId}@${versionId}`;
      if (this.registry.has(versionedKey)) {
        return this.registry.get(versionedKey) as RegisteredActivityDefinition<TConfig>;
      }
    }
    return this.registry.get(activityId) as RegisteredActivityDefinition<TConfig> | undefined;
  }

  /**
   * Get all registered activity definitions (unique by latest version)
   */
  public getAll(): RegisteredActivityDefinition[] {
    const uniqueDefs: RegisteredActivityDefinition[] = [];
    const seenIds = new Set<string>();

    for (const [activityId, version] of Array.from(this.latestVersionMap.entries())) {
      const def = this.get(activityId, version);
      if (def && !seenIds.has(activityId)) {
        seenIds.add(activityId);
        uniqueDefs.push(def);
      }
    }

    return uniqueDefs;
  }

  /**
   * Get registered activities filtered by Therapeutic Service domain
   */
  public getByService(service: TherapeuticService): RegisteredActivityDefinition[] {
    return this.getAll().filter((def) => def.activity.service === service || def.activity.service === 'multidisciplinary');
  }

  /**
   * Check if an activity exists in the registry
   */
  public has(activityId: string): boolean {
    return this.registry.has(activityId);
  }

  /**
   * Validate configuration object against registered activity validator
   */
  public validateConfig(
    activityId: string,
    config: unknown
  ): { valid: boolean; errors?: string[] } {
    const def = this.get(activityId);
    if (!def) {
      return {
        valid: false,
        errors: [`Activity ID "${activityId}" is not registered in ActivityRegistry.`]
      };
    }
    return def.validateConfig(config);
  }

  /**
   * Run the evaluation engine for a submission
   */
  public async evaluateSubmission(
    submission: ActivitySubmission,
    config: unknown
  ): Promise<ValidationResult> {
    const def = this.get(submission.activity_id, submission.activity_version_id);
    if (!def) {
      throw new Error(
        `[ActivityRegistry] Evaluation failed: Activity ID "${submission.activity_id}" (v${submission.activity_version_id}) not found in registry.`
      );
    }

    const effectiveConfig = config ?? def.defaultConfig;
    return def.evaluate(submission, effectiveConfig as any, def.activity);
  }
}

// Export global singleton instance
export const activityRegistry = new ActivityRegistryImpl();

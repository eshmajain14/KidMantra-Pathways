import { activityRegistry } from './activityRegistry';
import { SustainedVocalToneActivityDefinition } from '@/activities/speech/SustainedVocalToneActivity';
import { SpeechClarityActivityDefinition } from '@/activities/speech/SpeechClarityActivity';
import { EarlyLanguageActivityDefinition } from '@/activities/speech/EarlyLanguageActivity';
import { FineMotorTraceActivityDefinition } from '@/activities/ot/FineMotorTraceActivity';
import { EmotionRecognitionActivityDefinition } from '@/activities/aba/EmotionRecognitionActivity';

let isRegistered = false;

/**
 * Ensures all domain activities across Speech, OT, and ABA are registered into the central ActivityRegistry
 */
export function registerAllActivities(): void {
  if (isRegistered) return;

  activityRegistry.register(SustainedVocalToneActivityDefinition);
  activityRegistry.register(SpeechClarityActivityDefinition);
  activityRegistry.register(EarlyLanguageActivityDefinition);
  activityRegistry.register(FineMotorTraceActivityDefinition);
  activityRegistry.register(EmotionRecognitionActivityDefinition);

  isRegistered = true;
  console.log('[ActivityRegistry] All domain activities registered successfully.');
}

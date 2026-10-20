import { MANTRA_CONFIG } from './config';
import { activities } from './activities';
import { getCurrentService } from './services';

export const LOCALHOST_DEV_UID = 'e68792e6ec42acc875be58cbc1bd936c:0c0137f3fd9e92dac3a8f388e8a7d6ee';

/**
 * Returns URL parameters required by the pathway webhook.
 */
export const getWebhookContext = () => {
  if (typeof window === 'undefined') {
    return { upaId: null, uid: null, service: getCurrentService(), isB2B: false };
  }

  const searchParams = new URLSearchParams(window.location.search || '');
  const rawHash = window.location.hash || '';
  const hashQueryStr = rawHash.includes('?') ? rawHash.substring(rawHash.indexOf('?') + 1) : '';
  const hashParams = new URLSearchParams(hashQueryStr);

  const upaId = (
    searchParams.get('upa_id') ||
    searchParams.get('upaId') ||
    searchParams.get('upaid') ||
    hashParams.get('upa_id') ||
    hashParams.get('upaId') ||
    hashParams.get('upaid') ||
    sessionStorage.getItem('upa_id') ||
    sessionStorage.getItem('upaId') ||
    sessionStorage.getItem('upaid') ||
    localStorage.getItem('upa_id') ||
    localStorage.getItem('upaId') ||
    null
  );

  const uid = (
    searchParams.get('encrypted_user_id') ||
    searchParams.get('encryptedUserId') ||
    searchParams.get('uid') ||
    searchParams.get('user_id') ||
    searchParams.get('userId') ||
    hashParams.get('encrypted_user_id') ||
    hashParams.get('encryptedUserId') ||
    hashParams.get('uid') ||
    hashParams.get('user_id') ||
    hashParams.get('userId') ||
    sessionStorage.getItem('encrypted_user_id') ||
    sessionStorage.getItem('uid') ||
    sessionStorage.getItem('user_id') ||
    localStorage.getItem('encrypted_user_id') ||
    localStorage.getItem('uid') ||
    localStorage.getItem('user_id') ||
    null
  );

  const isB2BRaw = (
    searchParams.get('isB2B') ||
    searchParams.get('is_b2b') ||
    hashParams.get('isB2B') ||
    hashParams.get('is_b2b') ||
    sessionStorage.getItem('isB2B') ||
    localStorage.getItem('isB2B') ||
    null
  );

  const isB2B = isB2BRaw !== null ? String(isB2BRaw).trim().toLowerCase() === 'true' : false;

  // Persist if found in URL
  if (upaId) {
    try {
      sessionStorage.setItem('upa_id', upaId);
      localStorage.setItem('upa_id', upaId);
    } catch {}
  }
  if (uid) {
    try {
      sessionStorage.setItem('uid', uid);
      localStorage.setItem('uid', uid);
    } catch {}
  }
  if (isB2BRaw !== null) {
    try {
      sessionStorage.setItem('isB2B', isB2B ? 'true' : 'false');
      localStorage.setItem('isB2B', isB2B ? 'true' : 'false');
    } catch {}
  }

  return {
    upaId,
    uid,
    isB2B,
    service: getCurrentService()
  };
};

/**
 * Returns active user id or fallback guest ID
 */
export const getCurrentUserId = (): string => {
  const ctx = getWebhookContext();
  return ctx.uid || 'user_demo_01';
};

/**
 * Triggers completion webhook for pathway assigned activities.
 * Base URL: https://api.mantracare.com/webhook/pathway
 * Request payload:
 * {
 *   "intent": "complete_activity",
 *   "upa_id": 101112,
 *   "uid": "abc123:def456"
 * }
 */
export async function triggerPathwayCompletionWebhook(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const { upaId, uid } = getWebhookContext();

  if (!upaId || !uid) {
    console.log('[Mantra API] Missing upa_id or uid, cannot fire webhook yet.');
    return false;
  }

  const payload = {
    intent: 'complete_activity',
    upa_id: Number(upaId),
    uid: String(uid)
  };

  try {
    const res = await fetch(MANTRA_CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.warn('[Mantra API] Pathway completion webhook network error:', err);
    return false;
  }
}

/**
 * Complete lesson handler with points awarding and local completion record.
 */
export const completeLesson = async (
  lessonId: string,
  customServiceOrOptions?: string | number | { service?: string; pointsEarned?: number; rewardPoints?: number },
  extraRewardPoints?: number
): Promise<boolean> => {
  // Fire canonical pathway webhook if upa_id and uid are present
  await triggerPathwayCompletionWebhook().catch(() => {});

  const activity = activities.find((a) => a.lessonId === lessonId || a.activityId === lessonId);

  let resolvedService: string | undefined;
  let resolvedRewardPoints: number | undefined;

  if (typeof customServiceOrOptions === 'string') {
    resolvedService = customServiceOrOptions;
    if (typeof extraRewardPoints === 'number') {
      resolvedRewardPoints = extraRewardPoints;
    }
  } else if (typeof customServiceOrOptions === 'number') {
    resolvedRewardPoints = customServiceOrOptions;
  } else if (customServiceOrOptions && typeof customServiceOrOptions === 'object') {
    resolvedService = customServiceOrOptions.service;
    resolvedRewardPoints = customServiceOrOptions.pointsEarned ?? customServiceOrOptions.rewardPoints;
  }

  const targetLessonId = activity?.lessonId || lessonId;
  const targetRewardPoints = resolvedRewardPoints ?? activity?.rewardPoints ?? 25;

  // In-memory points notification for active UI session
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('mantra_points_updated', { detail: { lessonId: targetLessonId, points: targetRewardPoints } }));
    } catch {}
  }

  return true;
};

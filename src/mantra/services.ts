/**
 * Service Context Management for KidMantra Pathways
 * Standardizes pediatric therapy service identifiers: speech, ot, aba, multidisciplinary
 */

export const SUPPORTED_SERVICES = [
  'speech',
  'ot',
  'aba',
  'multidisciplinary'
] as const;

export type ServiceType = (typeof SUPPORTED_SERVICES)[number] | string;

export const DEFAULT_SERVICE = 'speech';

/**
 * Service alias dictionary mapping common variations
 */
const SERVICE_ALIAS_MAP: Record<string, string> = {
  speech: 'speech',
  speech_therapy: 'speech',
  'speech-therapy': 'speech',
  speechtherapy: 'speech',
  voice: 'speech',
  articulation: 'speech',

  ot: 'ot',
  occupational_therapy: 'ot',
  'occupational-therapy': 'ot',
  occupationaltherapy: 'ot',
  motor: 'ot',
  fine_motor: 'ot',
  sensory: 'ot',

  aba: 'aba',
  aba_special_needs: 'aba',
  'aba-special-needs': 'aba',
  autism: 'aba',
  behavioral: 'aba',
  special_needs: 'aba',

  multidisciplinary: 'multidisciplinary',
  all: 'all'
};

export const normalizeService = (rawService?: string | null): string => {
  if (!rawService) return DEFAULT_SERVICE;
  const cleaned = rawService.trim().toLowerCase();
  if (SERVICE_ALIAS_MAP[cleaned]) {
    return SERVICE_ALIAS_MAP[cleaned];
  }
  return cleaned;
};

let cachedService: string | null = null;

export const getCurrentService = (): string => {
  if (cachedService !== null) {
    return cachedService;
  }

  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search || '');
    let serviceParam = params.get('service') || params.get('source') || params.get('domain');

    if (!serviceParam && window.location.hash) {
      const hashQueryIndex = window.location.hash.indexOf('?');
      if (hashQueryIndex !== -1) {
        const hashParams = new URLSearchParams(window.location.hash.substring(hashQueryIndex));
        serviceParam = hashParams.get('service') || hashParams.get('source') || hashParams.get('domain');
      }
    }

    cachedService = normalizeService(serviceParam);
  } else {
    cachedService = DEFAULT_SERVICE;
  }

  return cachedService;
};

export const setServiceContext = (service: string): string => {
  cachedService = normalizeService(service);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mantra_service_changed', { detail: { service: cachedService } }));
  }
  return cachedService;
};

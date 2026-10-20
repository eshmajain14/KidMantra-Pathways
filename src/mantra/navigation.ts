import { MANTRA_CONFIG } from './config';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Centrally preserves all active URL query parameters (service, upa_id, uid, locale, etc.)
 * when navigating to a new path or route.
 */
export const preserveQueryParams = (targetPath: string): string => {
  if (typeof window === 'undefined' || !window.location) {
    return targetPath;
  }

  const [pathname, targetQuery] = targetPath.split('?');
  const currentParams = new URLSearchParams(window.location.search || '');

  // Normalize legacy 'source' param to 'service'
  if (currentParams.has('source')) {
    const val = currentParams.get('source');
    if (val && !currentParams.has('service')) {
      currentParams.set('service', val);
    }
    currentParams.delete('source');
  }

  // Fallback to cached upa_id if missing from current search
  if (!currentParams.has('upa_id')) {
    try {
      const cachedUpa = sessionStorage.getItem('upa_id') || localStorage.getItem('upa_id');
      if (cachedUpa) currentParams.set('upa_id', cachedUpa);
    } catch {}
  }

  // Filter out mock or dummy user IDs from query params
  ['uid', 'user_id', 'userId', 'encrypted_user_id'].forEach((paramKey) => {
    if (currentParams.has(paramKey)) {
      const val = currentParams.get(paramKey);
      if (
        !val ||
        val.includes('mock') ||
        val.includes('@') ||
        val === 'user_demo_01' ||
        val === 'ketan.gulati@mantra.care'
      ) {
        currentParams.delete(paramKey);
      }
    }
  });

  if (targetQuery) {
    const targetParams = new URLSearchParams(targetQuery);
    targetParams.forEach((value, key) => {
      if (key === 'source') {
        currentParams.set('service', value);
      } else {
        currentParams.set(key, value);
      }
    });
  }

  const mergedSearch = currentParams.toString();
  return mergedSearch ? `${pathname}?${mergedSearch}` : pathname;
};

/**
 * Centrally detects execution context and handles exit / back actions across all contexts:
 * 1. onBack callback (if provided)
 * 2. onNavigate callback (if provided)
 * 3. React Native WebView -> window.ReactNativeWebView.postMessage
 * 4. iframe inside web.mantracare.com -> window.parent.postMessage
 * 5. In-app history back (if prior SPA history exists)
 * 6. Local dev, LAN IP (192.168.x.x, 10.x.x.x, etc.), or localhost fallback -> /
 * 7. Standalone production browser fallback -> https://web.mantracare.com/tasks
 */
export function handleExit(
  onBackOrService?: (() => void) | string,
  onNavigate?: (path: string) => void,
  service?: string
) {
  if (typeof window === 'undefined') return;

  const onBackCallback = typeof onBackOrService === 'function' ? onBackOrService : undefined;

  const hostname = window.location.hostname;
  const isLocalOrDev =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local') ||
    hostname.includes('vercel.app') ||
    window.location.port === '5173' ||
    window.location.port === '3000';

  try {
    // 1. Explicit in-app callbacks take top priority
    if (onBackCallback) {
      onBackCallback();
      return;
    }

    if (onNavigate) {
      onNavigate('/');
      return;
    }

    // 2. React Native WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          action: 'exit'
        })
      );
      return;
    }

    // 3. iframe inside web.mantracare.com (production container)
    if (window.parent && window.parent !== window && !isLocalOrDev) {
      window.parent.postMessage(
        {
          action: 'exit'
        },
        '*'
      );
      return;
    }

    // 4. In-app history: if browser has prior history within the same host origin
    if (
      window.history &&
      window.history.length > 1 &&
      document.referrer &&
      document.referrer.includes(window.location.host)
    ) {
      window.history.back();
      return;
    }

    // 5. Local dev, LAN IP, localhost, Vercel, or custom port -> return to Dashboard root
    if (isLocalOrDev) {
      const targetUrl = preserveQueryParams('/');
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new Event('popstate'));
      return;
    }

    // 6. Standalone production browser fallback
    window.location.href = 'https://web.mantracare.com/tasks';
  } catch (err: any) {
    console.warn('[Mantra Navigation] Back navigation / exit execution warning:', err);
  }
}

/**
 * Navigates to a specific screen inside the native React Native app
 */
export function navigateToNativeScreen(
  screen: string = 'Tasks',
  params: Record<string, any> = { page: '/tasks' }
) {
  if (typeof window === 'undefined') return;
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          action: 'navigate',
          screen,
          params
        })
      );
    }
  } catch (err: any) {
    console.warn('[Mantra Navigation] Native screen navigation warning:', err);
  }
}

/**
 * Handles back routing, delegating to onBackCallback or handleExit.
 */
export const goBack = (onBackCallback?: () => void) => {
  try {
    if (onBackCallback) {
      onBackCallback();
    } else {
      handleExit();
    }
  } catch (err: any) {
    console.warn('[Mantra Navigation] Activity Back action warning:', err);
  }
};

/**
 * Redirects back to Dashboard / Exit.
 */
export const goToDashboard = (onBack?: () => void, onNavigate?: (path: string) => void) => {
  handleExit(onBack, onNavigate);
};

/**
 * Detects the active deployment subpath prefix (e.g. '/client_tasks', '/user_pathways', '/app/content', etc.)
 */
export const getDeploymentSubpath = (): string => {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  const knownPrefixes = [
    '/client_tasks',
    '/client-tasks',
    '/user_pathways',
    '/app/content/provider_pathways',
    '/provider_activity/app/content',
    '/app/content',
    '/provider_pathways_dashboard_v3',
    '/provider_pathways_dashboard_v2',
    '/provider_dashboard_v1',
    '/provider_pathways_dashboard_v1',
    '/provider_pathways_v2_testing',
    '/provider_pathways',
    '/provider_pathway',
    '/provider_activity'
  ];
  for (const prefix of knownPrefixes) {
    if (pathname.startsWith(prefix)) {
      return prefix;
    }
  }
  const match = pathname.match(/^(\/[^\/]+)/);
  if (match && match[1] && !match[1].startsWith('/task') && !match[1].startsWith('/admin') && !match[1].startsWith('/dev')) {
    return match[1];
  }
  return '';
};

/**
 * Builds a robust shareable URL that preserves the deployment subpath prefix and uses
 * standard task route while ensuring compatibility across webviews, edge proxies, and platforms.
 */
export const getShareableTaskUrl = (taskPath: string, queryParams: Record<string, string> = {}): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const subpath = getDeploymentSubpath();
  const cleanTask = taskPath.startsWith('/') ? taskPath : `/${taskPath}`;
  const fullPath = `${subpath}${cleanTask}`.replace(/\/+/g, '/');

  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.set(k, String(v));
    }
  });

  const queryString = searchParams.toString();
  return `${origin}${fullPath}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Navigates popstate router to the selected task route pathway within the app,
 * preserving query parameters and deployment subpath prefix.
 */
export const goToLesson = (route: string) => {
  if (typeof window === 'undefined') return;

  try {
    if (route.startsWith('http://') || route.startsWith('https://')) {
      window.location.href = route;
      return;
    }
    const currentSubpath = getDeploymentSubpath();
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
    const fullPath =
      cleanRoute === '/'
        ? currentSubpath || '/'
        : `${currentSubpath}${cleanRoute}`.replace(/\/+/g, '/');
    const targetUrl = preserveQueryParams(fullPath);

    window.history.replaceState(null, '', targetUrl);
    window.dispatchEvent(new Event('popstate'));
  } catch (err: any) {
    console.warn('[Mantra Navigation] Route transition to activity warning:', err);
  }
};

/**
 * Centrally completes an activity via the completion webhook and then invokes exit/back navigation.
 */
export const completeAndExit = async (lessonId: string, onBackCallback?: () => void) => {
  try {
    const { completeLesson } = await import('./api');
    await completeLesson(lessonId);
  } catch (error: any) {
    console.warn('[Mantra Navigation] Activity completion warning:', error);
  }
  goBack(onBackCallback);
};

/**
 * Controls completion redirection actions.
 * First hits the activity completion webhook and then uses the back button exit logic.
 */
export const redirectAfterCompletion = async (lessonId: string, onBackCallback?: () => void) => {
  await completeAndExit(lessonId, onBackCallback);
};

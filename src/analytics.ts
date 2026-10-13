import type { Analytics } from 'firebase/analytics'

export type AnalyticsConsent = 'accepted' | 'declined' | null

const consentKey = 'pokedock.analytics-consent.v1'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const analyticsConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.appId && firebaseConfig.projectId && firebaseConfig.measurementId,
)

let analyticsPromise: Promise<Analytics | null> | null = null

export function readAnalyticsConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(consentKey)
    return value === 'accepted' || value === 'declined' ? value : null
  } catch {
    return null
  }
}

async function loadAnalytics(): Promise<Analytics | null> {
  if (!analyticsConfigured || readAnalyticsConsent() !== 'accepted') return null
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const [{ getApp, getApps, initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
        import('firebase/app'),
        import('firebase/analytics'),
      ])
      if (!(await isSupported())) return null
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
      return getAnalytics(app)
    })().catch(() => null)
  }
  return analyticsPromise
}

export async function setAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>): Promise<void> {
  try {
    window.localStorage.setItem(consentKey, consent)
  } catch {
    return
  }
  if (consent === 'accepted') {
    const analytics = await loadAnalytics()
    if (analytics) {
      const { setAnalyticsCollectionEnabled } = await import('firebase/analytics')
      setAnalyticsCollectionEnabled(analytics, true)
    }
  } else if (analyticsPromise) {
    const analytics = await analyticsPromise
    if (analytics) {
      const { setAnalyticsCollectionEnabled } = await import('firebase/analytics')
      setAnalyticsCollectionEnabled(analytics, false)
    }
  }
}

export async function initializeAnalyticsIfConsented(): Promise<void> {
  await loadAnalytics()
}

export async function trackSiteEvent(name: string, parameters?: Record<string, string>): Promise<void> {
  const analytics = await loadAnalytics()
  if (!analytics) return
  const { logEvent } = await import('firebase/analytics')
  logEvent(analytics, name, parameters)
}

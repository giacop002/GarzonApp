import * as Sentry from '@sentry/react-native'

// Integración opcional: solo se activa si hay un DSN configurado.
// Definí EXPO_PUBLIC_SENTRY_DSN en .env para habilitarla.
// (El reporte nativo de crashes solo funciona en builds EAS, no en Expo Go.)
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN

export const sentryHabilitado = Boolean(dsn)

export function initSentry() {
  if (!dsn) return
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
  })
}

export function reportarError(error: unknown, contexto?: Record<string, unknown>) {
  if (!dsn) {
    console.error('[error]', error)
    return
  }
  Sentry.captureException(error, contexto ? { extra: contexto } : undefined)
}

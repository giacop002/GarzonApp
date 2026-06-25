import { useEffect } from 'react'
import * as Sentry from '@sentry/react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { initSentry } from '@/lib/sentry'

// Inicializa el tracking de errores antes de renderizar (no-op sin DSN).
initSentry()

export default Sentry.wrap(function RootLayout() {
  const { session, inicializado, usuario, inicializar } = useAuthStore()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    inicializar()
  }, [])

  useEffect(() => {
    if (!inicializado) return

    const inAuth = segments[0] === '(auth)'
    const inApp = segments[0] === '(app)'

    if (!session && !inAuth) {
      router.replace('/(auth)/login')
    } else if (session && !inApp) {
      router.replace('/(app)/mesas')
    }
  }, [session, inicializado, segments])

  return (
    <ErrorBoundary>
      <Slot />
    </ErrorBoundary>
  )
})

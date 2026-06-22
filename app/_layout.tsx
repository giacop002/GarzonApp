import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function RootLayout() {
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

  return <Slot />
}

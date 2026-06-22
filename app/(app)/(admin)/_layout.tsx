import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function AdminLayout() {
  const { isGarzon } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Defensa en profundidad: un garzón nunca debe entrar a /(admin)
    if (isGarzon()) {
      router.replace('/(app)/mesas')
    }
  }, [])

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Administración' }} />
    </Stack>
  )
}

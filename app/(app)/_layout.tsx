import { useEffect } from 'react'
import { Tabs, useRouter } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'

export default function AppLayout() {
  const { isGarzon } = useAuthStore()
  const router = useRouter()
  const soloGarzon = isGarzon()

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="mesas"
        options={{ title: 'Mesas', headerShown: false }}
      />
      <Tabs.Screen
        name="carta"
        options={{ title: 'Carta', headerShown: false }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil' }}
      />
      <Tabs.Screen
        name="(admin)"
        options={{
          title: 'Admin',
          // Oculta el tab Admin para garzones
          href: soloGarzon ? null : '/(app)/(admin)',
          headerShown: false,
        }}
      />
    </Tabs>
  )
}

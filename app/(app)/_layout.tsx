import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useHydration } from '@/hooks/useHydration'

export default function AppLayout() {
  const { isGarzon } = useAuthStore()
  const soloGarzon = isGarzon()
  const hidratado = useHydration()

  // Mientras se leen pedidos/carta de AsyncStorage, mostramos un loader
  // para evitar el flash de estado vacío.
  if (!hidratado) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    )
  }

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

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})

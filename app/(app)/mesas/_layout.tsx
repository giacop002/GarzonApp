import { Stack } from 'expo-router'

export default function MesasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mapa de mesas' }} />
    </Stack>
  )
}

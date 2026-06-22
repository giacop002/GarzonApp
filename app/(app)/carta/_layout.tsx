import { Stack } from 'expo-router'

export default function CartaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Carta' }} />
    </Stack>
  )
}

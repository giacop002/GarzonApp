import { Stack } from 'expo-router'

export default function CartaLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Carta' }} />
      <Stack.Screen name="[categoriaId]" options={{ title: 'Carta' }} />
      <Stack.Screen
        name="item/[itemId]"
        options={{ presentation: 'modal', title: 'Detalle de ítem' }}
      />
    </Stack>
  )
}

import { Stack } from 'expo-router'

export default function MesasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mapa de mesas' }} />
      <Stack.Screen name="[mesaId]/index" options={{ title: 'Detalle de mesa' }} />
      <Stack.Screen name="[mesaId]/carta/index" options={{ title: 'Carta' }} />
      <Stack.Screen name="[mesaId]/carta/[categoriaId]" options={{ title: 'Carta' }} />
      <Stack.Screen
        name="[mesaId]/carta/item/[itemId]"
        options={{ presentation: 'modal', title: 'Detalle de ítem' }}
      />
    </Stack>
  )
}

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { usePedidosStore } from '@/stores/usePedidosStore'

interface Props {
  mesaId: string
}

// Badge en el header que muestra la cantidad total de ítems del pedido actual.
// Tap → vuelve al resumen de la mesa.
export function BadgePedidoHeader({ mesaId }: Props) {
  const router = useRouter()
  const pedido = usePedidosStore((s) => s.pedidosPorMesa[mesaId])
  const cantidad = pedido?.items.reduce((acc, l) => acc + l.cantidad, 0) ?? 0

  if (cantidad === 0) return null

  return (
    <TouchableOpacity
      style={styles.contenedor}
      onPress={() => router.push(`/(app)/mesas/${mesaId}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.icono}>🧾</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeTexto}>{cantidad}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  contenedor: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  icono: { fontSize: 20 },
  badge: {
    marginLeft: -8,
    marginTop: -12,
    backgroundColor: '#c62828',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
})

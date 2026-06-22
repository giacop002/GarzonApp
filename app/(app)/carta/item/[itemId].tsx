import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useCartaStore } from '@/stores/useCartaStore'
import { formatearPrecio } from '@/lib/format'

// Detalle de ítem en modo consulta (sin opción de agregar a pedido).
// Standalone: se navega desde el tab Carta sin contexto de mesa.
export default function ItemConsultaScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>()
  const { getItemById, isItemDisponible } = useCartaStore()

  const item = getItemById(itemId)

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Ítem no encontrado.</Text>
      </View>
    )
  }

  const disponible = isItemDisponible(item.id)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: item.nombre }} />
      <Text style={styles.nombre}>{item.nombre}</Text>
      {item.descripcion && <Text style={styles.desc}>{item.descripcion}</Text>}
      <Text style={styles.precio}>{formatearPrecio(item.precio)}</Text>

      <View style={[styles.badge, disponible ? styles.badgeOk : styles.badgeNo]}>
        <Text style={[styles.badgeTexto, disponible ? styles.badgeTextoOk : styles.badgeTextoNo]}>
          {disponible ? 'Disponible' : 'No disponible'}
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contenido: { padding: 24 },
  nombre: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  desc: { fontSize: 15, color: '#888', marginTop: 6 },
  precio: { fontSize: 22, fontWeight: '700', color: '#2e7d32', marginTop: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 16,
  },
  badgeOk: { backgroundColor: '#e8f5e9' },
  badgeNo: { backgroundColor: '#ffebee' },
  badgeTexto: { fontSize: 13, fontWeight: '600' },
  badgeTextoOk: { color: '#2e7d32' },
  badgeTextoNo: { color: '#c62828' },
  error: { fontSize: 16, color: '#c62828', textAlign: 'center', marginTop: 40 },
})

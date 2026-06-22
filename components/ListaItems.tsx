import { FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Item } from '@/constants/carta'
import { useCartaStore } from '@/stores/useCartaStore'
import { formatearPrecio } from '@/lib/format'

interface Props {
  items: Item[]
  onSelectItem: (itemId: string) => void
}

export function ListaItems({ items, onSelectItem }: Props) {
  const isItemDisponible = useCartaStore((s) => s.isItemDisponible)

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => {
        const disponible = isItemDisponible(item.id)
        return (
          <TouchableOpacity
            style={[styles.fila, !disponible && styles.filaNoDisp]}
            onPress={() => onSelectItem(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.info}>
              <Text style={[styles.nombre, !disponible && styles.atenuado]}>
                {item.nombre}
              </Text>
              {item.descripcion && (
                <Text style={[styles.desc, !disponible && styles.atenuado]}>
                  {item.descripcion}
                </Text>
              )}
              {!disponible && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>No disponible</Text>
                </View>
              )}
            </View>
            <Text style={[styles.precio, !disponible && styles.atenuado]}>
              {formatearPrecio(item.precio)}
            </Text>
          </TouchableOpacity>
        )
      }}
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>Sin ítems en esta categoría</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  lista: { padding: 12 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filaNoDisp: { backgroundColor: '#fafafa' },
  info: { flex: 1, marginRight: 12 },
  nombre: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  desc: { fontSize: 13, color: '#888', marginTop: 2 },
  atenuado: { opacity: 0.45 },
  precio: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  badgeTexto: { fontSize: 11, color: '#c62828', fontWeight: '600' },
  vacio: { padding: 40, alignItems: 'center' },
  vacioTexto: { color: '#999' },
})

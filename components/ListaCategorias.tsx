import { FlatList, TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { Categoria } from '@/constants/carta'

interface Props {
  categorias: Categoria[]
  onSelect: (categoriaId: string) => void
}

export function ListaCategorias({ categorias, onSelect }: Props) {
  return (
    <FlatList
      data={categorias}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.lista}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.fila}
          onPress={() => onSelect(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>Sin categorías</Text>
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
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nombre: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  chevron: { fontSize: 22, color: '#bbb' },
  vacio: { padding: 40, alignItems: 'center' },
  vacioTexto: { color: '#999' },
})

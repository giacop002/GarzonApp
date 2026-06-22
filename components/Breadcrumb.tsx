import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useCartaStore } from '@/stores/useCartaStore'

interface Props {
  categoriaId: string | null // null = solo "Carta"
  // pasosAtras = cuántas pantallas del stack descartar para llegar al destino.
  // Cada categoría del breadcrumb equivale a una entrada del stack.
  onNavegar: (pasosAtras: number) => void
}

export function Breadcrumb({ categoriaId, onNavegar }: Props) {
  const getAncestros = useCartaStore((s) => s.getAncestros)
  const ancestros = categoriaId ? getAncestros(categoriaId) : []

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contenedor}
    >
      {/* "Carta" (raíz): descarta todas las categorías por encima */}
      <TouchableOpacity onPress={() => onNavegar(ancestros.length)}>
        <Text style={styles.raiz}>Carta</Text>
      </TouchableOpacity>

      {ancestros.map((cat, i) => {
        const esUltimo = i === ancestros.length - 1
        const pasosAtras = ancestros.length - 1 - i
        return (
          <View key={cat.id} style={styles.segmento}>
            <Text style={styles.sep}>›</Text>
            <TouchableOpacity
              onPress={() => !esUltimo && onNavegar(pasosAtras)}
              disabled={esUltimo}
            >
              <Text style={[styles.texto, esUltimo && styles.actual]}>
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  segmento: { flexDirection: 'row', alignItems: 'center' },
  raiz: { fontSize: 13, color: '#1565c0', fontWeight: '600' },
  texto: { fontSize: 13, color: '#1565c0' },
  actual: { color: '#666', fontWeight: '600' },
  sep: { fontSize: 13, color: '#bbb', marginHorizontal: 6 },
})

import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { useCartaStore } from '@/stores/useCartaStore'
import { ListaCategorias } from '@/components/ListaCategorias'
import { ListaItems } from '@/components/ListaItems'
import { Breadcrumb } from '@/components/Breadcrumb'

export default function CartaStandaloneCategoriaScreen() {
  const { categoriaId } = useLocalSearchParams<{ categoriaId: string }>()
  const router = useRouter()
  const { getCategoriaById, getSubcategorias, getItemsByCategoria, tieneSubcategorias } =
    useCartaStore()

  const categoria = getCategoriaById(categoriaId)
  const esNodoIntermedio = tieneSubcategorias(categoriaId)

  // Descarta exactamente `pasosAtras` pantallas del stack (cada categoría del
  // breadcrumb es una entrada). Determinístico, sin fallback a push.
  const navegarBreadcrumb = (pasosAtras: number) => {
    if (pasosAtras > 0) router.dismiss(pasosAtras)
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoria?.nombre ?? 'Carta' }} />
      <Breadcrumb categoriaId={categoriaId} onNavegar={navegarBreadcrumb} />

      {esNodoIntermedio ? (
        <ListaCategorias
          categorias={getSubcategorias(categoriaId)}
          onSelect={(id) => router.push(`/(app)/carta/${id}`)}
        />
      ) : (
        <ListaItems
          items={getItemsByCategoria(categoriaId)}
          onSelectItem={(itemId) => router.push(`/(app)/carta/item/${itemId}`)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
})

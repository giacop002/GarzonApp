import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useCartaStore } from '@/stores/useCartaStore'
import { ListaCategorias } from '@/components/ListaCategorias'
import { Breadcrumb } from '@/components/Breadcrumb'

export default function CartaStandaloneScreen() {
  const router = useRouter()
  const { categorias, cargarCarta, getSubcategorias } = useCartaStore()

  useEffect(() => {
    if (categorias.length === 0) cargarCarta()
  }, [])

  return (
    <View style={styles.container}>
      <Breadcrumb categoriaId={null} onNavegar={() => {}} />
      <ListaCategorias
        categorias={getSubcategorias(null)}
        onSelect={(id) => router.push(`/(app)/carta/${id}`)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
})

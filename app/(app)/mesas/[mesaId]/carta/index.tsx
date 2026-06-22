import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { useCartaStore } from '@/stores/useCartaStore'
import { ListaCategorias } from '@/components/ListaCategorias'
import { Breadcrumb } from '@/components/Breadcrumb'
import { BadgePedidoHeader } from '@/components/BadgePedidoHeader'

export default function CartaRaizScreen() {
  const { mesaId } = useLocalSearchParams<{ mesaId: string }>()
  const router = useRouter()
  const { categorias, cargarCarta, getSubcategorias } = useCartaStore()

  useEffect(() => {
    if (categorias.length === 0) cargarCarta()
  }, [])

  const raices = getSubcategorias(null)

  const irACategoria = (categoriaId: string) => {
    router.push(`/(app)/mesas/${mesaId}/carta/${categoriaId}`)
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ headerRight: () => <BadgePedidoHeader mesaId={mesaId} /> }}
      />
      <Breadcrumb categoriaId={null} onNavegar={() => {}} />
      <ListaCategorias categorias={raices} onSelect={irACategoria} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
})

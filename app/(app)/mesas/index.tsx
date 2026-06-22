import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useMesasStore } from '@/stores/useMesasStore'
import { usePedidosStore } from '@/stores/usePedidosStore'
import { MapaMesas } from '@/components/MapaMesas'
import { PanelMesasVirtuales } from '@/components/PanelMesasVirtuales'

export default function MesasScreen() {
  const router = useRouter()
  const { cargarMesas, mesas, zonas, getMesasPorZona } = useMesasStore()
  const [zonaActiva, setZonaActiva] = useState('')

  useEffect(() => {
    const init = async () => {
      if (mesas.length === 0) await cargarMesas()
      // Recupera del servidor pedidos activos del garzón (ej. tras reinstalar).
      await usePedidosStore.getState().cargarPedidosActivos()
      // Reconciliación: si una mesa libre tiene un pedido activo, ocupada.
      const { pedidosPorMesa } = usePedidosStore.getState()
      const { estadosMesa, actualizarEstadoMesa } = useMesasStore.getState()
      Object.keys(pedidosPorMesa).forEach((mesaId) => {
        if ((estadosMesa[mesaId]?.estado ?? 'libre') === 'libre') {
          actualizarEstadoMesa(mesaId, 'ocupada')
        }
      })
    }
    init()
  }, [])

  // Selecciona la primera zona (por orden) una vez cargadas.
  useEffect(() => {
    if (!zonaActiva && zonas.length > 0) setZonaActiva(zonas[0].id)
  }, [zonas, zonaActiva])

  const irADetalle = (mesaId: string) => {
    router.push(`/(app)/mesas/${mesaId}`)
  }

  const mesasZona = getMesasPorZona(zonaActiva)

  return (
    <View style={styles.container}>
      {/* Selector de zona */}
      <View style={styles.selector}>
        {zonas.map((zona) => {
          const activa = zona.id === zonaActiva
          return (
            <TouchableOpacity
              key={zona.id}
              style={[styles.tab, activa && styles.tabActiva]}
              onPress={() => setZonaActiva(zona.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabTexto, activa && styles.tabTextoActivo]}>
                {zona.nombre}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Mapa de la zona seleccionada */}
      <MapaMesas mesas={mesasZona} onSeleccionarMesa={irADetalle} />

      {/* Panel de mesas virtuales */}
      <PanelMesasVirtuales onSeleccionarMesa={irADetalle} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  selector: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  tabActiva: { backgroundColor: '#1a1a1a' },
  tabTexto: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextoActivo: { color: '#fff' },
})

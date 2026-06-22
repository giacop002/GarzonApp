import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useMesasStore } from '@/stores/useMesasStore'
import { MapaMesas } from '@/components/MapaMesas'
import { PanelMesasVirtuales } from '@/components/PanelMesasVirtuales'
import { ZONA_EXTERIOR, ZONA_INTERIOR } from '@/constants/mesas'

export default function MesasScreen() {
  const router = useRouter()
  const { cargarMesas, mesas, zonas, getMesasPorZona } = useMesasStore()
  const [zonaActiva, setZonaActiva] = useState(ZONA_EXTERIOR)

  useEffect(() => {
    if (mesas.length === 0) cargarMesas()
  }, [])

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

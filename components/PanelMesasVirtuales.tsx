import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useMesasStore } from '@/stores/useMesasStore'
import { ESTILOS_ESTADO } from '@/constants/estadosMesa'

interface Props {
  onSeleccionarMesa: (mesaId: string) => void
}

export function PanelMesasVirtuales({ onSeleccionarMesa }: Props) {
  const [abierto, setAbierto] = useState(false)
  const mesas = useMesasStore((s) => s.mesas)
  const getMesaById = useMesasStore((s) => s.getMesaById)
  const getEstadoMesa = useMesasStore((s) => s.getEstadoMesa)

  const virtuales = mesas.filter((m) => m.esVirtual && m.activa)

  if (virtuales.length === 0) return null

  return (
    <View style={styles.panel}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setAbierto((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerTexto}>
          Mesas adicionales ({virtuales.length})
        </Text>
        <Text style={styles.chevron}>{abierto ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {abierto &&
        virtuales.map((mesa) => {
          const estado = getEstadoMesa(mesa.id)?.estado ?? 'libre'
          const real = mesa.mesaRealId ? getMesaById(mesa.mesaRealId) : undefined
          return (
            <TouchableOpacity
              key={mesa.id}
              style={styles.fila}
              onPress={() => onSeleccionarMesa(mesa.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.numero}>[{mesa.numero}]</Text>
              <View style={styles.filaInfo}>
                <Text style={styles.filaTitulo}>Mesa temporal</Text>
                {real && (
                  <Text style={styles.filaSub}>
                    corresponde a mesa {real.numero}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: ESTILOS_ESTADO[estado].color },
                ]}
              >
                <Text style={[styles.badgeTexto, { color: ESTILOS_ESTADO[estado].texto }]}>
                  {ESTILOS_ESTADO[estado].label}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTexto: { fontSize: 15, fontWeight: '600', color: '#444' },
  chevron: { fontSize: 12, color: '#888' },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  numero: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    width: 48,
  },
  filaInfo: { flex: 1 },
  filaTitulo: { fontSize: 14, color: '#1a1a1a' },
  filaSub: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTexto: { fontSize: 12, fontWeight: '600' },
})

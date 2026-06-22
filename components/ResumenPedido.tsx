import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { usePedidosStore } from '@/stores/usePedidosStore'
import { formatearPrecio } from '@/lib/format'

interface Props {
  mesaId: string
}

export function ResumenPedido({ mesaId }: Props) {
  const pedido = usePedidosStore((s) => s.pedidosPorMesa[mesaId])
  const quitarItem = usePedidosStore((s) => s.quitarItem)
  const actualizarCantidad = usePedidosStore((s) => s.actualizarCantidad)

  if (!pedido || pedido.items.length === 0) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.vacioTexto}>Sin ítems en el pedido</Text>
      </View>
    )
  }

  const total = pedido.items.reduce((acc, l) => acc + l.precio * l.cantidad, 0)

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={pedido.items}
        keyExtractor={(l) => l.itemId + l.notas}
        renderItem={({ item: linea }) => (
          <View style={styles.linea}>
            <View style={styles.lineaInfo}>
              <Text style={styles.nombre}>{linea.nombre}</Text>
              {linea.notas ? (
                <Text style={styles.notas}>{linea.notas}</Text>
              ) : null}
              <Text style={styles.precioUnit}>
                {formatearPrecio(linea.precio)} c/u
              </Text>
            </View>

            <View style={styles.controles}>
              <TouchableOpacity
                style={styles.boton}
                onPress={() =>
                  actualizarCantidad(mesaId, linea.itemId, linea.cantidad - 1)
                }
              >
                <Text style={styles.botonTexto}>−</Text>
              </TouchableOpacity>
              <Text style={styles.cantidad}>{linea.cantidad}</Text>
              <TouchableOpacity
                style={styles.boton}
                onPress={() =>
                  actualizarCantidad(mesaId, linea.itemId, linea.cantidad + 1)
                }
              >
                <Text style={styles.botonTexto}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subtotal}>
              {formatearPrecio(linea.precio * linea.cantidad)}
            </Text>
          </View>
        )}
        scrollEnabled={false}
      />

      <View style={styles.totalFila}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValor}>{formatearPrecio(total)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  contenedor: { backgroundColor: '#fff', borderRadius: 12, padding: 4 },
  linea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lineaInfo: { flex: 1 },
  nombre: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  notas: { fontSize: 12, color: '#ef6c00', marginTop: 2, fontStyle: 'italic' },
  precioUnit: { fontSize: 12, color: '#999', marginTop: 2 },
  controles: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  boton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonTexto: { fontSize: 18, fontWeight: '700', color: '#444', lineHeight: 20 },
  cantidad: { fontSize: 15, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  subtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2e7d32',
    minWidth: 70,
    textAlign: 'right',
  },
  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#444' },
  totalValor: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  vacio: { padding: 30, alignItems: 'center' },
  vacioTexto: { color: '#999' },
})
